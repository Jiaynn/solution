
import moment from 'moment'

import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { ToasterStore } from 'portal-base/common/toaster'
import { injectable } from 'qn-fe-core/di'

import {
  transformNormalLineSeries,
  getSummaries,
  transformTrafficFlowOptions,
  transformTrafficBandwidthOptions,
  transformTrafficUserFlowOptions,
  calcTrafficUserTimeRange,
  LineSeriesData,
  transformTrafficUserBandwidthOptions
} from 'cdn/transforms/statistics'

import AbilityConfig from 'cdn/constants/ability-config'

import StatisticsApis, {
  IGetFlowOptions,
  IGetBandwidthOptions,
  IUsageOptionsWithRegionsAndIsp,
  ITrafficUserResponse,
  IGetTrafficUserOptions,
  BandwidthDataType,
  FlowDataType
} from 'cdn/apis/statistics'

import {
  calcFlowTimelineAndSummary,
  TimelineData, batchFetchFlowTimeline,
  transformBandwidthTimelineData,
  transformTrafficUserBandwidthTimelineData,
  batchFetchBandwidthTimeline,
  FlowDataBase,
  BandwidthDataBase
} from './base'

@injectable()
export class Enabled302Flow extends FlowDataBase {

  constructor(
    protected toasterStore: ToasterStore,
    protected statisticsApis: StatisticsApis,
    protected abilityConfig: AbilityConfig,
    protected featureConfigStore: FeatureConfigStore
  ) {
    super()
    ToasterStore.bindTo(this, this.toasterStore)
  }

  transformTimelineData(timelineData: TimelineData, options: IUsageOptionsWithRegionsAndIsp) {
    if (options.group === 'domain') {
      const domains = timelineData.domains
      timelineData = { ...domains, time: timelineData.time } as any
    }
    // 总流量、日均流量算总流量（302 + 静态），闲时和日间流量只算静态
    let totalAndLeisureSummary = getSummaries(timelineData,
      dataForSummary => dataForSummary.time.map(
        (_: unknown, idx: number) => Object.keys(dataForSummary).reduce((total, key) => {
          // 除去时间, 总计, 302points+ 三列数据
          if (!['time', 'total', '302Points+'].includes(key)) {
            return total + dataForSummary[key][idx]
          }
          return total
        }, 0)
      ))
    const { totalInLeisure, totalInDaytime } = getSummaries(timelineData,
      dataForSummary => dataForSummary.time.map(
        (_: unknown, idx: number) => Object.keys(dataForSummary).reduce((total, key) => {
          if (key === 'cdnPoints') {
            return total + dataForSummary[key][idx]
          }
          return total
        }, 0)
      ))
    totalAndLeisureSummary = { ...totalAndLeisureSummary, totalInLeisure, totalInDaytime }

    if (options.group === '') {
      const feature302Enabled = !this.featureConfigStore.isDisabled('FUSION.FUSION_302DYNAMIC_STATISTICS')
      if (feature302Enabled) {
        const { '302Points+': points, ...restProps } = timelineData
        return calcFlowTimelineAndSummary(restProps, totalAndLeisureSummary, options)
      }
      const { '302Points': points, cdnPoints, ...restProps } = timelineData
      return calcFlowTimelineAndSummary(restProps, totalAndLeisureSummary, options)
    }

    return calcFlowTimelineAndSummary(timelineData, totalAndLeisureSummary, options)
  }

  transformTrafficUserFlowTimelineData(data: ITrafficUserResponse, options: IGetTrafficUserOptions) {
    // 总流量、日均流量算总流量（302 + 静态），闲时和日间流量只算静态
    const time = calcTrafficUserTimeRange(options)
    const timelineData: LineSeriesData = { time }

    data.domains.forEach(item => {
      timelineData[item.name] = item.points
    })
    let totalAndLeisureSummary = getSummaries(timelineData,
      dataForSummary => dataForSummary.time.map(
        (_: unknown, idx: number) => Object.keys(dataForSummary).reduce((total, key) => {
          if (key !== 'time') {
            return total + dataForSummary[key][idx]
          }
          return total
        }, 0)
      ))
    const { totalInLeisure, totalInDaytime } = getSummaries(timelineData,
      dataForSummary => dataForSummary.time.map(
        (_: unknown, idx: number) => Object.keys(dataForSummary).reduce((total, key) => {
          if (key === 'cdnPoints') {
            return total + dataForSummary[key][idx]
          }
          return total
        }, 0)
      ))
    totalAndLeisureSummary = { ...totalAndLeisureSummary, totalInLeisure, totalInDaytime }

    return {
      series: transformNormalLineSeries(timelineData, name => ({ cn: name, en: name })),
      summary: {
        ...totalAndLeisureSummary,
        average: totalAndLeisureSummary.total / moment(options.end).diff(moment(options.start), 'd')
      }
    }
  }

