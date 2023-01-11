
import { computed, observable, reaction, action } from 'mobx'
import { clone, isEmpty, omit } from 'lodash'
import moment from 'moment'
import autobind from 'autobind-decorator'
import { ChartOptions } from 'react-icecream-charts'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { I18nStore } from 'portal-base/common/i18n'

import { exportCSVFile } from 'cdn/utils/csv'

import {
  isOptionsValid, getExportName,
  transformNormalPieSeries, transformNormalLineSeries, cutoutTimelineDataByTimestamp
} from 'cdn/transforms/statistics'
import { humanizeReqcount, humanizePercent, humanizeTraffic, humanizePercent100 } from 'cdn/transforms/unit'
import { enhancedDivision } from 'cdn/transforms/math'
import { ISeriesData, getChartCSVData, getAreaChartOptions, getPieChartOptions, XAxisType } from 'cdn/transforms/chart'

import { SearchType } from 'cdn/constants/statistics'

import StatisticsApis, { ITimelineOptions as INormalOptions } from 'cdn/apis/statistics'

import * as messages from './messages'
import { ISearchOptionProps } from '../Search/store'

export interface IStatisticsHitRatioProps {
  options: ISearchOptionProps
}

interface IDetailProps {
  hit: number,
  miss: number,
  trafficHit: number,
  trafficMiss: number
}

interface IHitTimelineDataProps {
  hit?: number[],
  trafficHit?: number[],
  time: number[]
}

enum LoadingType {
  SearchLine = 'SearchLine',
  SearchDetail = 'SearchDetail'
}

@injectable()
export default class LocalStore extends Store {
  constructor(
    @injectProps() private props: IStatisticsHitRatioProps,
    private statisticsApis: StatisticsApis,
    private i18n: I18nStore
  ) {
    super()
  }

  loadings = Loadings.collectFrom(this, LoadingType)

  @computed get isTimelineLoading() {
    return this.loadings.isLoading(LoadingType.SearchLine)
  }

  @computed get isDetailLoading() {
    return this.loadings.isLoading(LoadingType.SearchDetail)
  }

  @observable exportName = ''

  @action.bound updateExportName(name: string) {
    this.exportName = name
  }

  @computed get hitRatioSearchOptions(): INormalOptions {
    return omit(clone(this.props.options), 'region') as INormalOptions
  }

  @computed get isOptionsValid(): boolean {
    return isOptionsValid(this.hitRatioSearchOptions, SearchType.Hit)
  }

  @computed get isTimelineDataEmpty(): boolean {
    return isEmpty(this.timelineData) || isEmpty(this.timelineData.time)
  }

  @computed get isDetailDataEmpty(): boolean {
    return isEmpty(this.detailData)
  }

  @observable timelineData: IHitTimelineDataProps = { time: [] } // 命中率时间线数据
  @observable detailData!: IDetailProps // 命中率详情数据
  @observable currentType: 'traffic' | 'reqcount' = 'reqcount'

  @action.bound updateTimelineData(data: IHitTimelineDataProps) {
    this.timelineData = data
  }

  @action.bound updateDetailData(data: IDetailProps) {
    this.detailData = data
  }

  @action.bound updateCurrentType(type: 'traffic' | 'reqcount') {
    this.currentType = type
  }

  @computed get seriesData(): ISeriesData[] {
    return transformNormalLineSeries(
      this.timelineData as { time: number[] } & {},
      name => (name === 'trafficHit' ? this.i18n.t(messages.flowHitRatio) : this.i18n.t(messages.requestHitRatio))
    )
  }

  @autobind
  exportAreaData() {
    exportCSVFile(getChartCSVData(this.seriesData), this.exportName)
  }

  @computed get areaChartOptions(): ChartOptions {
    return getAreaChartOptions({
      unit: '%',
      decimals: 2,
      yAxis: { max: 100 }
    })
  }

  @computed get currentDetail() {
    if (!this.detailData) {
      return null
    }
    return (
      this.currentType === 'reqcount'
        ? { hit: this.detailData.hit, miss: this.detailData.miss }
        : { hit: this.detailData.trafficHit, miss: this.detailData.trafficMiss }
    )
  }

  @computed get pieSeriesData() {
    if (!this.currentDetail) {
      return []
    }
    return transformNormalPieSeries(this.currentDetail, this.i18n.t(messages.hitRatioDistribution))
  }

  @computed get pieChartOptions(): ChartOptions {
    return getPieChartOptions({
      tooltipFormatter({ pointData }) {
        const { pointDot, name, percentage } = pointData
        return `${pointDot} ${name}: <b>${humanizePercent100(percentage!)}</b><br/>`
      }
    })
  }

  @computed get pieTableData() {
    if (!this.currentDetail) {
      return []
    }
    const total = this.currentDetail.hit + this.currentDetail.miss
    return [{
      name: 'hit',
      value: this.currentDetail.hit,
      percent: enhancedDivision(this.currentDetail.hit, total)
    }, {
      name: 'miss',
      value: this.currentDetail.miss,
      percent: enhancedDivision(this.currentDetail.miss, total)
    }]
  }

  @computed get pieTableColumns() {
    return [{
      title: this.i18n.t(messages.category),
      dataIndex: 'name'
    }, {
      title: this.currentType === 'reqcount' ? this.i18n.t(messages.reqCount) : this.i18n.t(messages.flow),
      dataIndex: 'value',
      render: (val: number) => (this.currentType === 'reqcount' ? (v: number) => this.i18n.t(humanizeReqcount(v)) : humanizeTraffic)(val)
    }, {
      title: this.i18n.t(messages.percent),
      dataIndex: 'percent',
      render: (val: number) => humanizePercent(val)
    }]
  }

  @autobind
  exportPieData() {
    exportCSVFile(getChartCSVData(this.pieSeriesData, XAxisType.Category), this.exportName)
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.SearchLine)
  fetchLineData() {
    const req = this.statisticsApis.fetchHitRatioTimeline(this.hitRatioSearchOptions as INormalOptions).then(
      data => {
        // 往前 3 分钟
        const endTime = moment().subtract(3, 'minute').valueOf()
        this.updateTimelineData(cutoutTimelineDataByTimestamp(data, endTime))
      }
    )
    return req
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.SearchDetail)
  fetchDetailData() {
    const req = this.statisticsApis.fetchHitMiss(this.hitRatioSearchOptions as INormalOptions).then(
      data => this.updateDetailData(data)
    )
    return req
  }

  init() {
    // 若 optionsForQuery 发生变化，则请求 hitrate & hitmiss 统计数据
    this.addDisposer(reaction(
      () => this.props.options,
      options => {
        if (!this.isOptionsValid) {
          return
        }
        this.fetchLineData()
        this.fetchDetailData()

        const name = getExportName(options.startDate, options.endDate, '命中率统计')
        this.updateExportName(name)
      },
      { fireImmediately: true }
    ))
  }
}
