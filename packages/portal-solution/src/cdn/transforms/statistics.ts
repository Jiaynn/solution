
import { RawLocaleMessage, mapMessageValues } from 'portal-base/common/i18n'
import moment, { Moment } from 'moment'
import { sum, max, zip, unzip, values, isEmpty, sortBy, groupBy } from 'lodash'

import { containChinaRegions, containOtherRegions, containAllRegions, getRegionList } from 'cdn/transforms/region'
import { combineForeignRegions } from 'cdn/transforms/traffic-region'

import { unknown as unknownMessage } from 'cdn/locales/messages'
import * as messages from 'cdn/locales/messages'

import { TrafficRegion } from 'cdn/constants/traffic-region'
import { allTrafficProtocols } from 'cdn/constants/domain'
import { isps } from 'cdn/constants/isp'
import { trafficAreas } from 'cdn/constants/region'
import {
  summaryNameMap, diagramTypeNameMap, SearchType, leisureStartHour, leisureEndHour, daytimeStartHour, daytimeEndHour,
  nightBandwidthStartHour, nightBandwidthEndHour, nightBandwidth2StartHour, nightBandwidth2EndHour, nightBandwidth2Date,
  FlowDirection, trafficSimpleDateFormat, trafficFreqTimesMap, maxStackByDomainCount, logAnalysisDateFormat } from 'cdn/constants/statistics'

import { IBandwidthSummary } from 'cdn/components/Statistics/Usage/stores/base'
import { ISearchOptionProps } from 'cdn/components/Statistics/Search/store'

import {
  Freq, IUsageOptionsWithRegionsAndIsp, IGetStatisticsOptions, IGetAnalysisOptions,
  IGetFlowOptions, IGetBandwidthOptions, IStatisticsGroupByUsage, IDownloadSpeedData,
  IGetTrafficUserOptions, TopCommonResponse, BatchAccessTopItem, FlowDataType, BandwidthDataType, TrafficUserType
} from 'cdn/apis/statistics'

import { ISeriesData, IBarSeriesData, IPieSeriesData } from './chart'

interface IDateRangeLimit {
  value: number,
  unit: moment.unitOfTime.Diff
}

export function isOptionsValid(options: Partial<ISearchOptionProps>, type: SearchType): boolean {
  return !checkOptions(options, type)
}

export const checkOptionsMsgs = {
  emptyOptions: {
    cn: '选项不能为空',
    en: 'Cannot be null'
  },
  emptyDomains: {
    cn: '请选择域名',
    en: 'Please select a domain name'
  },
  emptyDateRange: {
    cn: '请选择开始时间和结束时间',
    en: 'Please select the start time and end time'
  },
  invalidDateRange: {
    cn: (month: number) => `时间范围不得超过 ${month} 个月`,
    en: (month: number) => `The time range shall not exceed ${month} months`
  },
  emptyGranularity: {
    cn: '请选择时间粒度',
    en: 'Please select time granularity'
  },
  emptyRegions: {
    cn: '请勾选地区',
    en: 'Please select a region'
  },
  emptyIsp: {
    cn: '请选择运营商',
    en: 'Please select an ISP'
  }
}

export function checkOptions(options: Partial<ISearchOptionProps>, type: SearchType) {
  if (isEmpty(options)) {
    return checkOptionsMsgs.emptyOptions
  }

  // 按计量区域搜索，即调用的计量接口
  const isTrafficSearch = [SearchType.Flow, SearchType.Bandwidth, SearchType.NightBandwidth].indexOf(type) !== -1

  // 用量统计页面使用计量区域
  const regions = isTrafficSearch ? options.trafficRegions : options.region

  // 公共的必填项：域名
  // 用量统计页面如果选择的全量域名时，不校验
  if (!(isTrafficSearch && options.fullDomainsChecked)) {
    if (!options.domains || options.domains.length === 0) {
      return checkOptionsMsgs.emptyDomains
    }
  }

  // 公共的必填项：时间范围
  if (!options.startDate || !options.endDate) {
    return checkOptionsMsgs.emptyDateRange
  }

  // 由于 antd 的 RangePicker 组件不支持限制选择的时间区间长度，
  // 所以短时间内没法做到和旧版一样的“在选择时间时，动态 disable 掉 3 个月之外的日期”
  // 因此暂时先用文案提示
  const rangeLimit: IDateRangeLimit = {
    value: isTrafficSearch ? 3 : 1, // 计量统计限制 3 个月，日志分析限制 1 个月
    unit: 'M'
  }

  if (options.endDate.diff(options.startDate, rangeLimit.unit, true) > rangeLimit.value) {
    return mapMessageValues(checkOptionsMsgs.invalidDateRange, fn => fn(rangeLimit.value))
  }

  switch (type) {
    case SearchType.Flow:
    case SearchType.Bandwidth:
    case SearchType.NightBandwidth:
      if (!options.freq) {
        return checkOptionsMsgs.emptyGranularity
      }
      if (!regions || regions.length === 0) {
        return checkOptionsMsgs.emptyRegions
      }
      return
    case SearchType.Access:
    case SearchType.Uv:
    case SearchType.VideoSlim:
      return
    case SearchType.Top:
      if (!regions || regions.length === 0) {
        return checkOptionsMsgs.emptyRegions
      }
      return
    case SearchType.Speed:
      if (!options.freq) {
        return checkOptionsMsgs.emptyGranularity
      }
      if (!regions || regions.length === 0) {
        return checkOptionsMsgs.emptyRegions
      }
      if (!options.isp) {
        return checkOptionsMsgs.emptyIsp
      }
      return
    default:
      if (!options.freq) {
        return checkOptionsMsgs.emptyGranularity
      }
  }
}

