/**
 * @file fetch store of prometheus
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

/**
 * @file client of prometheus
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// 参考 https://github.com/qbox/admin-base/blob/master/common/prometheus/client.ts

// https://prometheus.io/docs/prometheus/latest/querying/api/
// https://cf.qiniu.io/display/Fusion/Kodo+Admin+Prometheus+Api+Boilerplate

import moment from 'moment'
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'

import Client, {
  InternalOptions, Output,
  ApiException, HttpException,
  InvalidOutputPayloadException
} from 'qn-fe-core/client'

import { CommonClient } from 'portal-base/common/apis/common'
import Monitor from 'portal-base/common/monitor'

import {
  PROMETHEUS_RESPONSE_ERROR_CODE_MESSAGE_MAP, PROMETHEUS_ERROR_NUM_MAP
} from 'kodo/constants/apis/proxy-error/prometheus'
import { service } from 'kodo/constants/apis'

const prefix = 'v1'

// 13 位 js timestamp
const TIMESTAMP_LENGTH = Date.now().toString().length

export interface ResponseSuccessBody<T> {
  status: Status.Success
  data: T
}

export interface ResponseErrorBody<T = any> {
  status: Status.Error
  data: T
  error?: string
  errorType?: string
}

export type ResponseBody<S, E = any> = (ResponseSuccessBody<S> | ResponseErrorBody<E>)

export type Timestamp = number // js timestamp
export type UnixTimestamp = number // unix ms timestamp / 1e3, decimals optional
export type StdDateStr = string // date && time of rfc3339
export type QueryTime = UnixTimestamp | StdDateStr
export type Time = Timestamp | QueryTime | Date
export type Duration = string // [0-9]+[smhdwy]
export type Step = Duration | number // number: float, second
export type QueryDateRange = [Time, Time]

export type QueryExpression = string
export type ErrorValue = keyof typeof PROMETHEUS_ERROR_NUM_MAP
export type Value = string | ErrorValue | null // number
export type Vector = [UnixTimestamp, Value]
export type NormalizedVector = [Timestamp, number | null] // js timestamp && js number
type VectorType = Vector | NormalizedVector

export interface Metric {
  [labelName: string]: any
}

export enum Status {
  Success = 'success',
  Error = 'error'
}

export enum ResultType {
  // Tensor = 'tensor', // 张量
  Matrix = 'matrix', // 矩阵
  Vector = 'vector', // 向量
  Scalar = 'scalar', // 标量
  String = 'string'
}

// ResultType === matrix
export interface RangeVectorsItem<M extends Metric = Metric, T extends VectorType = NormalizedVector> {
  metric: M
  values: T[]
}
export type RangeVectorsResult<M extends Metric = Metric, T extends VectorType = NormalizedVector> = (
  Array<RangeVectorsItem<M, T>>
)

// ResultType === vector
export interface InstantVectorsItem<M extends Metric = Metric, T extends VectorType = NormalizedVector> {
  metric: M
  value: T
}
export type InstantVectorsResult<M extends Metric = Metric, T extends VectorType = NormalizedVector> = (
  Array<InstantVectorsItem<M, T>>
)

// ResultType === scalar
export type ScalarResult<T extends VectorType = NormalizedVector> = T

// ResultType === string
export type StringResult = string

export type ResultShape<T extends ResultType, U extends VectorType, M extends Metric = Metric> = (
  T extends ResultType.Matrix ? RangeVectorsResult<M, U> :
  T extends ResultType.Vector ? InstantVectorsResult<M, U> :
  T extends ResultType.Scalar ? ScalarResult<U> :
  T extends ResultType.String ? StringResult :
  T extends ResultType ? (RangeVectorsResult<M, U> | InstantVectorsResult<M, U> | ScalarResult<U> | StringResult) :
  never
)

// TODO: distributive conditional types 真香… 不过后面的 ResponseSuccessBody 等也要这么搞一下吗？
export type QueryResponseData<T extends ResultType, M extends Metric = Metric> = T extends ResultType ? {
  resultType: T
  result: ResultShape<T, Vector, M>
} : never

export type QueryResponseBody<T extends ResultType, M extends Metric = Metric> = (
  ResponseBody<QueryResponseData<T, M>>
)

interface BaseOptions {
  region: string
}

interface QueryBaseOptions extends BaseOptions {
  query: QueryExpression
  timeout?: Duration
}

interface EnableAutoNormalizeOptions {
  autoNormalizeValueDisabled?: false
}

interface DisableAutoNormalizeOptions {
  autoNormalizeValueDisabled: true
}

type AutoNormalizeOptions = EnableAutoNormalizeOptions | DisableAutoNormalizeOptions

type VectorTypeByOptions<T extends AutoNormalizeOptions = AutoNormalizeOptions> = (
  T extends EnableAutoNormalizeOptions ? NormalizedVector :
  T extends DisableAutoNormalizeOptions ? Vector :
  T extends AutoNormalizeOptions ? VectorType :
  never
)

export type InstantQueryBaseOptions<U extends AutoNormalizeOptions> = QueryBaseOptions & U & {
  time?: Time
}
export type InstantQueryOptionsWithType<T extends ResultType, U extends AutoNormalizeOptions> = (
  InstantQueryBaseOptions<U> & { type: T }
)

export type TimeRangOptions = {
  start: Time
  end: Time
}

export type RangeQueryOptions<U extends AutoNormalizeOptions> = QueryBaseOptions & U & TimeRangOptions & {
  type?: ResultType.Matrix
  step: Step
}

// HACK: duck typing，不考虑史前时间线
export function isUnixTimestamp(timestamp: number): boolean {
  return Math.log10(timestamp) + 1 < TIMESTAMP_LENGTH
}

export function normalizeValue(value: Value): number | null {
  if (value == null) {
    return null
  }

  const errorNum = PROMETHEUS_ERROR_NUM_MAP[value as ErrorValue] // HACK: value type guard
  if (errorNum != null) {
    return errorNum
  }

  return Number(value)
}

export function normalizeVector(vector: Vector): NormalizedVector | null {
  if (vector == null) {
    return null
  }

  const [timestamp, value] = vector
  return [timestamp * 1e3, normalizeValue(value)]
}

export function normalizeQueryTime(time: Time): QueryTime {
  time = time || new Date()

  // StdDateStr
  if (typeof time === 'string') {
    return time
  }

  if (time instanceof Date) {
    return time.getTime() / 1e3
  }

  if (moment.isMoment(time)) {
    return time.valueOf() / 1e3 // 比 .unix() 精确
  }
  return isUnixTimestamp(time) ? time : time / 1e3
}

export function isDurationValid(duration: Duration): boolean {
  return /^[0-9]+[smhdwy]$/.test(duration)
}

function printDurationFormatError(name: 'step' | 'timeout', duration: Duration) {
  // eslint-disable-next-line no-console
  console.error([
    'Prometheus error:',
    PROMETHEUS_RESPONSE_ERROR_CODE_MESSAGE_MAP[400],
    `（参数 [${name}=${duration}] 不满足 duration 格式 [0-9]+[smhdwy]）`
  ].join(' '))
}

function isResponseBody(payload: any): payload is ResponseBody<unknown> {
  return !!(payload && typeof payload.status === 'string' && payload.data)
}

export class PrometheusApiException extends ApiException {
  constructor(public payload: ResponseErrorBody) {
    super('PrometheusApiException', payload.errorType! || Status.Error, payload.error)
  }
}

@injectable()
export class PrometheusClient extends Client {

  constructor(private commonClient: CommonClient, monitor: Monitor) {
    super()

    monitor.collectFromClient('ProeProxyClient', this)
  }

  // 1、直接标注返回类型（无运行时类型检查），更纯粹
  async instantQuery<T extends ResultType, M extends Metric>(
    options: InstantQueryBaseOptions<EnableAutoNormalizeOptions>
  ): Promise<ResultShape<T, VectorTypeByOptions<EnableAutoNormalizeOptions>, M>>
  async instantQuery<T extends ResultType, M extends Metric>(
    options: InstantQueryBaseOptions<DisableAutoNormalizeOptions>
  ): Promise<ResultShape<T, VectorTypeByOptions<DisableAutoNormalizeOptions>, M>>
  // 2、通过值标注返回类型（带运行时类型检查），更稳妥
  // TODO: improve overload, too long...
  //   1、只通过 extends 貌似无法自动推断出 AutoNormalizeOptions 里的 partial 结构，只好通过 overload 人肉展开
  //   2、typeScript 3.1+: allow partial type argument inference，从而可以留着 M 同时无需人肉展开后续作为 T 的 ResultType ..?
  //   3、+ type inference in conditional types ..?
  async instantQuery<M extends Metric>(
    options: InstantQueryOptionsWithType<ResultType.Matrix, EnableAutoNormalizeOptions>
  ): Promise<ResultShape<ResultType.Matrix, VectorTypeByOptions<EnableAutoNormalizeOptions>, M>>
  async instantQuery<M extends Metric>(
    options: InstantQueryOptionsWithType<ResultType.Vector, EnableAutoNormalizeOptions>
  ): Promise<ResultShape<ResultType.Vector, VectorTypeByOptions<EnableAutoNormalizeOptions>, M>>
  async instantQuery<M extends Metric>(
    options: InstantQueryOptionsWithType<ResultType.Scalar, EnableAutoNormalizeOptions>
  ): Promise<ResultShape<ResultType.Scalar, VectorTypeByOptions<EnableAutoNormalizeOptions>, M>>
  async instantQuery<M extends Metric>(
    options: InstantQueryOptionsWithType<ResultType.String, EnableAutoNormalizeOptions>
  ): Promise<ResultShape<ResultType.String, VectorTypeByOptions<EnableAutoNormalizeOptions>, M>>
  async instantQuery<M extends Metric>(
    options: InstantQueryOptionsWithType<ResultType.Matrix, DisableAutoNormalizeOptions>
  ): Promise<ResultShape<ResultType.Matrix, VectorTypeByOptions<DisableAutoNormalizeOptions>, M>>
  async instantQuery<M extends Metric>(
    options: InstantQueryOptionsWithType<ResultType.Vector, DisableAutoNormalizeOptions>
  ): Promise<ResultShape<ResultType.Vector, VectorTypeByOptions<DisableAutoNormalizeOptions>, M>>
  async instantQuery<M extends Metric>(
    options: InstantQueryOptionsWithType<ResultType.Scalar, DisableAutoNormalizeOptions>
  ): Promise<ResultShape<ResultType.Scalar, VectorTypeByOptions<DisableAutoNormalizeOptions>, M>>
  async instantQuery<M extends Metric>(
    options: InstantQueryOptionsWithType<ResultType.String, DisableAutoNormalizeOptions>
  ): Promise<ResultShape<ResultType.String, VectorTypeByOptions<DisableAutoNormalizeOptions>, M>>
  // all
  @autobind
  async instantQuery(
    options: (
      InstantQueryBaseOptions<AutoNormalizeOptions> | InstantQueryOptionsWithType<ResultType, AutoNormalizeOptions>
    )
  ): Promise<ResultShape<ResultType, VectorType, Metric>> {
    const { region, autoNormalizeValueDisabled, ...params } = options

    if (params.timeout && !isDurationValid(params.timeout)) {
      printDurationFormatError('timeout', params.timeout)
    }

    if (params.time) {
      params.time = normalizeQueryTime(params.time)
    }

    const data = await this.get<QueryResponseData<ResultType>>(
      `${service.prometheus}/${region}/${prefix}/query`,
      params,
      {
        producePayload: async (send: () => Promise<Output<QueryResponseData<ResultType>>>) => {
          const output = await send()
          const result = output.payload

          // 防止数据为空
          if (result.result == null) {
            throw new InvalidOutputPayloadException(result)
          }

          // 如果响应与类型不匹配，抛出错误，是否该这么干？
          if ('type' in options && result.resultType !== options.type) {
            // eslint-disable-next-line no-console
            console.error([
              'Prometheus error:',
              `expect type [${options.type}],`,
              `but [${result.resultType}] received.`
            ].join(' '))

            throw new InvalidOutputPayloadException(result)
          }

          return output
        }
      }
    )

    if (autoNormalizeValueDisabled) {
      return data.result
    }

    if (data.resultType === ResultType.String) {
      return data.result
    }

    if (data.resultType === ResultType.Scalar) {
      return normalizeVector(data.result)!
    }

    if (data.resultType === ResultType.Vector) {
      return data.result.map(
        ({ metric, value }) => ({
          metric,
          value: normalizeVector(value)!
        })
      )
    }

    if (data.resultType === ResultType.Matrix) {
      return data.result.map(
        ({ metric, values }) => ({
          metric,
          values: values.map(v => normalizeVector(v)!)
        })
      )
    }

    throw new Error('unknown prometheus result type')
  }

  // ResultType.matrix only
  async rangeQuery<M extends Metric>(
    options: RangeQueryOptions<EnableAutoNormalizeOptions>
  ): Promise<RangeVectorsResult<M, VectorTypeByOptions<EnableAutoNormalizeOptions>>>
  async rangeQuery<M extends Metric>(
    options: RangeQueryOptions<DisableAutoNormalizeOptions>
  ): Promise<RangeVectorsResult<M, VectorTypeByOptions<DisableAutoNormalizeOptions>>>
  @autobind
  async rangeQuery(
    options: RangeQueryOptions<AutoNormalizeOptions>
  ): Promise<RangeVectorsResult<Metric, VectorTypeByOptions<AutoNormalizeOptions>>> {
    // TODO: check ts 3+:  const { ...rest } = options as T  =>  Rest types may only be created from object types
    const { region, autoNormalizeValueDisabled, type, ...params } = options

    if (params.timeout && !isDurationValid(params.timeout)) {
      printDurationFormatError('timeout', params.timeout)
    }
    if (params.step && typeof params.step === 'string' && !isDurationValid(params.step)) {
      printDurationFormatError('step', params.step)
    }

    if (params.start) {
      params.start = normalizeQueryTime(params.start)
    }
    if (params.end) {
      params.end = normalizeQueryTime(params.end)
    }

    const data = await this.get<QueryResponseData<ResultType.Matrix, Metric>>(
      `${service.prometheus}/${region}/${prefix}/query_range`,
      params,
      {
        producePayload: async (send: () => Promise<Output<QueryResponseData<ResultType>>>) => {
          const output = await send()
          const result = output.payload

          if (result.result == null) {
            throw new InvalidOutputPayloadException(result)
          }

          return output
        }
      }
    )

    if (autoNormalizeValueDisabled) {
      return data.result
    }

    return data.result.map(
      ({ metric, values }) => ({
        metric,
        values: values.map(v => normalizeVector(v)!)
      })
    )
  }

  // https://prometheus.io/docs/prometheus/latest/querying/api/#getting-label-names
  @autobind
  getLabelNames(options: BaseOptions & Partial<TimeRangOptions>): Promise<string[]> {
    const { region, ...params } = options

    if (params.start) {
      params.start = normalizeQueryTime(params.start)
    }

    if (params.end) {
      params.end = normalizeQueryTime(params.end)
    }

    return this.get(`${service.prometheus}/${region}/${prefix}/labels`, params)
  }

  // https://prometheus.io/docs/prometheus/latest/querying/api/#querying-label-values
  @autobind
  getLabelValues(options: BaseOptions & Partial<TimeRangOptions> & { name: string }): Promise<string[]> {
    const { region, name, ...params } = options

    if (params.start) {
      params.start = normalizeQueryTime(params.start)
    }

    if (params.end) {
      params.end = normalizeQueryTime(params.end)
    }

    return this.get(`${service.prometheus}/${region}/${prefix}/label/${name}/values`, params)
  }

  protected async _send(url: string, options: InternalOptions) {
    let output: Output
    try {
      output = await this.commonClient.send(url, options)
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err.withMessage(PROMETHEUS_RESPONSE_ERROR_CODE_MESSAGE_MAP[
          err.code as keyof typeof PROMETHEUS_RESPONSE_ERROR_CODE_MESSAGE_MAP
        ])
      }
      throw err
    }

    const { payload } = output

    // 防止数据为空
    if (!isResponseBody(payload)) {
      throw new InvalidOutputPayloadException(payload)
    }

    // 内容确定是一个 prometheus 错误
    if (payload.status === Status.Error) {
      throw new PrometheusApiException(payload)
    }

    // 防止万一 status 不符合预期
    if (payload.status !== Status.Success) {
      throw new InvalidOutputPayloadException(payload)
    }

    return {
      ...output,
      payload: payload.data
    }
  }
}
