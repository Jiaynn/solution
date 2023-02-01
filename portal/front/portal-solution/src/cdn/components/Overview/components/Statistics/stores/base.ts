/**
 * @file 统计数据提供方
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { observable, action, makeObservable } from 'mobx'
import { RawLocaleMessage } from 'portal-base/common/i18n'

import { ISeriesData } from 'cdn/transforms/chart'

import { getStatisticsOptions, TrafficSummary, transformTrafficTimelineData } from 'cdn/transforms/overview'

import AbilityConfig from 'cdn/constants/ability-config'
import { TimeRange, TrafficType } from 'cdn/constants/overview'

import StatisticsApis from 'cdn/apis/statistics'

class TrafficBase {
  @observable.ref summaryData?: TrafficSummary
  @observable.ref seriesData: Array<ISeriesData<RawLocaleMessage>> = []

  constructor() {
    makeObservable(this)
  }

  @action updateSummaryData(data: TrafficSummary) {
    this.summaryData = data
  }

  @action updateSeriesData(data: Array<ISeriesData<RawLocaleMessage>>) {
    this.seriesData = data
  }
}

export class FlowData extends TrafficBase {
  constructor(
    private statisticsApis: StatisticsApis,
    private abilityConfig: AbilityConfig
  ) {
    super()
  }

  fetchData(timeRange: TimeRange) {
    const options = getStatisticsOptions(timeRange)
    let type = this.abilityConfig.defaultTrafficTypes.flow
    if (this.abilityConfig.dynamic302Enabled) {
      type = '302flow+'
    }
    return Promise.all([
      this.statisticsApis.fetchFlowTimeline({ ...options.previous, type }),
      this.statisticsApis.fetchFlowTimeline({ ...options.current, type })
    ]).then(([previousRes, currentRes]) => {
      if (this.abilityConfig.dynamic302Enabled) {
        previousRes.data.cdnPoints = previousRes.data['302Points+']
        currentRes.data.cdnPoints = currentRes.data['302Points+']
      }
      const { summary, series } = transformTrafficTimelineData({
        previousRes,
        currentRes,
        timeRange,
        trafficType: TrafficType.Flow,
        hideDynTraffic: this.abilityConfig.hideDynTraffic
      })
      this.updateSummaryData(summary)
      this.updateSeriesData(series)
    })
  }
}

export class BandwidthData extends TrafficBase {
  constructor(
    private statisticsApis: StatisticsApis,
    private abilityConfig: AbilityConfig
  ) {
    super()
  }

  fetchData(timeRange: TimeRange) {
    const options = getStatisticsOptions(timeRange)
    let type = this.abilityConfig.defaultTrafficTypes.bandwidth
    if (this.abilityConfig.dynamic302Enabled) {
      type = '302bandwidth+'
    }
    return Promise.all([
      this.statisticsApis.fetchBandwidthTimeline({ ...options.previous, type }),
      this.statisticsApis.fetchBandwidthTimeline({ ...options.current, type })
    ]).then(([previousRes, currentRes]) => {
      if (this.abilityConfig.dynamic302Enabled) {
        previousRes.data.cdnPoints = previousRes.data['302Points+']
        currentRes.data.cdnPoints = currentRes.data['302Points+']
      }
      const { summary, series } = transformTrafficTimelineData({
        previousRes,
        currentRes,
        timeRange,
        trafficType: TrafficType.Bandwidth,
        hideDynTraffic: this.abilityConfig.hideDynTraffic
      })
      this.updateSummaryData(summary)
      this.updateSeriesData(series)
    })
  }
}

export class ReqcountData extends TrafficBase {
  constructor(private statisticsApis: StatisticsApis) {
    super()
  }

  fetchData(timeRange: TimeRange) {
    const options = getStatisticsOptions(timeRange)

    return Promise.all([
      this.statisticsApis.fetchReqcountTimeline(options.previous),
      this.statisticsApis.fetchReqcountTimeline(options.current)
    ]).then(([previousRes, currentRes]) => {
      const { summary, series } = transformTrafficTimelineData({
        previousRes,
        currentRes,
        timeRange,
        trafficType: TrafficType.Reqcount
      })
      this.updateSummaryData(summary)
      this.updateSeriesData(series)
    })
  }
}