export type LineSeriesData = { time: number[], [valueProp: string]: number[] }

export function transformNormalLineSeries<T extends RawLocaleMessage | string>(
  data: LineSeriesData,
  parseSeriesName: (name: string) => T
): Array<ISeriesData<T>> {
  const res: Array<ISeriesData<T>> = []
  Object.keys(data).forEach(
    seriesName => {
      if (seriesName !== 'time') {
        const item: ISeriesData<T> = {
          name: parseSeriesName(seriesName),
          data: zip(data.time, data[seriesName]) as Array<[number, number]>,
          total: sum(data[seriesName]),
          max: max(data[seriesName])
        }
        res.push(item)
      }
    }
  )
  return res
}

export function transformNormalPieSeries(data: {[key: string]: number}, seriesName?: string): IPieSeriesData[] {
  const pieSeries = Object.keys(data).map(
    key => [key, data[key]] as [string, number]
  )
  return [{
    name: seriesName || 'series 1',
    data: pieSeries,
    total: sum(values(data))
  }]
}

// 状态码详情 饼状图
export function transformCodePieSeries(
  data: Array<{code: number, count: number, percent: number}>,
  seriesName?: string
): IPieSeriesData[] {
  const pieSeries = data.sort((prev, next) => next.count - prev.count).map(
    item => [item.code.toString(), item.count] as [string, number]
  )
  return [{
    name: seriesName || 'series 1',
    data: pieSeries
  }]
}

export function transformColumnSeries<T>(
  data: T,
  getCategory: (data: T) => number[] | string[],
  getValue: (data: T) => number[],
  getSeriesName: () => string,
  humanizeCategory: (value: number | string) => string = val => String(val)
): IBarSeriesData {
  const zippedData = zip<number | string>(getCategory(data), getValue(data)).sort(
    (prev, next) => +next[1]! - +prev[1]!
  )
  const unzippedData = unzip(zippedData)
  return {
    categories: (unzippedData[0] || []).map(category => humanizeCategory(category!)),
    data: [{
      name: getSeriesName(),
      data: unzippedData[1] as number[] || []
    }]
  }
}

export function humanizeUsageSummaryName(name: string) {
  return summaryNameMap[name] ?? unknownMessage
}

export function getAllSeriesTotal(series: ISeriesData[]) {
  const lineTotals = series.map(item => item.total)
  return sum(lineTotals)
}

export function getSummaries(
  data: LineSeriesData,
  mapTotal?: (data: any) => number[]
) {
  const totalDataCol = mapTotal ? mapTotal(data) : data.total
  const leisureDataCol = data.time.map((time, idx) => {
    const hours = new Date(time).getHours()
    if (hours >= leisureStartHour && hours < leisureEndHour) {
      return totalDataCol[idx]
    }
    return 0
  })
  const daytimeDataCol = data.time.map((time, idx) => {
    const hours = new Date(time).getHours()
    if (hours >= daytimeStartHour && hours < daytimeEndHour) {
      return totalDataCol[idx]
    }
    return 0
  })

  return {
    total: sum(totalDataCol),
    totalInLeisure: sum(leisureDataCol),
    totalInDaytime: sum(daytimeDataCol)
  }
}

export function getExportName(start: Moment, end: Moment, item: string) {
  const format = 'YYYY-MM-DD'
  const startDate = start.clone().format(format)
  const endDate = end.clone().format(format)

  return `${startDate}_to_${endDate}_${item}`
}

export function humanizeDiagramTypeName(name: string) {
  return diagramTypeNameMap[name] || messages.unknown
}

export function isAreaAndAllIsp(option: IUsageOptionsWithRegionsAndIsp): boolean {
  const isArea = containAllRegions(option.region)
    || containChinaRegions(option.region, true)
    || containOtherRegions(option.region, true)
  return isArea && option.isp === isps.all
}

