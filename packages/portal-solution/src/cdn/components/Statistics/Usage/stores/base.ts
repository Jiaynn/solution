
import { observable, action, makeObservable } from 'mobx'
import { sum } from 'lodash'
import { RawLocaleMessage } from 'portal-base/common/i18n'
import { ToasterStore } from 'portal-base/common/toaster'
import { injectable as diInjectable } from 'qn-fe-core/di'

import { observeInjectable as injectable } from 'qn-fe-core/store'

import { assertUnreachable } from 'cdn/utils'

import {
  transformNormalLineSeries,
  getSummaries,
  calcNightBandwidthData,
  calcNightBandwidthSummary,
  transformAnalysisOptions,
  INightBandwidthData,
  transformTrafficBandwidthOptions,
  calcTrafficUserTimeRange,
  LineSeriesData,
  transformTrafficOptions
} from 'cdn/transforms/statistics'
import { ISeriesData } from 'cdn/transforms/chart'
import { combineForeignRegions } from 'cdn/transforms/traffic-region'

import { StatisticsDataSource } from 'cdn/constants/statistics'
import AbilityConfig from 'cdn/constants/ability-config'
import { trafficRegionsNameMap } from 'cdn/constants/traffic-region'

import StatisticsApis, {
  IGetFlowOptions,
  IGetBandwidthOptions,
  IStatisticsSummary,
  IUsageOptions,
  IUsageOptionsWithRegionsAndIsp,
  IStaticAndDynamicDomains,
  ITrafficUserResponse,
  IGetTrafficUserOptions
} from 'cdn/apis/statistics'

export const seriesNameMap = {
  static: {
    cn: '静态',
    en: 'Static'
  },
  dynamic: {
    cn: '动态',
    en: 'Dynamic'
  },
  cdnPoints: {
    cn: '静态',
    en: 'Static'
  },
  dcdnPoints: {
    cn: '动态',
    en: 'Dynamic'
  },
  china: {
    cn: '国内',
    en: 'Chinese Mainland'
  },
  oversea: {
    cn: '海外',
    en: 'Outside Chinese Mainland'
  },
  total: {
    cn: '全部',
    en: 'Total'
  },
  '302Points': {
    cn: '动态 302',
    en: 'Dynamic 302'
  },
  '302Points+': {
    cn: '静态',
    en: 'Static'
  }
}

export interface IFlowSummary {
  total: number
  average?: number
  totalInLeisure?: number
  totalInDaytime?: number
}

export interface TimelineData {
  [key: string]: number[]
  time: number[]
}

export function calcFlowTimelineAndSummary(timelineData: TimelineData,
  totalAndLeisureSummary: IFlowSummary, options: IUsageOptionsWithRegionsAndIsp): SeriesAndSummaryData<IFlowSummary> {
  const nameMap = options.group === 'geoCover' ? trafficRegionsNameMap : seriesNameMap
  return {
    series: transformNormalLineSeries(
      timelineData,
      name => nameMap[name as keyof typeof nameMap] || { cn: name, en: name }
    ),
    summary: {
      ...totalAndLeisureSummary,
      average: totalAndLeisureSummary.total / (options.endDate.diff(options.startDate, 'd') + 1)
    }
  }
}

@diInjectable()
export abstract class TrafficDataBase<T> {
  @observable.ref seriesData: Array<ISeriesData<RawLocaleMessage>> = []
  @observable.ref summary!: T

  constructor() {
    makeObservable(this)
  }

  @action.bound updateSeriesData(data: Array<ISeriesData<RawLocaleMessage>>) {
    this.seriesData = data
  }

  @action.bound updateSummary(summary: T) {
    this.summary = summary
  }

  abstract fetchByUsage(options: IUsageOptionsWithRegionsAndIsp): Promise<SeriesAndSummaryData<T>>
  abstract fetchByDomain(options: IUsageOptionsWithRegionsAndIsp): Promise<SeriesAndSummaryData<T>>
  abstract fetchByGeoCover(options: IUsageOptionsWithRegionsAndIsp): Promise<SeriesAndSummaryData<T>>

  @ToasterStore.handle()
  fetchLineData(
    options: IUsageOptionsWithRegionsAndIsp
  ) {
    const { group } = options
    let fetchPromise
    switch (group) {
      case '': {
        fetchPromise = this.fetchByUsage(options)
        break
      }
      case 'domain': {
        fetchPromise = this.fetchByDomain(options)
        break
      }
      case 'geoCover': {
        fetchPromise = this.fetchByGeoCover(options)
        break
      }
      default: {
        assertUnreachable(group)
      }
    }
    return fetchPromise.then(res => {
      this.updateSeriesData(res.series)
      this.updateSummary(res.summary)
    })
  }
}

@diInjectable()
export abstract class FlowDataBase extends TrafficDataBase<IFlowSummary> {}

@diInjectable()
export abstract class BandwidthDataBase extends TrafficDataBase<IBandwidthSummary> {}

