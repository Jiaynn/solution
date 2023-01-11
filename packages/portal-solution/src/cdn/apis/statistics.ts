import moment from 'moment'
import { isEmpty } from 'lodash'
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'

import concurrency from 'cdn/utils/concurrency'

import { getRegionList } from 'cdn/transforms/region'

import { transformBatchFetchAccessTopResponse, transformBatchFetchDownloadSpeed } from 'cdn/transforms/statistics'

import { RFC3339Format } from 'cdn/constants/datetime'
import { TaskState } from 'cdn/constants/video-slim'
import { FlowDirection, logAnalysisDateFormat } from 'cdn/constants/statistics'
import { prefix } from 'cdn/constants/api'
import { TrafficProtocol } from 'cdn/constants/domain'
import { TrafficRegion } from 'cdn/constants/traffic-region'

import CommonClient from './clients/common'
import VideoSlimClient from './clients/video-slim'
import DefyTrafficClient from './clients/defy-traffic'
import DefyAnalysisClient from './clients/defy-analysis'

const getUrl = (url: string) => `${prefix}/statistics/portal/${url}`

function getStatisticsParams(
  params: {
    startDate: moment.Moment
    endDate: moment.Moment
    region?: string[]
    [otherProps: string]: any
  }
) {
  const { startDate, endDate, region, ...others } = params

  const regions = getRegionList(region, true)

  return {
    ...others,
    startDate: startDate.format(logAnalysisDateFormat),
    endDate: endDate.format(logAnalysisDateFormat),
    regions
  }
}

export type Freq = '1day' | '1hour' | '5min'

export interface IBasicOptions {
  domains: string[],
  startDate: moment.Moment,
  endDate: moment.Moment
}

export interface IBasicOptionsWithRegionsAndIsp extends IBasicOptions {
  region: string[]
  isp: string
}

export interface IUsageOptions extends IBasicOptions {
  region: string[]
  freq: Freq
  group: GroupType
}

export interface IUsageOptionsWithRegionsAndIsp extends IBasicOptionsWithRegionsAndIsp {
  freq: Freq
  group: GroupType
  flowDirection?: FlowDirection
  fullDomainsChecked?: boolean
}

export interface IStaticAndDynamicDomains {
  static: string[],
  dynamic: string[]
}

export interface ITimelineOptions extends IBasicOptions {
  freq: Freq
}

export interface IAccessOptions extends IBasicOptions {
  region: string[]
}

export type TopType = 'traffic' | 'reqcount'

export interface IDownloadSpeedOptions extends IBasicOptions {
  region: string[]
  isp: string
}

export interface IDownloadSpeedData {
  regions: string[]
  value: number[]
}

// 数据统计 - 视频瘦身（效用部分）
export interface IVideoSlimOptions extends IBasicOptions {}

export interface IVideoSlimBenefitValue {
  reqCount: number // 请求次数
  traffic: number // 流量
  save: number // 节省流量
}

interface IVideoSlimTimelineData<T> {
  time: number[] // 单位: s
  value: T[]
  total: T
}

export type IVideoSlimBenefitTimelineData = IVideoSlimTimelineData<IVideoSlimBenefitValue>

export interface IVideoSlimTopNURLOptions extends IVideoSlimOptions {
  topN: number
}

export type IVideoSlimTopNURLData = Array<IVideoSlimBenefitValue & {
  url: string
}>

// 数据统计 - 视频瘦身（使用部分）
export interface IVideoSlimUsageValue {
  slimCount: number // 瘦身次数
  time2K: number // 2K 视频时长
  timeHD: number // HD 视频时长
  timeSD: number // SD 视频时长
}

export type IVideoSlimUsageTimelineData = IVideoSlimTimelineData<IVideoSlimUsageValue>

export interface IVideoSlimUsageOptions extends IVideoSlimOptions {
  states: TaskState[]
  deletedAndLastStateSlimSuccess: boolean
}

export type TrafficFreq = 'day' | 'hour' | '5min'

// 指定数据分类方式
export type GroupType =
  | ''        // 按使用量堆叠
  | 'domain'  // 按域名堆叠
  | 'geoCover'// 按区域堆叠

