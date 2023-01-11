import { observable, action, computed } from 'mobx'
import { max, sum } from 'lodash'
import { I18nStore } from 'portal-base/common/i18n'
import { ToasterStore } from 'portal-base/common/toaster'
import { observeInjectable as injectable } from 'qn-fe-core/store'

import concurrency from 'cdn/utils/concurrency'

import { IBarSeriesData, IPieSeriesData } from 'cdn/transforms/chart'
import { getAllRegionNameList, humanizeRegion } from 'cdn/transforms/region'
import { humanizeBandwidth, humanizePercent, humanizeReqcount, humanizeTraffic } from 'cdn/transforms/unit'
import { enhancedDivision } from 'cdn/transforms/math'
import { getAllIspNameList, humanizeIsp } from 'cdn/transforms/isp'
import { transformNormalPieSeries, transformAnalysisOptions } from 'cdn/transforms/statistics'

import StatisticsApis from 'cdn/apis/statistics'
import { ISearchOptionProps } from '../../Search/store'

import * as messages from '../messages'

export type SimplifyTrafficItem = {
  name: string
  value: number
}

export type TrafficItem = SimplifyTrafficItem & {
  percent?: number
}

const allRegions = getAllRegionNameList()
const allIsps = getAllIspNameList()
const topN = 20 // 查询 top 20
const concurrencyLimit = 5  // 限制并发请求数量

/**
 * 流量
 */
@injectable()
export class FlowData {
  @observable.ref regionSeriesData!: IBarSeriesData
  @observable.ref regionTableData: TrafficItem[] = []

  @observable.ref ispSeriesData!: IPieSeriesData[]
  @observable.ref ispTableData: TrafficItem[] = []

  constructor(
    private statisticsApis: StatisticsApis,
    private toasterStore: ToasterStore,
    private i18n: I18nStore
  ) {
    ToasterStore.bindTo(this, this.toasterStore)
  }

  @computed get regionColumns() {
    return [{
      title: this.i18n.t(messages.region),
      dataIndex: 'name'
    }, {
      title: this.i18n.t(messages.flow),
      dataIndex: 'value',
      render: (val: number) => humanizeTraffic(val)
    }, {
      title: this.i18n.t(messages.trafficProportion),
      dataIndex: 'percent',
      render: (val: number) => humanizePercent(val)
    }]
  }

  @computed get ispColumns() {
    return [{
      title: this.i18n.t(messages.isp),
      dataIndex: 'name'
    }, {
      title: this.i18n.t(messages.flow),
      dataIndex: 'value',
      render: (val: number) => humanizeTraffic(val)
    }, {
      title: this.i18n.t(messages.trafficProportion),
      dataIndex: 'percent',
      render: (val: number) => humanizePercent(val)
    }]
  }

  @action.bound updateRegionSeriesData(data: IBarSeriesData) {
    this.regionSeriesData = data
  }

  @action.bound updateRegionTableData(data: TrafficItem[]) {
    this.regionTableData = data
  }

  @action.bound updateIspSeriesData(data: IPieSeriesData[]) {
    this.ispSeriesData = data
  }

  @action.bound updateIspTableData(data: TrafficItem[]) {
    this.ispTableData = data
  }

  @ToasterStore.handle()
  fetchRegionData(options: ISearchOptionProps) {
    return makeRegionRequest(this.i18n, this.statisticsApis.fetchAnalysisFlow, options)
      .then(dataList => transformTimelineData(dataList))
      .then(dataList => {
        this.updateRegionTableData(dataList)
        this.updateRegionSeriesData(transformRegionSeriesData(dataList.slice(0, topN), '流量'))
      })
  }

  @ToasterStore.handle()
  fetchIspData(options: ISearchOptionProps) {
    return makeIspRequest(this.i18n, this.statisticsApis.fetchAnalysisFlow, options)
      .then(dataList => transformTimelineData(dataList))
      .then(dataList => {
        this.updateIspTableData(dataList)
        this.updateIspSeriesData(transformIspSeriesData(dataList))
      })
  }
}

