/**
 * @desc StateStore for 数据统计 - 视频瘦身 - 效益统计
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import { observable, action, computed, reaction } from 'mobx'
import { isEmpty } from 'lodash'
import { FieldState } from 'formstate-x'
import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { I18nStore } from 'portal-base/common/i18n'

import { exportCSVFile } from 'cdn/utils/csv'

import { isOptionsValid, getExportName } from 'cdn/transforms/statistics'

import { ISeriesData, getChartCSVData, getAreaChartOptions, getReqcountUnit } from 'cdn/transforms/chart'

import { flowUnit } from 'cdn/constants/chart'
import { SearchType } from 'cdn/constants/statistics'

import StatisticsApis, {
  IVideoSlimOptions,
  IVideoSlimTopNURLData,
  IVideoSlimBenefitTimelineData,
  IVideoSlimBenefitValue
} from 'cdn/apis/statistics'

import { IProps } from '.'

const TOP_N = 1000

export enum Loading {
  Timeline = 'Timeline',
  TopURL = 'TopURL'
}

@injectable()
export default class LocalStore extends Store {
  loadings = new Loadings()

  constructor(
    @injectProps() private props: IProps,
    private statisticsApis: StatisticsApis,
    private i18n: I18nStore
  ) {
    super()
  }

  @computed get isTimelineLoading() {
    return this.loadings.isLoading(Loading.Timeline)
  }

  // =============== data for 线图 & 总计 ================

  @observable.ref timelineData!: Omit<IVideoSlimBenefitTimelineData, 'total'>
  @observable.ref summary!: IVideoSlimBenefitValue

  @computed get isTimelineDataEmpty() {
    return isEmpty(this.timelineData) || isEmpty(this.timelineData.time) || isEmpty(this.timelineData.value)
  }

  @action updateTimelineDataAndSummary(data: IVideoSlimBenefitTimelineData) {
    const { time, value, total } = data
    this.timelineData = {
      time: time || [],
      value: value || []
    }
    this.summary = total
  }

  @computed get exportName() {
    return getExportName(
      this.props.options.startDate,
      this.props.options.endDate,
      '视频瘦身效益统计'
    )
  }

  @computed get seriesData() {
    return getLineSeries(this.timelineData)
  }

  @computed get chartOptions() {
    return getAreaChartOptions({
      unit: [flowUnit, getReqcountUnit(this.i18n.t)],
      decimals: [4, 3],
      yAxis: [{
        title: '节省流量',
        decimals: 0
      }, {
        title: '访问次数',
        decimals: 0
      }]
    })
  }

  @autobind
  exportCSV() {
    exportCSVFile(getChartCSVData(this.seriesData), this.exportName)
  }

  // =============== data for 表格 及其控制 ================

  @observable.ref topURLs!: IVideoSlimTopNURLData

  @action updateTopURLs(urls: IVideoSlimTopNURLData) {
    this.topURLs = urls
  }

  keywordState = new FieldState('')

  @computed get tableDataSource() {
    const keyword = this.keywordState.$
    return (this.topURLs || []).filter(
      info => info.url.indexOf(keyword) !== -1
    ).map((info, index) => ({
      ...info,
      index: index + 1
    }))
  }

  // =============== 请求数据相关逻辑 ================

  @ToasterStore.handle()
  fetchTimeline(options: IVideoSlimOptions) {
    const req = this.statisticsApis.fetchVideoSlimBenefitTimeline(options).then(
      res => this.updateTimelineDataAndSummary(res)
    )
    return this.loadings.promise(Loading.Timeline, req)
  }

  @ToasterStore.handle()
  fetchTopURLs(options: IVideoSlimOptions) {
    const req = this.statisticsApis.fetchVideoSlimTopNURL({
      ...options,
      topN: TOP_N
    }).then(
      res => this.updateTopURLs(res)
    )
    return this.loadings.promise(Loading.Timeline, req)
  }

  init() {
    this.addDisposer(this.keywordState.dispose)
    this.addDisposer(reaction(
      () => this.props.options,
      options => {
        if (!isOptionsValid(options, SearchType.VideoSlim)) {
          return
        }
        this.fetchTimeline(options)
        this.fetchTopURLs(options)
      },
      { fireImmediately: true }
    ))
  }
}

function getLineSeries(data: Omit<IVideoSlimBenefitTimelineData, 'total'>): ISeriesData[] {
  if (isEmpty(data) || data.time.length !== data.value.length) {
    return []
  }
  const points = data.value.reduce(
    (result, current, index) => {
      result.saveTraffic.push([
        data.time[index],
        current.save
      ])
      result.reqcount.push([
        data.time[index],
        current.reqCount
      ])
      return result
    },
    { saveTraffic: [] as ISeriesData['data'], reqcount: [] as ISeriesData['data'] }
  )

  return [{
    name: '节省流量',
    yAxis: 0,
    data: points.saveTraffic
  }, {
    name: '访问次数',
    yAxis: 1,
    data: points.reqcount
  }]
}
