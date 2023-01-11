/**
 * @file component APIReport of Dashboard
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import moment from 'moment'
import autobind from 'autobind-decorator'
import { computed, action, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button, Spin } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import ReactChart from 'portal-base/common/components/ReactHighcharts'

import merge from 'kodo/utils/merge'

import { getFormattedDateRangeValue, granularityFormatMap } from 'kodo/transforms/date-time'
import { getSplineChartBaseConfig } from 'kodo/transforms/chart'

import { regionAll } from 'kodo/constants/region'
import { ISeries } from 'kodo/constants/chart'
import { Granularity } from 'kodo/constants/date-time'
import { flowSrcValueMap, SelectField } from 'kodo/constants/statistics'
import { bucketAll } from 'kodo/constants/dashboard'

import { Auth } from 'kodo/components/common/Auth'

import { StatisticsApis, IAPIValue, IReportData } from 'kodo/apis/statistics'

import GranularityTab from '../GranularityTab'
import { IChildComponentProps as IProps } from '../index'
import styles from '../style.m.less'

const loadingId = 'api'

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalAPIReport extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  statisticsApis = this.props.inject(StatisticsApis)
  @observable.ref apiData: ISeries[] = []
  @observable totalGetCount: number | null
  @observable totalPutCount: number | null
  @observable averageGetCount: number | null
  @observable averagePutCount: number | null
  @observable granularity: Granularity = Granularity.OneDay

  chart: React.RefObject<ReactChart> = React.createRef()
  disposable = new Disposable()

  loadings = Loadings.collectFrom(this, loadingId)

  @autobind exportCSV() {
    this.chart.current!.getChart().downloadCSV()
  }

  getFormattedInfo(data: number | null) {
    return data != null && data >= 0 ? data : '--'
  }

  @computed get apiOptions() {
    const { dateRange, bucket, region, ftype } = this.props.queryOptions
    const [dateStart, dateEnd] = getFormattedDateRangeValue(dateRange)
    return {
      begin: dateStart,
      end: dateEnd,
      select: SelectField.Hits,
      ...(region !== regionAll.symbol && { $region: region }),
      ...(bucket !== bucketAll && { $bucket: bucket }),
      g: this.granularity,
      $ftype: ftype
    }
  }

  @computed get baseOptions() {
    return {
      ...this.props.queryOptions,
      granularity: this.granularity
    }
  }

  @computed get chartConfig() {
    return merge(getSplineChartBaseConfig(undefined, granularityFormatMap[this.granularity]), {
      exporting: {
        filename: 'API 请求'
      },
      series: this.apiData
    })
  }

  @action.bound refresh() {
    this.totalGetCount = null
    this.totalPutCount = null
    this.averageGetCount = null
    this.averagePutCount = null
    this.apiData = []
    this.fetchAPICount()
  }

  @action.bound updateData(data: Array<IReportData<IAPIValue>>) {
    const [getData, putData] = data

    let totalGet = 0
    const getList = getData && (
      getData.filter(item => item.values && Number.isFinite(item.values.hits))
        .map<[number, number]>(item => {
          totalGet += item.values.hits
          return [moment(item.time).valueOf(), item.values.hits]
        })
    ) || []
    const getSeries: ISeries = {
      name: 'Get',
      data: getList
    }

    if (getList.length) {
      this.totalGetCount = totalGet
      this.averageGetCount = Math.ceil(this.totalGetCount / getList.length)
    }

    let totalPut = 0
    const putList = putData && (
      putData.filter(item => item.values && Number.isFinite(item.values.hits))
        .map<[number, number]>(item => {
          totalPut += item.values.hits
          return [moment(item.time).valueOf(), item.values.hits]
        })
    ) || []
    const putSeries: ISeries = {
      name: 'Put',
      data: putList
    }

    if (putList.length) {
      this.totalPutCount = totalPut
      this.averagePutCount = Math.ceil(this.totalPutCount / putList.length)
    }

    this.apiData = [getSeries, putSeries]
  }

  @action.bound updateGranularity(value: Granularity) {
    this.granularity = value
  }

  @Toaster.handle()
  @Loadings.handle(loadingId)
  fetchAPICount() {
    const req = Promise.all([
      this.statisticsApis.getOutflowData<IAPIValue>({
        ...this.apiOptions,
        $src: flowSrcValueMap.api
      }),
      this.statisticsApis.getAPIPutData<IAPIValue>(this.apiOptions)
    ])
    req.then(this.updateData).catch(() => { /**/ })
    return req
  }

  @autobind
  refreshChart() {
    setTimeout(() => {
      if ((!this.apiData || this.apiData.length === 0) && this.chart.current) {
        this.chart.current.chart!.redraw()
      }
    }, 250)
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.baseOptions,
        () => {
          if (this.props.queryOptions) {
            this.refresh()
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.apiData,
        _ => this.refreshChart(),
        { fireImmediately: true }
      )
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @computed get informationView() {
    return (
      <Spin spinning={this.loadings.isLoading(loadingId)}>
        <div className={styles.tipInfo}>
          <div>
            <span className={styles.calculateData}>{this.getFormattedInfo(this.totalGetCount)}</span>
            <p className={styles.primary}>GET 请求总次数</p>
          </div>
          <div className={styles.leftGap}>
            <span className={styles.calculateData}>{this.getFormattedInfo(this.averageGetCount)}</span>
            <p className={styles.primary}>GET 请求总平均次数</p>
          </div>
          <div className={styles.leftGap}>
            <span className={styles.calculateData}>{this.getFormattedInfo(this.totalPutCount)}</span>
            <p className={styles.primary}>PUT 请求总次数</p>
          </div>
          <div className={styles.leftGap}>
            <span className={styles.calculateData}>{this.getFormattedInfo(this.averagePutCount)}</span>
            <p className={styles.primary}>PUT 请求总平均次数</p>
          </div>
        </div>
      </Spin>
    )
  }

  render() {
    return (
      <div>
        <div className={styles.contentHeaderBox}>
          <GranularityTab
            onChange={this.updateGranularity}
            value={this.granularity}
            granularities={[Granularity.FiveMinutes, Granularity.OneHour, Granularity.OneDay]}
          />
          <Auth
            notProtectedUser
            render={disabled => (
              <Button icon="cloud-download" disabled={disabled} onClick={this.exportCSV}>导出 CSV</Button>
            )}
          />
        </div>
        {this.informationView}
        <div className={styles.reactChart}>
          <ReactChart
            config={this.chartConfig}
            ref={this.chart}
            isLoading={this.loadings.isLoading(loadingId)}
          />
        </div>
      </div>
    )
  }
}

export default function APIReport(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalAPIReport {...props} inject={inject} />
    )} />
  )
}