/**
 * 带宽
 */
@injectable()
export class BandwidthData {
  @observable.ref regionSeriesData!: IBarSeriesData
  @observable.ref regionTableData: TrafficItem[] = []

  @observable.ref ispSeriesData!: IPieSeriesData[]
  @observable.ref ispTableData: TrafficItem[] = []

  constructor(
    private statisticsApis: StatisticsApis,
    private toasterStore: ToasterStore,
    private i18n: I18nStore
  ) {
    ToasterStore.bindTo(this, this.toasterStore)
  }

  @computed get regionColumns() {
    return [{
      title: this.i18n.t(messages.region),
      dataIndex: 'name'
    }, {
      title: this.i18n.t(messages.bandwidth),
      dataIndex: 'value',
      render: (val: number) => humanizeBandwidth(val)
    }]
  }

  @computed get ispColumns() {
    return [{
      title: this.i18n.t(messages.isp),
      dataIndex: 'name'
    }, {
      title: this.i18n.t(messages.bandwidth),
      dataIndex: 'value',
      render: (val: number) => humanizeBandwidth(val)
    }]
  }

  @action.bound updateRegionSeriesData(data: IBarSeriesData) {
    this.regionSeriesData = data
  }

  @action.bound updateRegionTableData(data: TrafficItem[]) {
    this.regionTableData = data
  }

  @action.bound updateIspSeriesData(data: IPieSeriesData[]) {
    this.ispSeriesData = data
  }

  @action.bound updateIspTableData(data: TrafficItem[]) {
    this.ispTableData = data
  }

  @ToasterStore.handle()
  fetchRegionData(options: ISearchOptionProps) {
    return makeRegionRequest(
      this.i18n,
      this.statisticsApis.fetchAnalysisBandwidth,
      options,
      (points: number[]) => (points.length ? max(points)! : 0)
    )
      .then(dataList => transformTimelineData(dataList))
      .then(dataList => {
        this.updateRegionTableData(dataList)
        this.updateRegionSeriesData(transformRegionSeriesData(dataList.slice(0, topN), '带宽'))
      })
  }

  @ToasterStore.handle()
  fetchIspData(options: ISearchOptionProps) {
    return makeIspRequest(
      this.i18n,
      this.statisticsApis.fetchAnalysisBandwidth,
      options,
      (points: number[]) => (points.length ? max(points)! : 0)
    )
      .then(dataList => transformTimelineData(dataList))
      .then(dataList => {
        this.updateIspTableData(dataList)
        this.updateIspSeriesData(transformIspSeriesData(dataList))
      })
  }
}

/**
 * 请求数
 */
@injectable()
export class ReqCountData {
  @observable.ref regionSeriesData!: IBarSeriesData
  @observable.ref regionTableData: TrafficItem[] = []

  @observable.ref ispSeriesData!: IPieSeriesData[]
  @observable.ref ispTableData: TrafficItem[] = []

  constructor(
    private statisticsApis: StatisticsApis,
    private toasterStore: ToasterStore,
    private i18n: I18nStore
  ) {
    ToasterStore.bindTo(this, this.toasterStore)
  }

  @computed get regionColumns() {
    return [{
      title: this.i18n.t(messages.region),
      dataIndex: 'name'
    }, {
      title: this.i18n.t(messages.reqCount),
      dataIndex: 'value',
      render: (val: number) => this.i18n.t(humanizeReqcount(val))
    }, {
      title: this.i18n.t(messages.regionDistribution),
      dataIndex: 'percent',
      render: (val: number) => humanizePercent(val)
    }]
  }

