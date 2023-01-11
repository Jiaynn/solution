/**
 * @file statistics store
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { FieldState } from 'formstate-x'
import autobind from 'autobind-decorator'
import { computed, observable, reaction, action } from 'mobx'
import { isEmpty } from 'lodash'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { I18nStore, RawLocaleMessage } from 'portal-base/common/i18n'

import { booleanPredicate } from 'cdn/utils'

import { humanizeTraffic, humanizeBandwidth, humanizeReqcount } from 'cdn/transforms/unit'
import { ISeriesData, getAreaChartOptions, getReqcountUnit } from 'cdn/transforms/chart'

import AbilityConfig from 'cdn/constants/ability-config'
import { bandwidthUnit, flowUnit } from 'cdn/constants/chart'
import { TimeRange, TrafficType } from 'cdn/constants/overview'

import * as messages from 'cdn/components/Overview/messages'

import StatisticsApis from 'cdn/apis/statistics'

import { FlowData, BandwidthData, ReqcountData } from './base'
import { ISummaryCardProps } from '../Summary'

enum LoadingType {
  FetchFlowData = 'fetchFlowData',
  FetchBandwidthData = 'fetchBandwidthData',
  FetchReqcountData = 'fetchReqcountData'
}

@injectable()
export default class LocalStore extends Store {
  constructor(
    private toasterStore: Toaster,
    private statisticsApis: StatisticsApis,
    private abilityConfig: AbilityConfig,
    private i18n: I18nStore
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, LoadingType)

  // 统计区数据刷新定时器
  timer?: number

  // 是否需要刷新
  @observable needRefresh = false

  @autobind
  clearTimer() {
    if (this.timer != null) {
      window.clearTimeout(this.timer)
    }
  }

  @observable.ref timeRange = TimeRange.Today
  @observable.ref trafficType = new FieldState(TrafficType.Flow)

  @observable flowData = new FlowData(this.statisticsApis, this.abilityConfig)
  @observable bandwidthData = new BandwidthData(this.statisticsApis, this.abilityConfig)
  @observable reqcountData = new ReqcountData(this.statisticsApis)

  @computed get isFlowLoading() {
    return this.loadings.isLoading(LoadingType.FetchFlowData)
  }

  @computed get isBandwidthLoading() {
    return this.loadings.isLoading(LoadingType.FetchBandwidthData)
  }

  @computed get isReqcountLoading() {
    return this.loadings.isLoading(LoadingType.FetchReqcountData)
  }

  @computed get isTimelineDataEmpty() {
    return isEmpty(this.seriesData)
  }

  @computed get isChartLoading() {
    let loading: boolean

    switch (this.trafficType.value) {
      case TrafficType.Flow:
        loading = this.isFlowLoading
        break
      case TrafficType.Bandwidth:
        loading = this.isBandwidthLoading
        break
      case TrafficType.Reqcount:
        loading = this.isReqcountLoading
        break
      default:
        loading = false
    }

    return loading
  }

  @computed get chartOptions() {
    let unit

    switch (this.trafficType.value) {
      case TrafficType.Flow:
        unit = flowUnit
        break
      case TrafficType.Bandwidth:
        unit = bandwidthUnit
        break
      case TrafficType.Reqcount:
        unit = getReqcountUnit(this.i18n.t)
        break
      default:
    }

    return getAreaChartOptions({
      unit,
      decimals: 2
    })
  }

  @computed get seriesData() {
    let seriesData: Array<ISeriesData<RawLocaleMessage>> = []

    switch (this.trafficType.value) {
      case TrafficType.Flow:
        seriesData = this.flowData.seriesData
        break
      case TrafficType.Bandwidth:
        seriesData = this.bandwidthData.seriesData
        break
      case TrafficType.Reqcount:
        seriesData = this.reqcountData.seriesData
        break
      default:
        seriesData = []
    }

    return seriesData.map(({ name, ...rest }) => ({ name: this.i18n.t(name), ...rest }))
  }

  @computed get summaryItems(): ISummaryCardProps[] {
    const flowSummary = this.flowData.summaryData
    const bandwidthSummary = this.bandwidthData.summaryData
    const reqcountSummary = this.reqcountData.summaryData

    return [
      {
        title: this.i18n.t(messages.flow),
        loading: this.isFlowLoading,
        value: flowSummary ? humanizeTraffic(flowSummary.total) : null,
        increase: flowSummary ? flowSummary.increase : null
      },
      {
        title: this.i18n.t(messages.bandwidth),
        loading: this.isBandwidthLoading,
        value: bandwidthSummary ? humanizeBandwidth(bandwidthSummary.total) : null,
        increase: bandwidthSummary ? bandwidthSummary.increase : null
      },
      !this.abilityConfig.hideDynTraffic && {
        title: this.i18n.t(messages.dynamicReqCount),
        loading: this.isReqcountLoading,
        value: reqcountSummary ? this.i18n.t(humanizeReqcount(reqcountSummary.total)) : null,
        increase: reqcountSummary ? reqcountSummary.increase : null
      }
    ].filter(booleanPredicate)
  }

  @action.bound
  handleTimeRangeChange(timeRange: TimeRange) {
    this.timeRange = timeRange
  }

  @action updateNeedRefresh(needRefresh: boolean) {
    this.needRefresh = needRefresh
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.FetchFlowData)
  fetchFlowData() {
    return this.flowData.fetchData(this.timeRange)
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.FetchBandwidthData)
  fetchBandwidthData() {
    return this.bandwidthData.fetchData(this.timeRange)
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.FetchReqcountData)
  fetchReqcountData() {
    return this.reqcountData.fetchData(this.timeRange)
  }

  fetchAll() {
    this.fetchFlowData()
    this.fetchBandwidthData()
    if (!this.abilityConfig.hideDynTraffic) {
      this.fetchReqcountData()
    }

    // 时间选择今日时，每五分钟获取一次数据
    this.clearTimer()
    this.updateNeedRefresh(false)

    if (this.timeRange === TimeRange.Today) {
      this.timer = window.setTimeout(() => {
        this.updateNeedRefresh(true)
      }, 5 * 60 * 1000)
    }
  }

  init() {
    this.addDisposer(this.trafficType.dispose)
    this.addDisposer(this.clearTimer)

    this.addDisposer(reaction(
      () => this.timeRange,
      () => this.fetchAll(),
      { fireImmediately: true }
    ))

    this.addDisposer(reaction(
      () => this.needRefresh,
      needRefresh => needRefresh && this.fetchAll()
    ))
  }
}
