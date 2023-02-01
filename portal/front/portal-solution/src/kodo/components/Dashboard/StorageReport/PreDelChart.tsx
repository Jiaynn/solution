/**
 * @desc Pre delete storage chart
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import moment from 'moment'
import { computed, observable, reaction, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import ReactChart from 'portal-base/common/components/ReactHighcharts'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import Disposable from 'qn-fe-core/disposable'
import { InjectFunc } from 'qn-fe-core/di'

import merge from 'kodo/utils/merge'

import { valuesOf } from 'kodo/utils/ts'

import { getAreaSplineChartBaseConfig } from 'kodo/transforms/chart'
import { granularityFormatMap } from 'kodo/transforms/date-time'
import { hasPreDelQueryOption } from 'kodo/transforms/statistics'
import { humanizeStorageSize } from 'kodo/transforms/unit'

import { regionAll } from 'kodo/constants/region'
import { bucketAll } from 'kodo/constants/dashboard'
import { ISeries, fillColor } from 'kodo/constants/chart'

import { IStatdBaseData, IStatdBaseOptionsWithRegion, StatisticsApis } from 'kodo/apis/statistics'

import { IComponentProps as PreDelChartProps } from './index'
import styles from '../style.m.less'

enum Loading {
  FetchData = 'FetchData'
}

interface DiDeps {
  inject: InjectFunc
}

@observer
export default class PreDelChart extends Component<PreDelChartProps & DiDeps> {
  constructor(props: PreDelChartProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  statisticsApis = this.props.inject(StatisticsApis)

  chart: React.RefObject<ReactChart> = React.createRef()

  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  disposable = new Disposable()

  @observable.ref chartData: ISeries[]

  @computed
  get isFetchData() {
    return this.loadings.isLoading(Loading.FetchData)
  }

  @computed
  get chartConfig() {
    return merge(
      getAreaSplineChartBaseConfig(humanizeStorageSize, granularityFormatMap[this.props.options.g]),
      {
        exporting: {
          filename: '存储量'
        },
        series: this.chartData
      }
    )
  }

  @computed
  get queryOptions(): IStatdBaseOptionsWithRegion {
    const { ftype, options } = this.props
    const { region, bucket, ...rest } = options
    return {
      ...rest,
      ...(region !== regionAll.symbol && { region }),
      ...(bucket !== bucketAll && { bucket }),
      ...(hasPreDelQueryOption(ftype) ? { only_predel: 1 } : {})
    }
  }

  @action.bound
  updateChartData(data: IStatdBaseData) {
    const { bucket } = this.props

    const storageList = data && data.times.map<[number, number]>(
      (time, index) => ([moment(time).valueOf() * 1000, data.datas[index]])
    ) || []

    this.chartData = [
      {
        name: bucket,
        data: storageList,
        fillColor
      }
    ]
  }

  @Toaster.handle()
  @Loadings.handle(Loading.FetchData)
  async fetchData() {
    const { ftype } = this.props

    const fetchStorageData = this.statisticsApis.getStorageTypeStorageDataFetchMethod(ftype)

    if (!fetchStorageData) { throw new Error('提前删除量拉取失败') }

    const promise = fetchStorageData(this.queryOptions)

    this.updateChartData(await promise)

    return promise
  }

  @action.bound
  refresh() {
    this.chartData = []
    this.fetchData()
  }

  @autobind
  downloadCSV() {
    this.chart.current!.getChart().downloadCSV()
  }

  @autobind
  refreshChart() {
    setTimeout(() => {
      if ((!this.chartData || this.chartData.length === 0) && this.chart.current) {
        this.chart.current.chart!.redraw()
      }
    }, 150)
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.options,
        () => this.refresh(),
        { fireImmediately: true }
      ),
      reaction(
        () => this.chartData,
        _ => this.refreshChart(),
        { fireImmediately: true }
      )
    )
  }

  render() {
    return (
      <div className={styles.reactChart}>
        <ReactChart config={this.chartConfig} ref={this.chart} isLoading={this.isFetchData} />
      </div>
    )
  }
}