  @computed get ispColumns() {
    return [{
      title: this.i18n.t(messages.isp),
      dataIndex: 'name'
    }, {
      title: this.i18n.t(messages.reqCount),
      dataIndex: 'value',
      render: (val: number) => this.i18n.t(humanizeReqcount(val))
    }, {
      title: this.i18n.t(messages.reqProportion),
      dataIndex: 'percent',
      render: (val: number) => humanizePercent(val)
    }]
  }

  @action.bound updateRegionSeriesData(data: IBarSeriesData) {
    this.regionSeriesData = data
  }

  @action.bound updateRegionTableData(data: TrafficItem[]) {
    this.regionTableData = data
  }

  @action.bound updateIspSeriesData(data: IPieSeriesData[]) {
    this.ispSeriesData = data
  }

  @action.bound updateIspTableData(data: TrafficItem[]) {
    this.ispTableData = data
  }

  @ToasterStore.handle()
  fetchRegionData(options: ISearchOptionProps) {
    return makeRegionRequest(this.i18n, this.statisticsApis.fetchAnalysisReqCount, options)
      .then(dataList => transformTimelineData(dataList))
      .then(dataList => {
        this.updateRegionTableData(dataList)
        this.updateRegionSeriesData(transformRegionSeriesData(dataList.slice(0, topN), '请求数'))
      })
  }

  @ToasterStore.handle()
  fetchIspData(options: ISearchOptionProps) {
    return makeIspRequest(this.i18n, this.statisticsApis.fetchAnalysisReqCount, options)
      .then(dataList => transformTimelineData(dataList))
      .then(dataList => {
        this.updateIspTableData(dataList)
        this.updateIspSeriesData(transformIspSeriesData(dataList))
      })
  }
}

function transformTimelineData(dataList: SimplifyTrafficItem[]): TrafficItem[] {
  const total = dataList.reduce((result, current) => result + current.value, 0)
  dataList.sort((prev, next) => next.value - prev.value)

  return dataList.map(item => ({
    ...item,
    percent: enhancedDivision(item.value, total)
  }))
}

function transformRegionSeriesData(dataList: TrafficItem[], name: string): IBarSeriesData {
  return {
    categories: dataList.map(item => item.name),
    data: [{ name, data: dataList.map(item => item.value) }]
  }
}

function transformIspSeriesData(dataList: TrafficItem[]): IPieSeriesData[] {
  const ispData = dataList.reduce((result, current) => {
    result[current.name] = current.percent!
    return result
  }, {} as Record<string, number>)
  return transformNormalPieSeries(ispData, '运营商占比')
}

function makeRegionRequest(
  i18n: I18nStore,
  fetchPromise: (_: unknown) => Promise<{ value: number[] }>,
  options: ISearchOptionProps,
  calcValue = (points: number[]) => sum(points)
): Promise<SimplifyTrafficItem[]> {
  const taskProcess = function(searchOptions: ISearchOptionProps) {
    return fetchPromise(transformAnalysisOptions(searchOptions)).then(timelineData => ({
      name: i18n.t(humanizeRegion(searchOptions.region[0])),
      value: calcValue(timelineData.value)
    }))
  }
  const taskRequest = concurrency(taskProcess, concurrencyLimit)
  const regionTasks = allRegions.map(region => ({ ...options, region: [region] }))

  return taskRequest(regionTasks)
}

function makeIspRequest(
  i18n: I18nStore,
  fetchPromise: (_: unknown) => Promise<{ value: number[] }>,
  options: ISearchOptionProps,
  calcValue = (points: number[]) => sum(points)
): Promise<SimplifyTrafficItem[]> {
  const taskProcess = function(searchOptions: ISearchOptionProps) {
    return fetchPromise(transformAnalysisOptions(searchOptions)).then(timelineData => ({
      name: i18n.t(humanizeIsp(searchOptions.isp)),
      value: calcValue(timelineData.value)
    }))
  }
  const taskRequest = concurrency(taskProcess, concurrencyLimit)
  const ispTasks = allIsps.map(isp => ({ ...options, isp }))

  return taskRequest(ispTasks)
}