export interface IBandwidthSummary {
  peak: {
    value: number
    time?: number
  }
  peak95?: {
    value: number
    time?: number
  }
  peakAverage?: number
  peak95Average?: number
}

export interface IReqCountSummary {
  total: number
  average?: number
  totalInLeisure?: number
  totalInDaytime?: number
}

@injectable()
export class ReqCountData {
  @observable.ref seriesData: Array<ISeriesData<RawLocaleMessage>> = []
  @observable reqcountSummary!: IReqCountSummary

  constructor(
    private toasterStore: ToasterStore,
    private statisticsApis: StatisticsApis,
    private abilityConfig: AbilityConfig
  ) {
    ToasterStore.bindTo(this, this.toasterStore)
  }

  @action.bound updateSeriesData(data: Array<ISeriesData<RawLocaleMessage>>) {
    this.seriesData = data
  }

  @action.bound updateReqcountSummary(summary: IReqCountSummary) {
    this.reqcountSummary = summary
  }

  @ToasterStore.handle()
  async fetchLineData(options: IUsageOptionsWithRegionsAndIsp, staticAndDynamicDomains: IStaticAndDynamicDomains) {
    let timelineData
    // DCDN 下才会设置 reqCountDataSource 为 Traffic
    // 所以 reqCountDataSource 为 Traffic 的时候 SearchBar 过滤出来的一定是动态的域名
    // 所以 reqCountDataSource 为 Traffic 的时候，staticAndDynamicDomains 中只有 dynamic 是有意义的
    if (this.abilityConfig.reqCountDataSource === StatisticsDataSource.Traffic) {
      const result = await this.statisticsApis.fetchReqcountTimeline(transformTrafficOptions({
        ...options,
        domains: staticAndDynamicDomains.dynamic
      }))
      timelineData = {
        time: result.data.time,
        total: result.data.dcdnPoints,
        dynamic: result.data.dcdnPoints
      }
    } else {
      const result = await this.statisticsApis.fetchAnalysisReqCount(
        transformAnalysisOptions({ ...options, domains: staticAndDynamicDomains.static })
      )
      timelineData = {
        time: result.time,
        total: result.value,
        static: result.value
      }
    }

    const series = transformNormalLineSeries(
      timelineData,
      name => (
        seriesNameMap[name as keyof typeof seriesNameMap] || { cn: name, en: name }
      )
    )
    const reqcountSummary = getSummaries(timelineData)
    this.updateSeriesData(series)
    this.updateReqcountSummary(reqcountSummary)
  }
}

@injectable()
export class NightBandwidthData {
  @observable.ref seriesData: Array<ISeriesData<RawLocaleMessage>> = []
  @observable bandwidthSummary!: IBandwidthSummary

  constructor(
    private toasterStore: ToasterStore,
    private statisticsApis: StatisticsApis,
    private abilityConfig: AbilityConfig
  ) {
    ToasterStore.bindTo(this, this.toasterStore)
  }

  @action.bound updateSeriesData(data: Array<ISeriesData<RawLocaleMessage>>) {
    this.seriesData = data
  }

  @action.bound updateSummaryData(data: any) {
    this.bandwidthSummary = {
      peak: data.peak,
      peak95: data.peak95,
      peakAverage: data.peakAverage,
      peak95Average: data.peak95Average
    }
  }

  @ToasterStore.handle()
  fetchLineData(options: IUsageOptionsWithRegionsAndIsp) {
    // 夜间带宽频率不能选者 1 天，否则无法在前端计算优惠后的带宽
    if (options.freq === '1day') {
      options.freq = '1hour'
    }

    const bandwidthType = this.abilityConfig.defaultTrafficTypes.bandwidth
    const trafficOptions = transformTrafficBandwidthOptions(options, bandwidthType)
    // 按区域堆叠 - 发多次请求
    const fetchPromise = trafficOptions.group === 'geoCover'
      ? batchFetchBandwidthTimeline(this.statisticsApis, trafficOptions)
      : this.statisticsApis.fetchBandwidthTimeline({
        ...trafficOptions,
        regions: combineForeignRegions(trafficOptions.regions)
      })

    return fetchPromise.then(res => {
      // delete res.data['302Points']
      const nightbandwidthData = calcNightBandwidthData(res.data as INightBandwidthData)
      const totalNightbandwidthData = nightbandwidthData.time.map((time, idx) => {
        let value = 0
        switch (options.group) {
          case '':
            value = (nightbandwidthData.cdnPoints as any)[idx] + (nightbandwidthData.dcdnPoints as any)[idx]
            break
          case 'domain':
            value = sum(Object.keys(nightbandwidthData.domains!).map(key => nightbandwidthData.domains![key][idx]))
            break
          case 'geoCover':
            Object.keys(nightbandwidthData).forEach(key => {
              if (key !== 'time') {
                value += (nightbandwidthData[key] as any)[idx]
              }
            })
            break
          default:
        }
        return {
          value, time
        }
      })
      this.updateSummaryData(calcNightBandwidthSummary(totalNightbandwidthData))
      return nightbandwidthData
    }).then(data => {
      const series = transformBandwidthTimelineData(data as any, options).series
      this.updateSeriesData(series)
    })
  }
}