  fetchByUsage(options: IUsageOptionsWithRegionsAndIsp) {
    const trafficOptions = transformTrafficFlowOptions(options, '302flow+')
    return fetchFlowTimelineBy302Type(this.statisticsApis, trafficOptions).then(
      res => this.transformTimelineData(res, options)
    )
  }

  fetchByDomain(options: IUsageOptionsWithRegionsAndIsp) {
    if (options.fullDomainsChecked) {
      const trafficOptions = transformTrafficUserFlowOptions(options, '302flow+')
      return this.statisticsApis.fetchTrafficUser(trafficOptions).then(
        res => this.transformTrafficUserFlowTimelineData(res, trafficOptions)
      )
    }
    const trafficOptions = transformTrafficFlowOptions(options, '302flow+')
    return this.statisticsApis.fetchFlowTimeline(trafficOptions).then(
      res => this.transformTimelineData(res.data, options)
    )
  }

  fetchByGeoCover(options: IUsageOptionsWithRegionsAndIsp) {
    const trafficOptions = transformTrafficFlowOptions(options, '302flow+')
    return batchFetchFlowTimeline(this.statisticsApis, trafficOptions).then(
      res => this.transformTimelineData(res.data, options)
    )
  }
}

export function fetchFlowTimelineBy302Type(statisticsApis: StatisticsApis, options: IGetFlowOptions) {
  const flowDataType: FlowDataType[] = ['flux', '302flow', '302flow+']
  return Promise.all(flowDataType.map(
    type => statisticsApis.fetchFlowTimeline({ ...options, type })
  )).then(
    // 将「静态」「动态 302 」「动态302和静态」三条数据合并返回
    res => ({ ...res[0].data,
      '302Points': res[1].data['302Points'],
      '302Points+': res[2].data['302Points+'] })
  )
}

@injectable()
export class Enabled302Bandwidth extends BandwidthDataBase {

  constructor(
    protected toasterStore: ToasterStore,
    protected statisticsApis: StatisticsApis,
    protected abilityConfig: AbilityConfig,
    protected featureConfigStore: FeatureConfigStore
  ) {
    super()
    ToasterStore.bindTo(this, this.toasterStore)
  }

  fetchByUsage(options: IUsageOptionsWithRegionsAndIsp) {
    const trafficOptions = transformTrafficBandwidthOptions(options, '302bandwidth+')

    const feature302Enabled = !this.featureConfigStore.isDisabled('FUSION.FUSION_302DYNAMIC_STATISTICS')
    if (feature302Enabled) {
      return fetchBandwidthTimelineBy302Type(this.statisticsApis, trafficOptions).then(
        res => transformBandwidthTimelineData(res.data, options, res.stats)
      )
    }
    return this.statisticsApis.fetchBandwidthTimeline(trafficOptions).then(
      res => transformBandwidthTimelineData(res.data, options, res.stats)
    )
  }

  fetchByDomain(options: IUsageOptionsWithRegionsAndIsp) {
    if (options.fullDomainsChecked) {
      const trafficOptions = transformTrafficUserBandwidthOptions(options, '302bandwidth+')
      return this.statisticsApis.fetchTrafficUser(trafficOptions).then(
        res => transformTrafficUserBandwidthTimelineData(res, trafficOptions)
      )
    }
    const trafficOptions = transformTrafficBandwidthOptions(options, '302bandwidth+')
    return this.statisticsApis.fetchBandwidthTimeline(trafficOptions).then(
      res => transformBandwidthTimelineData(res.data, options, res.stats)
    )
  }

  fetchByGeoCover(options: IUsageOptionsWithRegionsAndIsp) {
    const trafficOptions = transformTrafficBandwidthOptions(options, '302bandwidth+')
    return batchFetchBandwidthTimeline(this.statisticsApis, trafficOptions).then(
      res => transformBandwidthTimelineData(res.data, options, res.stats)
    )
  }
}

export function fetchBandwidthTimelineBy302Type(statisticsApis: StatisticsApis, options: IGetBandwidthOptions) {
  const bandwidthDataType: BandwidthDataType[] = ['bandwidth', '302bandwidth', '302bandwidth+']
  return Promise.all(bandwidthDataType.map(
    type => statisticsApis.fetchBandwidthTimeline({ ...options, type })
  )).then(
    // 这里将「静态」「302」两种数据，「静态 + 302」的 stats 合并返回。
    res => ({ data: { ...res[0].data, '302Points': res[1].data['302Points'] }, stats: res[2].stats })
  )
}
