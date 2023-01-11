
import moment from 'moment'
import { ToasterStore } from 'portal-base/common/toaster'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
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
  IUsageOptionsWithRegionsAndIsp,
  ITrafficUserResponse,
  IGetTrafficUserOptions
} from 'cdn/apis/statistics'

import {
  calcFlowTimelineAndSummary,
  TimelineData,
  batchFetchFlowTimeline,
  transformBandwidthTimelineData,
  transformTrafficUserBandwidthTimelineData,
  batchFetchBandwidthTimeline,
  FlowDataBase,
  BandwidthDataBase
} from './base'

@injectable()
export class Disabled302Flow extends FlowDataBase {

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
    const totalAndLeisureSummary = getSummaries(timelineData,
      dataForSummary => dataForSummary.time.map(
        (_: unknown, idx: number) => Object.keys(dataForSummary).reduce((total, key) => {
          // 除去时间, 总计两列
          if (!['time', 'total'].includes(key)) {
            return total + dataForSummary[key][idx]
          }
          return total
        }, 0)
      ))
    return calcFlowTimelineAndSummary(timelineData, totalAndLeisureSummary, options)
  }

  transformTrafficUserFlowTimelineData(data: ITrafficUserResponse, options: IGetTrafficUserOptions) {
    const time = calcTrafficUserTimeRange(options)
    const timelineData: LineSeriesData = { time }

    data.domains.forEach(item => {
      timelineData[item.name] = item.points
    })
    const totalAndLeisureSummary = getSummaries(timelineData,
      dataForSummary => dataForSummary.time.map(
        (_: unknown, idx: number) => Object.keys(dataForSummary).reduce((total, key) => {
          if (key !== 'time') {
            return total + dataForSummary[key][idx]
          }
          return total
        }, 0)
      ))

    return {
      series: transformNormalLineSeries(timelineData, name => ({ cn: name, en: name })),
      summary: {
        ...totalAndLeisureSummary,
        average: totalAndLeisureSummary.total / moment(options.end).diff(moment(options.start), 'd')
      }
    }
  }

  fetchByUsage(options: IUsageOptionsWithRegionsAndIsp) {
    const flowType = this.abilityConfig.defaultTrafficTypes.flow
    const trafficOptions = transformTrafficFlowOptions(options, flowType)
    return this.statisticsApis.fetchFlowTimeline(trafficOptions).then(
      res => this.transformTimelineData(res.data, options)
    )
  }

  fetchByDomain(options: IUsageOptionsWithRegionsAndIsp) {
    if (options.fullDomainsChecked) {
      const flowType = this.abilityConfig.defaultTrafficTypes.userFlow
      const trafficOptions = transformTrafficUserFlowOptions(options, flowType)
      return this.statisticsApis.fetchTrafficUser(trafficOptions).then(
        res => this.transformTrafficUserFlowTimelineData(res, trafficOptions)
      )
    }
    const flowType = this.abilityConfig.defaultTrafficTypes.flow
    const trafficOptions = transformTrafficFlowOptions(options, flowType)
    return this.statisticsApis.fetchFlowTimeline(trafficOptions).then(
      res => this.transformTimelineData(res.data, options)
    )
  }

  fetchByGeoCover(options: IUsageOptionsWithRegionsAndIsp) {
    const flowType = this.abilityConfig.defaultTrafficTypes.flow
    const trafficOptions = transformTrafficFlowOptions(options, flowType)
    return batchFetchFlowTimeline(this.statisticsApis, trafficOptions).then(
      res => this.transformTimelineData(res.data, options)
    )
  }
}

@injectable()
export class Disabled302Bandwidth extends BandwidthDataBase {

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
    const bandwidthType = this.abilityConfig.defaultTrafficTypes.bandwidth
    const trafficOptions = transformTrafficBandwidthOptions(options, bandwidthType)
    return this.statisticsApis.fetchBandwidthTimeline(trafficOptions).then(
      res => transformBandwidthTimelineData(res.data, options, res.stats)
    )
  }

  fetchByDomain(options: IUsageOptionsWithRegionsAndIsp) {
    if (options.fullDomainsChecked) {
      const bandwidthType = this.abilityConfig.defaultTrafficTypes.userBandwidth
      const trafficOptions = transformTrafficUserBandwidthOptions(options, bandwidthType)
      return this.statisticsApis.fetchTrafficUser(trafficOptions).then(
        res => transformTrafficUserBandwidthTimelineData(res, trafficOptions)
      )
    }
    const bandwidthType = this.abilityConfig.defaultTrafficTypes.bandwidth
    const trafficOptions = transformTrafficBandwidthOptions(options, bandwidthType)
    return this.statisticsApis.fetchBandwidthTimeline(trafficOptions).then(
      res => transformBandwidthTimelineData(res.data, options, res.stats)
    )
  }

  fetchByGeoCover(options: IUsageOptionsWithRegionsAndIsp) {
    const bandwidthType = this.abilityConfig.defaultTrafficTypes.bandwidth
    const trafficOptions = transformTrafficBandwidthOptions(options, bandwidthType)
    return batchFetchBandwidthTimeline(this.statisticsApis, trafficOptions).then(
      res => transformBandwidthTimelineData(res.data, options, res.stats)
    )
  }
}