export type BandwidthDataType =
  | 'bandwidth'   // 静态带宽数据
  | 'dynbandwidth'// 动态加速带宽数据
  | 'all'         // 静态/动态
  | 'pdnbandwidth'// pcdn 带宽数据
  | 'upbandwidth' // 上行带宽
  | '302bandwidth' // 查询 302 业务带宽
  | '302bandwidth+' // 查询 302 业务 + 静态 CDN 总流量

export type FlowDataType =
  | 'flux'    // 静态流量数据
  | 'dynflux' // 动态流量数据
  | 'all'     // 静态/动态
  | 'pdnflux' // pcdn 流量数据
  | 'upflux'  // 上行流量
  | '302flow' // 查询 302 业务流量
  | '302flow+' // 查询 302 业务 + 静态 CDN 总流量

export type ReqcountDataType = 'dynreqcount' // 动态请求数

export interface IGetStatisticsOptions {
  start: string // 20180801000000
  end: string   // 20180801000000
  g: TrafficFreq
  group: GroupType
  domains?: string[]
  regions?: string[]
}

export interface IStatisticsSummary {
  peak: {
    time: number
    value: number
  }
  peak95: {
    time: number
    value: number
  }
  peak95Avrage: number
  peakAvrage: number
}

export interface IStatisticsGroupByDomain {
  data: {
    time: number[],
    [k: string]: number[]
  }
  stats: IStatisticsSummary
}

export interface IStatisticsGroupByGeoCover {
  data: {
    time: number[],
    oversea: number[]
    china: number[]
  }
  stats: IStatisticsSummary
}

export interface IStatisticsGroupByUsage {
  data: {
    time: number[],
    cdnPoints: number[]
    pcdnPoints: number[]
    dcdnPoints: number[]
    '302Points': number[]
    '302Points+': number[]
  }
  stats: IStatisticsSummary
}

export interface IGetBandwidthOptions extends IGetStatisticsOptions {
  type: BandwidthDataType
}

export interface IGetFlowOptions extends IGetStatisticsOptions {
  type: FlowDataType
}

export interface IGetReqcountOptions extends IGetStatisticsOptions {
  type?: ReqcountDataType
}

export type StatisticsPayloadType<T extends GroupType> =
  | T extends '' ? IStatisticsGroupByUsage : never
  | T extends 'domain' ? IStatisticsGroupByDomain: never
  | T extends 'geoCover' ? IStatisticsGroupByGeoCover: never

export type TrafficUserType =
  | 'flux'    // 静态流量数据
  | '302flow' // 动态 302 流量
  | '302flow+' // 静态 + 动态 302 流量
  | 'upflux'    // 上行流量数据
  | 'dynflux' // 动态流量数据
  | 'pdnflux' // pcdn 流量数据
  | 'bandwidth' // 带宽
  | '302bandwidth' // 动态 302 带宽
  | '302bandwidth+' // 静态 + 动态 302 带宽
  | 'upbandwidth' // 上行带宽
  | 'dynbandwidth' // 动态加速带宽
  | 'pdnbandwidth' // pcdn 业务带宽
  | 'bidiflow' // dcdn 动态 + 静态流量
  | 'bidibandwidth' // dcdn 动态 + 静态带宽

export interface IGetTrafficUserOptions {
  start: string // 日期格式 yyyy-mm-dd
  end: string
  type: TrafficUserType
  g?: TrafficFreq // 查询粒度
  topn?: number // 指定要返回的 top 域名列表集合
  protocol: TrafficProtocol
  region: TrafficRegion
}

export type TrafficUserDomain = {
  avrPeak: number
  avrPeak95: number
  name: string
  peak: number
  peak95: number
  points: number[]
}

export interface ITrafficUserResponse {
  domain_cnt: number
  domains: TrafficUserDomain[]
  total: Omit<TrafficUserDomain, 'name'>
}

export type AnalysisFreq = '5min' | '1hour' | '1day'

export interface IGetAnalysisOptions {
  startDate: string // 2017-08-04-10-05
  endDate: string   // 2017-08-04-10-05
  domains: string[]
  regions: string[]
  freq: AnalysisFreq
  isp: string
}

export interface IAnalysisResponse {
  time: number[]
  value: number[]
}

const defaultAnalysisData: IAnalysisResponse = { time: [], value: [] }

export type AnalysisBaseOptions = {
  domains: string[]
  startDate: string // 2017-08-04-10-05
  endDate: string   // 2017-08-04-10-05
  freq: AnalysisFreq
}

export type AnalysisCodeOptions = AnalysisBaseOptions & {
  region: 'global'
}

