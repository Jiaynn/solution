/**
 * @file component FileUploadCount of Dashboard
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { observable, computed, reaction, action, makeObservable } from 'mobx'
import moment from 'moment'
import { observer } from 'mobx-react'
import { Spin } from 'react-icecream/lib'
import { InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import ReactChart from 'portal-base/common/components/ReactHighcharts'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import merge from 'kodo/utils/merge'

import { getAreaSplineChartBaseConfig } from 'kodo/transforms/chart'
import { granularityFormatMap } from 'kodo/transforms/date-time'

import { StorageType, FileUploadCountSelectField } from 'kodo/constants/statistics'
import { bucketAll } from 'kodo/constants/dashboard'
import { regionAll } from 'kodo/constants/region'
import { ISeries, fillColor } from 'kodo/constants/chart'

import {
  StatisticsApis, NormalFileUploadCountData,
  LineFileUploadCountData, ArchiveFileUploadCountData
} from 'kodo/apis/statistics'

import { IComponentProps as IProps } from './index'
import styles from '../style.m.less'

const loadingId = 'fileUploadCount'

interface DiDeps {
  inject: InjectFunc
}

@observer
export default class FileUploadCount extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  statisticsApis = this.props.inject(StatisticsApis)
  @observable currentFileUploadCount: number | null = null
  @observable averageFileUploadCount: number | null = null
  @observable.ref fileUploadCount: ISeries[] = []

  chart: React.RefObject<ReactChart> = React.createRef()
  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, loadingId)

  @computed
  get isLoading() {
    return this.loadings.isLoading(loadingId)
  }

  @computed
  get chartConfig() {
    return merge(getAreaSplineChartBaseConfig(undefined, granularityFormatMap[this.props.options.g]), {
      exporting: {
        filename: '上传文件数'
      },
      series: this.fileUploadCount
    })
  }

  @computed
  get baseOptions() {
    const { bucket, region, ...options } = this.props.options
    return {
      ...options,
      ...(region !== regionAll.symbol && { region }),
      ...(bucket !== bucketAll && { bucket })
    }
  }

  @autobind
  downloadCSV() {
    this.chart.current!.getChart().downloadCSV()
  }

  updateFileUploadCount(
    data: NormalFileUploadCountData | LineFileUploadCountData | ArchiveFileUploadCountData,
    type: FileUploadCountSelectField
  ): void {
    action(() => {
      let total = 0
      const { bucket } = this.props
      const fileCountList: Array<[number, number]> = []
      data.forEach(item => {
        total += item.values[type]
        fileCountList.push([moment(item.time).valueOf(), item.values[type]])
      })

      this.fileUploadCount = [{
        name: bucket,
        data: fileCountList,
        fillColor
      }]

      this.currentFileUploadCount = fileCountList && fileCountList.length
        ? fileCountList[fileCountList.length - 1][1]
        : null

      if (fileCountList.length) {
        this.averageFileUploadCount = total / fileCountList.length
      }
    })()
  }

  @Toaster.handle()
  @Loadings.handle(loadingId)
  fetchData(fileType: FileUploadCountSelectField) {
    const req = this.statisticsApis.getFileUploadCount({
      ...this.baseOptions,
      select: fileType
    })

    req.then(data => (
      this.updateFileUploadCount(data, fileType)
    )).catch(() => { /**/ })
    return req
  }

  @action.bound
  refresh() {
    this.fileUploadCount = []
    this.averageFileUploadCount = null
    this.currentFileUploadCount = null

    const fileTypeMap = {
      [StorageType.Standard]: FileUploadCountSelectField.NormalUpCount,
      [StorageType.LowFrequency]: FileUploadCountSelectField.LineUpCount,
      [StorageType.Archive]: FileUploadCountSelectField.ArchiveUpCount,
      [StorageType.DeepArchive]: FileUploadCountSelectField.DeepArchiveUpCount
    }

    this.fetchData(fileTypeMap[this.props.ftype])
  }

  @autobind
  refreshChart() {
    setTimeout(() => {
      if ((!this.fileUploadCount || this.fileUploadCount.length === 0) && this.chart.current) {
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
        data => {
          const { bucket, region } = data
          if (region && bucket) {
            this.refresh()
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.fileUploadCount,
        _ => this.refreshChart(),
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
                  this.currentFileUploadCount != null ? this.currentFileUploadCount : '--'
                }
              </span>
              <p className={styles.primary}>当日上传文件数</p>
              {
                this.averageFileUploadCount != null && (
                  <span className={styles.next}>平均上传文件数：{Math.floor(this.averageFileUploadCount)}</span>
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