export interface SeriesAndSummaryData<T> {
  series: Array<ISeriesData<RawLocaleMessage>>
  summary: T
}

export type BandwidthData = SeriesAndSummaryData<IBandwidthSummary>

export function transformBandwidthTimelineData(
  data: TimelineData,
  options: IUsageOptions,
  stats?: IStatisticsSummary
): BandwidthData {
  const nameMap = options.group === 'geoCover' ? trafficRegionsNameMap : seriesNameMap
  let timelineData = data

  if (options.group === 'domain') {
    const domains = timelineData.domains
    timelineData = { ...domains, time: timelineData.time } as any
  }
  let summary = {
    peak: { value: 0, time: 0 },
    peak95: { value: 0, time: 0 },
    peakAverage: 0,
    peak95Average: 0
  }
  if (stats) {
    const { peak, peak95, peakAvrage, peak95Avrage } = stats
    summary = {
      peak,
      peak95,
      peakAverage: peakAvrage,
      peak95Average: peak95Avrage
    }
  }
  return {
    series: transformNormalLineSeries(
      timelineData,
      name => nameMap[name as keyof typeof nameMap] || { cn: name, en: name }
    ),
    summary
  }
}

export function transformTrafficUserBandwidthTimelineData(
  data: ITrafficUserResponse, options: IGetTrafficUserOptions
): BandwidthData {
  const time = calcTrafficUserTimeRange(options)
  const timelineData: LineSeriesData = { time }

  data.domains.forEach(item => {
    timelineData[item.name] = item.points
  })
  const { peak, peak95, avrPeak, avrPeak95 } = data.total
  const summary = {
    peak: {
      value: peak
    },
    peak95: {
      value: peak95
    },
    peakAverage: avrPeak,
    peak95Average: avrPeak95
  }
  return {
    series: transformNormalLineSeries(timelineData, name => ({ cn: name, en: name })),
    summary
  }
}

export interface FlowTimelineByRegion {
  region: string
  time: number[]
  value: number[]
}

export interface BatchFlowTimelineResponse {
  data: {
    time: number[]
    [key: string]: number[]
  }
  stats: IStatisticsSummary
}

export function batchFetchFlowTimeline(
  statisticsApis: StatisticsApis,
  options: IGetFlowOptions
): Promise<BatchFlowTimelineResponse> {
  return Promise.all((options.regions || []).map(region => fetchFlowTimelineByRegion(statisticsApis, options, region)))
    .then(res => res.reduce((result, current) => ({
      ...result,
      [current.region]: current.value,
      time: current.time
    }), { time: [] }))
    .then(data => statisticsApis.fetchFlowTimeline({ ...options, regions: combineForeignRegions(options.regions) })
      .then(res => ({ data, stats: res.stats })))
}

export function fetchFlowTimelineByRegion(
  statisticsApis: StatisticsApis,
  options: IGetFlowOptions,
  region: string
): Promise<FlowTimelineByRegion> {
  return statisticsApis.fetchFlowTimeline(
    {
      ...options,
      regions: [region],
      group: ''
    }
  ).then(res => {
    const { cdnPoints, dcdnPoints, time } = res.data
    let value
    if (options.type === '302flow+') {
      value = res.data['302Points+']
    } else {
      value = cdnPoints.map((point, index) => point + dcdnPoints[index] || 0)
    }
    return {
      region,
      time,
      value
    }
  })
}

export function batchFetchBandwidthTimeline(
  statisticsApis: StatisticsApis,
  options: IGetBandwidthOptions
): Promise<BatchFlowTimelineResponse> {
  return Promise.all((options.regions || []).map(
    region => fetchBandwidthTimelineByRegion(statisticsApis, options, region)
  ))
    .then(res => res.reduce((result, current) => ({
      ...result,
      [current.region]: current.value,
      time: current.time
    }), { time: [] }))
    .then(data => statisticsApis.fetchBandwidthTimeline({ ...options, regions: combineForeignRegions(options.regions) })
      .then(res => ({ data, stats: res.stats })))
}

export function fetchBandwidthTimelineByRegion(
  statisticsApis: StatisticsApis,
  options: IGetBandwidthOptions,
  region: string
): Promise<FlowTimelineByRegion> {
  return statisticsApis.fetchBandwidthTimeline({
    ...options,
    regions: [region],
    group: ''
  }).then(res => {
    const { cdnPoints, dcdnPoints, time } = res.data
    let value
    if (options.type === '302bandwidth+') {
      value = res.data['302Points+']
    } else {
      value = cdnPoints.map((point, index) => point + dcdnPoints[index] || 0)
    }
    return {
      region,
      time,
      value
    }
  })
}