export type AnalysisCodeResponse = {
  codes: {
    [statusCode: number]: number[]
  }
  points: string[]
}

export type AnalysisUvOptions = AnalysisBaseOptions & {
  region: 'global'
}

export type AnalysisUvResponse = {
  uvCount: number[]
  points: string[]
}

export type AnalysisTopOptions = Omit<AnalysisBaseOptions, 'freq'> & {
  region: string
}

export type BatchFetchTopOptions = Omit<AnalysisBaseOptions, 'freq'> & {
  regions: string[]
}

export type BatchAccessTopItem = { key: string, value: number }

export type TopUrlByFlowResponse = {
  traffic: number[]
  urls: string[]
}

export type TopUrlByReqcountResponse = {
  count: number[]
  urls: string[]
}

export type TopIpByFlowResponse = {
  traffic: number[]
  ips: string[]
}

export type TopIpByReqcountResponse = {
  count: number[]
  ips: string[]
}

export type TopCommonResponse = {
  keys: string[]
  values: number[]
}

// FIXME: 部分接口类型缺失
@injectable()
export default abstract class StatisticsApis {
  constructor(
    private commonClient: CommonClient,
    private videoSlimClient: VideoSlimClient,
    private trafficClient: DefyTrafficClient,
    private analysisClient: DefyAnalysisClient
  ) {}

  abstract apiPaths: {
    trafficFlow: string
    trafficBandwidth: string
    trafficUser: string
  }

  // 获取 状态码 时间线+详情
  fetchStatusCode(payload: AnalysisCodeOptions) {
    return this.analysisClient.post<{ data: AnalysisCodeResponse }>('/v1/portal/statuscode', payload)
      .then(res => res.data || { codes: {}, points: [] })
  }

  // 获取 命中率 时间线
  fetchHitRatioTimeline(params: ITimelineOptions) {
    return this.commonClient.post<any>(
      getUrl('hitrate'),
      getStatisticsParams(params)
    )
  }

  // 获取 命中／未命中 统计
  fetchHitMiss(params: IBasicOptions) {
    return this.commonClient.post<any>(
      getUrl('hitmiss'),
      getStatisticsParams(params)
    )
  }

  // 获取 UV 时间线
  fetchUvTimeline(payload: AnalysisUvOptions) {
    return this.analysisClient.post<{ data: AnalysisUvResponse }>('/v1/portal/uniquevisitor', payload)
      .then(res => res.data || { uvCount: [], points: [] })
  }

  @autobind
  fetchTopUrlByFlow(payload: AnalysisTopOptions) {
    return this.analysisClient.post<{ data: TopUrlByFlowResponse }>('/v1/portal/toptrafficurl', payload)
      .then(res => ({ keys: res.data?.urls || [], values: res.data?.traffic || [] }))
  }

  @autobind
  fetchTopUrlByReqcount(payload: AnalysisTopOptions) {
    return this.analysisClient.post<{ data: TopUrlByReqcountResponse }>('/v1/portal/topcounturl', payload)
      .then(res => ({ keys: res.data?.urls || [], values: res.data?.count || [] }))
  }

  @autobind
  fetchTopIpByFlow(payload: AnalysisTopOptions) {
    return this.analysisClient.post<{ data: TopIpByFlowResponse }>('/v1/portal/toptrafficip', payload)
      .then(res => ({ keys: res.data?.ips || [], values: res.data?.traffic || [] }))
  }

  @autobind
  fetchTopIpByReqcount(payload: AnalysisTopOptions) {
    return this.analysisClient.post<{ data: TopIpByReqcountResponse }>('/v1/portal/topcountip', payload)
      .then(res => ({ keys: res.data?.ips || [], values: res.data?.count || [] }))
  }

  /** 批量发送请求获取 top url / ip */
  batchFetchAccessTop(
    fetchTopFn: (options: AnalysisTopOptions) => Promise<TopCommonResponse>,
    payload: BatchFetchTopOptions
  ): Promise<BatchAccessTopItem[]> {
    const taskRequest = concurrency(fetchTopFn, 5)
    const { regions, ...restPayload } = payload
    const regionTasks = regions.map(region => ({ region, ...restPayload }))

    return taskRequest(regionTasks).then(res => transformBatchFetchAccessTopResponse(res))
  }

