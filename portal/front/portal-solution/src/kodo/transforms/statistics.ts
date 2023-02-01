/**
 * @file functions to deal statistics data
 * @author hovenjay <hovenjay@outlook.com>
 */

import { totalOfSeriesName } from 'kodo/constants/chart'
import { fiveMinutesSeconds } from 'kodo/constants/date-time'
import { StorageType } from 'kodo/constants/statistics'

import { IFlowData, IFlowValue, IGroupedReportBaseData } from 'kodo/apis/statistics'

export interface IPeakFlow {
  time?: string
  flow?: number
}

export interface IPeakFlowOfGroup {
  time?: string
  flow?: number
  group?: string
}

export function hasPreDelQueryOption(storageType: StorageType) {
  // 只有存储类型不为标准存储时才支持查询提前删除的文件
  return storageType !== StorageType.Standard
}

export function isValidFlowValue(value: any): value is IFlowValue {
  return Boolean(value && Number.isFinite(value.flow))
}

export function flowToBandwidth(flow: number): number {
  return flow * 8 / fiveMinutesSeconds
}

export function countTheGroupByFlowData(flowData: IFlowData<IFlowValue>) {
  if (!Array.isArray(flowData) || !flowData[0] || isValidFlowValue(flowData[0].values)) { return }
  return Object.keys(flowData[0].values).length
}

/**
 * 按指定的时间间隔，将源数据划分为多个区间，返回各区间起止时间点下标
 *
 * 以 getRangesByInterval(251, 100) 为例：
 * 返回值示例：[ 0, 100, 200, 251 ]
 * 区间表示为：[0, 100)、[100, 200)、[200, 251)
 *
 * @param numOfTimePoints - 数据源中时间点点数量
 * @param interval - 区间间隔
 * @returns 返回各区间起止时间点的下标
 */
export function getRangesByInterval(numOfTimePoints: number, interval: number): number[] {
  const partCount = numOfTimePoints / interval

  if (!Number.isFinite(partCount)) { return [] }

  const parts = Array(Math.ceil(partCount)).fill(0)
  parts.forEach((_, idx) => { parts[idx] = idx > 0 ? parts[idx - 1] + interval : 0 })
  parts.push(numOfTimePoints)

  return parts
}

/**
 * 求源数据某时刻的 `values` 字段流量数据的总和
 *
 * @param values - 某时刻各空间或域名的汇总数据或者分组后的数据
 * @returns 返回流量汇总值
 */
export function sumFlowOfTime(values: IFlowValue | IGroupedReportBaseData<IFlowValue>['values']): number {
  if (isValidFlowValue(values)) return values.flow

  return Object.values<IFlowValue>(values).reduce(
    (prev, val) => (isValidFlowValue(val) ? prev + val.flow : prev),
    0
  )
}

/**
 * 获取总峰值流量信息
 *
 * @param data - 源数据
 */
export function getPeakFlow(data: IFlowData<IFlowValue>) {
  if (!data) { return {} }

  return data.reduce<IPeakFlow>(
    (peak, { time, values }) => {
      const flow = sumFlowOfTime(values)
      return peak.flow == null || peak.flow < flow ? { time, flow } : peak
    },
    {}
  )
}

/**
 * 获取指定分组中的峰值流量信息
 *
 * @param data - 源数据
 * @param group - 分组名称，按空间分组时为空间名称，按域名分组时为域名
 */
export function getPeakFlowOfGroup(data: IFlowData<IFlowValue>, group: string) {
  if (!data) { return {} }

  return data.reduce<IPeakFlowOfGroup>(
    (peak, { time, values }) => {
      if (!isValidFlowValue(values[group])) { return peak }

      return peak.flow == null || peak.flow < values[group].flow
        ? { time, flow: values[group].flow, group }
        : peak
    },
    {}
  )
}

/**
 * 计算各个时间点点汇总值
 *
 * @param data - 请求返回的原始的流量数据
 * @param [excludes = []] - 可选，需要排除不计入结果的数据组的名称
 */
export function getTotalFlowOfTimeByFlowData(data: IFlowData<IFlowValue>, excludes: string[] = []): number[] {
  if (!data) { return [] }

  return data.map(
    ({ values }) => {
      if (isValidFlowValue(values)) { return values.flow }

      return Object.entries(values).reduce(
        (prev, [group, cur]) => (
          group === totalOfSeriesName || excludes.includes(group) ? prev : cur.flow + prev
        ),
        0
      )
    }
  )
}

/**
 * 使用数据统计接口返回的原始流量数据计算 95 分位值
 *
 * @param data - 请求返回的原始的流量数据
 * @param [excludes = []] - 可选，需要排除不计入结果的数据组的名称
 * @returns 95 分位值
 */
export function getNumOf95thPercentileByFlowData(
  data: IFlowData<IFlowValue>,
  excludes: string[] = []
): number {
  const list = data
    ? data.map(
      ({ values }) => {
        if (isValidFlowValue(values)) { return values.flow }

        return Object.entries(values).reduce(
          (prev, [group, cur]) => (
            excludes.includes(group) || group === totalOfSeriesName ? prev : cur.flow + prev
          ),
          0
        )
      }
    )
    : []

  list.sort((a, b) => b - a)
  const index = Math.max(0, Math.floor(list.length * 0.05) - 1)
  return list[index] ? list[index] : 0
}