/**
 * 根据给定的 regions 获取 areas
 */
export function getAreasByRegions(regions: string[]): string[] {
  if (containAllRegions(regions)) {
    return [trafficAreas.china, trafficAreas.foreign]
  }
  if (containChinaRegions(regions, true)) {
    return [trafficAreas.china]
  }
  if (containOtherRegions(regions, true)) {
    return [trafficAreas.foreign]
  }
  return []
}

export function getFreqByDiffHour(diffHour: number): Freq {
  const hour = Math.abs(diffHour)
  if (hour < 48) {
    return '5min'
  }
  if (hour < 14 * 24) {
    return '1hour'
  }
  return '1day'
}

interface IDomainData {
  [domainName: string]: number[]
}

export interface INightBandwidthData {
  time: number[]
  domains: IDomainData | undefined
  [key: string]: number[] | IDomainData | undefined
}

export function calcNightBandwidthData(bandwidthData: INightBandwidthData): INightBandwidthData {
  return Object.keys(bandwidthData).reduce((result: INightBandwidthData, key) => {
    if (key === 'domains') {
      const domains = bandwidthData.domains || {}
      result.domains = Object.keys(domains).reduce((domainMap, domainName) => {
        const metricValue = domains[domainName] || []
        domainMap[domainName] = metricValue.map((value, idx) => getNightBandwidthData(result.time[idx], value))
        return domainMap
      }, {} as Record<string, any>)
    }
    if (key !== 'time' && key !== 'domains') {
      const metricValue = bandwidthData[key] || []
      result[key] = (metricValue as number[]).map((value, idx) => getNightBandwidthData(result.time[idx], value))
    }
    return result
  }, { time: bandwidthData.time } as INightBandwidthData)
}

function getNightBandwidthData(time: number, value: number) {
  // 是否使用新的夜间带宽时间（1-9 点）, 之前夜间带宽时间为（1-8 点）
  const isNightBandwidth2 = new Date(time) >= new Date(nightBandwidth2Date)
  const hour = new Date(time).getHours()
  if (isNightBandwidth2) {
    if (hour >= nightBandwidth2StartHour && hour < nightBandwidth2EndHour) {
      return value / 2
    }
  } else if (hour >= nightBandwidthStartHour && hour < nightBandwidthEndHour) {
    return value / 2
  }
  return value
}

interface IDataPoint {
  value: number
  time: number
}

export function calcNightBandwidthSummary(nightbandwidthData: IDataPoint[]): IBandwidthSummary {
  interface IPeak {
    value: number
    time: number
  }
  const peakData = getPeakData(nightbandwidthData)

  // 平均峰值和平均95峰值
  const dataGroupByDate = groupBy(nightbandwidthData, row => new Date(row.time).toDateString())
  const dataGroupByDateKeys = Object.keys(dataGroupByDate)
  const peakDataList = dataGroupByDateKeys.map(date => getPeakData(dataGroupByDate[date]))
  const peakAverage = sum(peakDataList.map(peakDataRow => peakDataRow.peak.value)) / dataGroupByDateKeys.length
  const peak95Average = sum(peakDataList.map(peakDataRow => peakDataRow.peak95.value)) / dataGroupByDateKeys.length

  return { ...peakData, peakAverage, peak95Average }

  function getPeakData(data: IDataPoint[]): { peak: IPeak, peak95: IPeak } {
    const rankList = sortBy(data, [row => -row.value])
    // 峰值和 95 峰值
    const peak = rankList[0]
    const peak95Idx = data.length > 0 ? Math.floor(data.length / 20) : 0
    const peak95 = rankList[peak95Idx]
    return { peak, peak95 }
  }
}

export function transformTrafficOptions(options: IUsageOptionsWithRegionsAndIsp): IGetStatisticsOptions {
  const { startDate, endDate, group, domains, region, freq } = options
  const STATS_DATE_FORMAT = 'YYYYMMDDHHmmss'

  return {
    domains,
    regions: region || [],
    start: startDate.startOf('day').format(STATS_DATE_FORMAT),
    end: endDate.startOf('day').format(STATS_DATE_FORMAT),
    g: convertFeq(freq),
    group
  }
}

export function transformTrafficFlowOptions(
  options: IUsageOptionsWithRegionsAndIsp, defaultType: FlowDataType
): IGetFlowOptions {
  return {
    ...transformTrafficOptions(options),
    type: options.flowDirection === FlowDirection.Up ? 'upflux' : defaultType
  }
}

export function transformTrafficBandwidthOptions(
  options: IUsageOptionsWithRegionsAndIsp, defaultType: BandwidthDataType
): IGetBandwidthOptions {
  return {
    ...transformTrafficOptions(options),
    type: options.flowDirection === FlowDirection.Up ? 'upbandwidth' : defaultType
  }
}