  @autobind
  fetchDownloadSpeed(options: IDownloadSpeedOptions) {
    return this.commonClient.post<IDownloadSpeedData>(getUrl('download-speed'), getStatisticsParams(options))
  }

  async batchFetchDownloadSpeed(options: IDownloadSpeedOptions): Promise<IDownloadSpeedData> {
    const taskRequest = concurrency(this.fetchDownloadSpeed, 5)
    const { region, ...restProps } = options
    const regionTasks = region.map(item => ({ region: [item], ...restProps }))

    return taskRequest(regionTasks).then(result => transformBatchFetchDownloadSpeed(options.region, result))
  }

  fetchVideoSlimBenefitTimeline(options: IVideoSlimOptions) {
    return this.commonClient.post<IVideoSlimBenefitTimelineData>(getUrl('videoslim/timeline'), getStatisticsParams(options))
  }

  fetchVideoSlimTopNURL(options: IVideoSlimTopNURLOptions) {
    return this.commonClient.post<IVideoSlimTopNURLData>(getUrl('videoslim/topurl'), getStatisticsParams(options))
  }

  fetchVideoSlimUsageTimeline(options: IVideoSlimUsageOptions): Promise<IVideoSlimUsageTimelineData> {
    return this.videoSlimClient.post('/get/task/timeline', {
      domains: options.domains,
      rangeGTE: options.startDate.format(RFC3339Format),
      rangeLT: options.endDate.format(RFC3339Format),
      states: options.states,
      deletedAndLastStateSlimSuccess: options.deletedAndLastStateSlimSuccess
    })
  }

  // 获取流量数据（计量）
  fetchFlowTimeline<T extends GroupType = ''>(options: IGetFlowOptions) {
    return this.trafficClient.post<StatisticsPayloadType<T>>(this.apiPaths.trafficFlow, options)
  }

  // 获取带宽数据（计量）
  fetchBandwidthTimeline<T extends GroupType = ''>(options: IGetBandwidthOptions) {
    return this.trafficClient.post<StatisticsPayloadType<T>>(this.apiPaths.trafficBandwidth, options)
  }

  // 获取请求数数据（计量）
  fetchReqcountTimeline<T extends GroupType = ''>(options: IGetReqcountOptions) {
    return this.trafficClient.post<StatisticsPayloadType<T>>('/v1/traffic/domains/reqcount', options)
  }

  // 用户级统计（计量）
  fetchTrafficUser(options: IGetTrafficUserOptions) {
    return this.trafficClient.post<ITrafficUserResponse>(this.apiPaths.trafficUser, options)
  }

  // 获取流量数据 (日志)
  @autobind
  fetchAnalysisFlow(options: IGetAnalysisOptions) {
    return this.analysisClient.post<{data: IAnalysisResponse}>('/v1/portal/traffic', options)
      .then(res => (isEmpty(res.data) ? defaultAnalysisData : res.data))
  }

  // 获取带宽数据 (日志)
  @autobind
  fetchAnalysisBandwidth(options: IGetAnalysisOptions) {
    return this.analysisClient.post<{data: IAnalysisResponse}>('/v1/portal/bandwidth', options)
      .then(res => (isEmpty(res.data) ? defaultAnalysisData : res.data))
  }

  // 获取请求数数据 (日志)
  @autobind
  fetchAnalysisReqCount(options: IGetAnalysisOptions) {
    // 后端默认传递空 domains 会返回当前用户所有域名的统计信息
    // 这里是为了兼容 OEM 前端传递空数组返回空数据的行为
    if (isEmpty(options.domains)) {
      return Promise.resolve(defaultAnalysisData)
    }

    return this.analysisClient.post<{data: IAnalysisResponse}>('/v1/portal/reqcount/ex', options)
      .then(res => (isEmpty(res.data) ? defaultAnalysisData : res.data))
  }
}

export class CdnStatisticsApis extends StatisticsApis {
  apiPaths = {
    trafficFlow: '/v1/traffic/domains/flow',
    trafficBandwidth: '/v1/traffic/domains/bandwidth',
    trafficUser: '/v1/admin/traffic/user'
  }
}

export class DcdnStatisticsApis extends StatisticsApis {
  apiPaths = {
    trafficFlow: '/v2/dcdn/traffic/domains/flow',
    trafficBandwidth: '/v2/dcdn/traffic/domains/bandwidth',
    trafficUser: '/v2/admin/dcdn/traffic/user'
  }
}
