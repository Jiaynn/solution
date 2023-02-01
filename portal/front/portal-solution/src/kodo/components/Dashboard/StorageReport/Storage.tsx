/**
 * @file component Storage of Dashboard
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { observable, action, computed, reaction, runInAction, makeObservable } from 'mobx'
import moment from 'moment'
import { observer } from 'mobx-react'
import { Spin } from 'react-icecream/lib'
import { InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import ReactChart from 'portal-base/common/components/ReactHighcharts'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import merge from 'kodo/utils/merge'

import { humanizeStorageSize } from 'kodo/transforms/unit'
import { getAreaSplineChartBaseConfig } from 'kodo/transforms/chart'
import { granularityFormatMap } from 'kodo/transforms/date-time'
import { hasPreDelQueryOption } from 'kodo/transforms/statistics'

import { bucketAll } from 'kodo/constants/dashboard'
import { regionAll } from 'kodo/constants/region'
import { ISeries, fillColor } from 'kodo/constants/chart'

import {
  IStatdBaseData, IStatdBaseOptionsWithRegion, StatisticsApis
} from 'kodo/apis/statistics'

import { IComponentProps as IProps } from './index'

import styles from '../style.m.less'

const loadingId = 'storage'

interface DiDeps {
  inject: InjectFunc
}

@observer
export default class Storage extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  statisticsApis = this.props.inject(StatisticsApis)
  @observable currentStorage: number | null = null
  @observable currentFileCount: number | null = null
  @observable averageStorage: number | null = null
  @observable averageFileCount: number | null = null
  @observable.ref storageData: ISeries[]

  chart: React.RefObject<ReactChart> = React.createRef()
  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, loadingId)

  @computed
  get isLoading() {
    return this.loadings.isLoading(loadingId)
  }

  @computed
  get chartConfig(): Highcharts.Options {
    return merge(
      getAreaSplineChartBaseConfig(humanizeStorageSize, granularityFormatMap[this.props.options.g]),
      {
        exporting: {
          filename: '存储量'
        },
        series: this.storageData
      }
    )
  }

  @computed
  get options(): IStatdBaseOptionsWithRegion {
    const { ftype } = this.props
    const { region, bucket, ...params } = this.props.options
    return {
      ...params,
      ...(region !== regionAll.symbol && { region }),
      ...(bucket !== bucketAll && { bucket }),
      ...(hasPreDelQueryOption(ftype) ? { no_predel: 1 } : {})
    }
  }

  @autobind
  downloadCSV() {
    this.chart.current!.getChart().downloadCSV()
  }

  @action.bound
  updateStorageData(data: IStatdBaseData) {
    const { bucket } = this.props
    let total = 0
    const storageList = data && (
      data.times.map<[number, number]>((time, index) => {
        total += data.datas[index]
        return [moment(time).valueOf() * 1000, data.datas[index]]
      })
    ) || []

    this.storageData = [
      {
        name: bucket,
        data: storageList,
        fillColor
      }
    ]

    this.currentStorage = data && data.datas.length
      ? storageList[storageList.length - 1][1]
      : null

    if (storageList.length) {
      this.averageStorage = total / storageList.length
    }
  }

  @action.bound
  updateFileCount(data: IStatdBaseData) {
    const { datas } = data
    const total = data && datas.reduce((result, current) => result + current, 0)

    this.currentFileCount = data && datas.length
      ? datas[datas.length - 1]
      : null

    if (data && datas.length) {
      this.averageFileCount = total / datas.length
    }
  }

  @Toaster.handle()
  @Loadings.handle(loadingId)
  async fetchData() {
    const { ftype } = this.props

    const fetchStorageData = this.statisticsApis.getStorageTypeStorageDataFetchMethod(ftype)
    const fetchCountData = this.statisticsApis.getStorageTypeCountDataFetchMethod(ftype)

    if (!fetchStorageData || !fetchCountData) { return Promise.reject('存储量拉取失败') }

    const [storage, fileCount] = await Promise.all([fetchStorageData(this.options), fetchCountData(this.options)])

    runInAction(() => {
      this.updateStorageData(storage)
      this.updateFileCount(fileCount)
    })
  }

  @action.bound
  refresh() {
    this.currentStorage = null
    this.currentFileCount = null
    this.averageStorage = null
    this.averageFileCount = null
    this.storageData = []
    this.fetchData()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @autobind
  redraw() {
    setTimeout(() => {
      if ((!this.storageData || this.storageData.length === 0) && this.chart.current) {
        this.chart.current.chart!.redraw()
      }
    }, 250)
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.options,
        data => {
          const { bucket, region } = data
          if (region && bucket) {
            this.refresh()
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.storageData,
        _ => this.redraw(),
        { fireImmediately: true }
      )
    )
  }

  render() {
    return (
      <div>
        <Spin spinning={this.isLoading}>
          <div className={styles.tipInfo}>
            <div>
              <span className={styles.calculateData}>
                {
                  this.currentStorage != null ? humanizeStorageSize(this.currentStorage) : '--'
                }
              </span>
              <p className={styles.primary}>当前存储量</p>
              {
                this.averageStorage != null && (
                  <span className={styles.next}>平均存储量：{humanizeStorageSize(this.averageStorage)}</span>
                )
              }
            </div>
            <div className={styles.leftGap}>
              <span className={styles.calculateData}>
                {this.currentFileCount != null ? this.currentFileCount : '--'}
              </span>
              <p className={styles.primary}>当前文件数</p>
              {
                this.averageFileCount != null && (
                  <span className={styles.next}>平均文件数：{Math.floor(this.averageFileCount)}</span>
                )
              }
            </div>
          </div>
        </Spin>
        <div className={styles.reactChart}>
          <ReactChart config={this.chartConfig} ref={this.chart} isLoading={this.isLoading} />
        </div>
      </div>
    )
  }
}
