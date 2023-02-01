/**
 * @file component StorageTrend of Overview
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import moment from 'moment'
import autobind from 'autobind-decorator'
import { observable, action, computed, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { DatePicker } from 'react-icecream/lib'
import PopupContainer from 'react-icecream/lib/popup-container'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import ReactChart from 'portal-base/common/components/ReactHighcharts'
import Disposable from 'qn-fe-core/disposable'
import { InjectFunc, Inject } from 'qn-fe-core/di'

import merge from 'kodo/utils/merge'

import { getLatestDuration, getFormattedDateRangeValue, granularityFormatMap } from 'kodo/transforms/date-time'
import { getAreaSplineChartBaseConfig } from 'kodo/transforms/chart'
import { humanizeStorageSize } from 'kodo/transforms/unit'
import { hasPreDelQueryOption } from 'kodo/transforms/statistics'

import { RangePickerValue } from 'kodo/polyfills/icecream/date-picker'

import { ISeries, fillColor } from 'kodo/constants/chart'
import { Granularity } from 'kodo/constants/date-time'
import { StorageType } from 'kodo/constants/statistics'

import OverviewDateRangeTab, { OverviewDateRangeType } from 'kodo/components/common/Tabs/OverviewDateRangeTab'

import { IStatdBaseData, IStatdBaseOptionsWithRegion, StatisticsApis } from 'kodo/apis/statistics'

import styles from './style.m.less'

export interface IProps {
  ftype: StorageType
}

interface DiDeps {
  inject: InjectFunc
}

const loadingId = 'chart'

@observer
class InternalStorageTrend extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  statisticsApis = this.props.inject(StatisticsApis)
  @observable overviewPredefinedTime: OverviewDateRangeType | undefined = OverviewDateRangeType.SevenDays
  @observable.ref dateRange: RangePickerValue = getLatestDuration(6, undefined, 'days')
  @observable.ref storageData: ISeries[]

  loadings = Loadings.collectFrom(this, loadingId)
  disposable = new Disposable()

  @computed
  get chartConfig() {
    return merge(
      getAreaSplineChartBaseConfig(humanizeStorageSize, granularityFormatMap[Granularity.OneDay]),
      { series: this.storageData }
    )
  }

  @computed
  get options(): IStatdBaseOptionsWithRegion {
    const [dateStart, dateEnd] = getFormattedDateRangeValue(this.dateRange)
    return {
      begin: dateStart,
      end: dateEnd,
      g: Granularity.OneDay,
      ...(hasPreDelQueryOption(this.props.ftype) ? { no_predel: 1 } : {})
    }
  }

  @action.bound
  updateData(data: IStatdBaseData) {
    const series = data
      ? (
        data.times.map<[number, number]>((time, index) => (
          [moment(time).valueOf() * 1000, data.datas[index]]
        ))
      )
      : []

    this.storageData = [
      {
        name: '存储量',
        data: series,
        fillColor
      }
    ]
  }

  @action.bound
  updateDateRange(
    dateRange: RangePickerValue,
    isOverviewPredefinedTimeChange?: boolean
  ) {
    if (!isOverviewPredefinedTimeChange) {
      this.overviewPredefinedTime = undefined
    }
    this.dateRange = dateRange
  }

  @action.bound
  chooseSevenDays() {
    this.overviewPredefinedTime = OverviewDateRangeType.SevenDays
    this.updateDateRange(getLatestDuration(6, undefined, 'days'), true)
  }

  @action.bound
  chooseFifteenDays() {
    this.overviewPredefinedTime = OverviewDateRangeType.FifteenDays
    this.updateDateRange(getLatestDuration(14, undefined, 'days'), true)
  }

  @autobind
  handleOverviewDateChange(value: OverviewDateRangeType) {
    switch (value) {
      case OverviewDateRangeType.SevenDays:
        this.chooseSevenDays()
        break
      case OverviewDateRangeType.FifteenDays:
        this.chooseFifteenDays()
        break
      default:
    }
  }

  @Loadings.handle(loadingId)
  @Toaster.handle()
  fetchData() {
    const fetchStorageData = this.statisticsApis.getStorageTypeStorageDataFetchMethod(this.props.ftype)

    if (!fetchStorageData) { return Promise.reject('存储量拉取失败') }

    const promise = fetchStorageData(this.options)
    promise.then(this.updateData)
    return promise
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => ({
        type: this.props.ftype,
        date: this.dateRange
      }),
      () => this.fetchData(),
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @computed
  get titleView() {
    const [start, end] = this.dateRange
    const isTodayEnd = end!.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
    const range = end!.from(start, true)

    return isTodayEnd
      ? `近 ${range}存储趋势`
      : `历史 ${range}存储趋势`
  }

  render() {
    return (
      <div className={styles.trendBox}>
        <div className={styles.chartHeader}>
          <span className={styles.title}>
            {this.titleView}
          </span>
          <div>
            <PopupContainer>
              <OverviewDateRangeTab
                disabledOptions={[OverviewDateRangeType.LastMonth, OverviewDateRangeType.CurrentMonth]}
                onChange={this.handleOverviewDateChange}
                value={this.overviewPredefinedTime}
              />
              <DatePicker.RangePicker
                className={styles.datePicker}
                onChange={range => this.updateDateRange(range)}
                value={this.dateRange}
                allowClear={false}
              />
            </PopupContainer>
          </div>
        </div>
        <div>
          <ReactChart
            config={this.chartConfig}
            isLoading={this.loadings.isLoading(loadingId)}
          />
        </div>
      </div>
    )
  }
}

export default function StorageTrend(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalStorageTrend {...props} inject={inject} />
    )} />
  )
}
