/**
 * @file component FlowReport of Dashboard
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { action, computed, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Spin } from 'react-icecream/lib'
import Disposable from 'qn-fe-core/disposable'
import ReactChart from 'portal-base/common/components/ReactHighcharts'

import merge from 'kodo/utils/merge'

import { humanizeStorageSize } from 'kodo/transforms/unit'
import { getAreaSplineStackedChartBaseConfig } from 'kodo/transforms/chart'

import { isValidFlowValue, sumFlowOfTime } from 'kodo/transforms/statistics'

import { flowSrcTypeTextMap, FlowSrcType, kodoBillGroupTextMap } from 'kodo/constants/statistics'
import { bucketAll } from 'kodo/constants/dashboard'
import { Granularity } from 'kodo/constants/date-time'
import { ISeries, fillColor } from 'kodo/constants/chart'

import { IFlowValue, IFlowData } from 'kodo/apis/statistics'

import getFlowComponent, { IComponentProps as IProps } from './index'

import styles from '../style.m.less'

interface IBucketPeakFlow {
  flow?: number
  bucket?: string
}

@observer
class FlowReport extends React.Component<IProps> {
  chart: React.RefObject<ReactChart> = React.createRef()

  disposable = new Disposable()

  @observable.ref chartSeries: ISeries[] | null

  @observable totalFlow: number | null

  @observable averageFlow: number | null

  @observable.ref bucketPeakFlow: IBucketPeakFlow = {}

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @action.bound
  updateChartSeries(data: IFlowData<IFlowValue>) {
    if (this.props.groupBy) {
      this.updateChartSeriesByGroupedFlowData(data)
      return
    }

    let totalFlow = 0
    const seriesData: Array<[number, number]> = data.map(({ time, values }) => {
      const flow = sumFlowOfTime(values)
      totalFlow += flow
      return [Date.parse(time), flow]
    })

    if (seriesData.length) {
      this.totalFlow = totalFlow
      this.averageFlow = totalFlow / seriesData.length
    }

    this.chartSeries = !data || data.length === 0
      ? []
      : [{ name: bucketAll, fillColor, data: seriesData }]
  }

  @action.bound
  updateChartSeriesByGroupedFlowData(data: IFlowData<IFlowValue>) {
    const times = data && data.map(item => item.time)
    const buckets = data && data.length ? Object.keys(data[0].values) : []

    let totalFlow = 0 // 记录总流量
    const series: ISeries[] = [] // 记录绘图数据

    // 计算产生流量最多的空间
    this.bucketPeakFlow = buckets.slice(0, 50).reduce<IBucketPeakFlow>(
      (bucketPeakFlow, bucket) => {
        const seriesData: ISeries['data'] = []

        const bucketTotalFlow = times.reduce<number>(
          (accumulator, time, index) => {
            const flow = isValidFlowValue(data[index].values[bucket]) ? data[index].values[bucket].flow : 0
            seriesData.push([Date.parse(time), flow])
            return accumulator + flow
          },
          0
        )

        totalFlow += bucketTotalFlow
        series.push({ name: bucket, fillColor, data: seriesData })

        return bucketPeakFlow.flow == null || bucketPeakFlow.flow < bucketTotalFlow
          ? { flow: bucketTotalFlow, bucket }
          : bucketPeakFlow
      },
      {}
    )

    this.chartSeries = series

    if (this.chartSeries.length) {
      this.totalFlow = totalFlow
      this.averageFlow = this.totalFlow / times.length
    }
  }

  @action.bound refresh() {
    this.chartSeries = null
    this.totalFlow = null
    this.averageFlow = null
    this.bucketPeakFlow = {}
    this.updateChartSeries(this.props.data)
  }

  @computed get chartConfig(): Highcharts.Options {
    return merge(getAreaSplineStackedChartBaseConfig(humanizeStorageSize, this.props.timeFormat), {
      yAxis: {
        allowDecimals: false
      },
      exporting: {
        filename: '空间流量-' + flowSrcTypeTextMap[this.props.flowType!]
      },
      series: this.chartSeries
    })
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.data,
      () => this.refresh(),
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @computed
  get statisticView() {
    const data = {
      totalFlow: this.totalFlow != null ? humanizeStorageSize(this.totalFlow) : '--',
      averageFlow: Number.isFinite(this.averageFlow!) ? humanizeStorageSize(this.averageFlow!) : '--',
      bucketPeakFlow: this.bucketPeakFlow.flow != null ? humanizeStorageSize(this.bucketPeakFlow.flow) : '--'
    }

    const hideBucketPeakFlow = (
      this.props.flowType === FlowSrcType.ExternalInflow
      && this.props.bucket !== bucketAll
      || !this.props.groupBy
      || !this.bucketPeakFlow.bucket
    )

    return (
      <div className={styles.tipInfo}>
        <div className={styles.left}>
          <Spin spinning={this.props.isLoadingData}>
            <div className={styles.flowTipBox}>
              <div>
                <span className={styles.calculateData}>
                  {data.totalFlow}
                </span>
                <p className={styles.primary}>访问总流量</p>
              </div>
              <div className={styles.leftGap}>
                <span className={styles.calculateData}>
                  {data.averageFlow}
                </span>
                <p className={styles.primary}>平均流量</p>
              </div>
              {!hideBucketPeakFlow && (
                <div className={styles.leftGap}>
                  <span className={styles.calculateData}>
                    {data.bucketPeakFlow}
                  </span>
                  <p className={styles.primary}>
                    流量最大{kodoBillGroupTextMap[this.props.groupBy!]}
                    {this.bucketPeakFlow.bucket != null ? '，' + this.bucketPeakFlow.bucket : ''}
                  </p>
                </div>
              )}
            </div>
          </Spin>
        </div>
        <div className={styles.right}>
          {this.props.queryLimitInfo && (
            <p>注：{this.props.queryLimitInfo}</p>
          )}
          {this.props.flowType === FlowSrcType.SingleExternalOutflow
          && this.props.cname !== ''
          && (
            <p>移动单线路 CNAME 地址：{this.props.cname}</p>
          )}
        </div>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.statisticView}
        <div className={styles.reactChart}>
          <ReactChart
            ref={this.chart}
            config={this.chartConfig}
            isLoading={this.props.isLoadingData}
          />
        </div>
      </div>
    )
  }
}

export default getFlowComponent(
  FlowReport,
  [Granularity.FiveMinutes, Granularity.OneHour, Granularity.OneDay]
)