export function transformTrafficUserOptions(options: IUsageOptionsWithRegionsAndIsp): Omit<IGetTrafficUserOptions, 'type'> {
  const { startDate, endDate, region, freq } = options

  return {
    start: startDate.startOf('day').format(trafficSimpleDateFormat),
    end: endDate.clone().startOf('day').add(1, 'day').format(trafficSimpleDateFormat),
    g: convertFeq(freq),
    region: combineForeignRegions(region) as TrafficRegion, // TODO
    topn: maxStackByDomainCount,
    protocol: allTrafficProtocols
  }
}

export function transformTrafficUserFlowOptions(
  options: IUsageOptionsWithRegionsAndIsp, defaultType: TrafficUserType
): IGetTrafficUserOptions {
  return {
    ...transformTrafficUserOptions(options),
    type: options.flowDirection === FlowDirection.Up ? 'upflux' : defaultType
  }
}

export function transformTrafficUserBandwidthOptions(
  options: IUsageOptionsWithRegionsAndIsp, defaultType: TrafficUserType
): IGetTrafficUserOptions {
  return {
    ...transformTrafficUserOptions(options),
    type: options.flowDirection === FlowDirection.Up ? 'upbandwidth' : defaultType
  }
}

export function convertFeq(freq: Freq): any {
  switch (freq) {
    case '5min':
      return '5min'
    case '1hour':
      return 'hour'
    case '1day':
      return 'day'
    default:
      return '5min'
  }
}

export function transformAnalysisOptions(options: ISearchOptionProps): IGetAnalysisOptions {
  const { startDate, endDate, domains, region, freq, isp } = options

  return {
    domains,
    isp,
    freq,
    regions: getRegionList(region, true),
    startDate: startDate.format(logAnalysisDateFormat),
    endDate: endDate.format(logAnalysisDateFormat)
  }
}

// 合并计量数据点
export function combineTrafficPoints(res: IStatisticsGroupByUsage): number[] {
  const { cdnPoints = [], dcdnPoints = [] } = res.data || {}
  return cdnPoints.map((cdnPoint, index) => (cdnPoint || 0) + (dcdnPoints[index] || 0))
}

// 获取计量数据总和
export function sumTrafficPoints(res: IStatisticsGroupByUsage) {
  return sum(combineTrafficPoints(res))
}

// 获取 302 计量数据总和
export function sumTraffic302Points(res: IStatisticsGroupByUsage) {
  return sum(res.data['302Points+'])
}

export type TimelineDataType = {
  time: number[]
  [valueProp: string]: number[]
}

/**
 * 截取掉指定时间戳往后的数据点
 */
export function cutoutTimelineDataByTimestamp(data: TimelineDataType, timestamp: number): TimelineDataType {
  const end = data.time.findIndex(it => it > timestamp)
  if (end === -1) {
    return data
  }

  const result = {} as TimelineDataType
  Object.keys(data).forEach(key => {
    result[key] = data[key].slice(0, end)
  })

  return result
}

/** 按时间间隔获取起止时间内的所有时间点 */
export function calcTrafficUserTimeRange(options: IGetTrafficUserOptions): number[] {
  const { start, end, g } = options
  const interval = trafficFreqTimesMap[g!]
  const startTimeStamp = moment(start).startOf('day').valueOf()
  const endTimeStamp = moment(end).startOf('day').valueOf()
  const result: number[] = []

  for (let i = startTimeStamp; i < endTimeStamp;) {
    result.push(i)
    i += interval
  }

  return result
}

/** 将批量获取 top url / ip 的结果进行合并，结果取 top 100 */
export function transformBatchFetchAccessTopResponse(data: TopCommonResponse[]): BatchAccessTopItem[] {
  let result: BatchAccessTopItem[] = []
  const topMap: { [key: string]: number } = {}

  // 转成 map 结构
  data.forEach(regionTop => {
    regionTop.keys.forEach((key, index) => {
      topMap[key] = (topMap[key] || 0) + (regionTop.values[index] || 0)
    })
  })

  // 转成数组
  result = Object.keys(topMap).map(key => ({ key, value: topMap[key] }))

  // 重排序
  return result.sort((a, b) => b.value - a.value).slice(0, 100)
}

/** 将批量获取的 downloadSpeed 的结果进行合并 */
export function transformBatchFetchDownloadSpeed(regions: string[], data: IDownloadSpeedData[]): IDownloadSpeedData {
  return data.reduce((acc, cur, index) => {
    acc.regions = acc.regions.concat(isEmpty(cur) ? regions[index] : cur.regions)
    acc.value = acc.value.concat(isEmpty(cur) ? 0 : cur.value)
    return acc
  }, { regions: [], value: [] })
}
