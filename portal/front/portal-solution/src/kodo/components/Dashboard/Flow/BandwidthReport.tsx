/**
 * @file component BandwidthReport of Dashboard
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { action, computed, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Spin } from 'react-icecream/lib'
import Disposable from 'qn-fe-core/disposable'
import ReactChart from 'portal-base/common/components/ReactHighcharts'

import merge from 'kodo/utils/merge'

import { humanizeBandwidth } from 'kodo/transforms/unit'

import { getAreaSplineChartBaseConfig, getAreaSplineStackedChartBaseConfig } from 'kodo/transforms/chart'

import { humanizeTimestamp } from 'kodo/transforms/date-time'

import {
  IPeakFlow, IPeakFlowOfGroup, isValidFlowValue, flowToBandwidth, getPeakFlow, getPeakFlowOfGroup, getRangesByInterval,
  getTotalFlowOfTimeByFlowData, getNumOf95thPercentileByFlowData, sumFlowOfTime
} from 'kodo/transforms/statistics'

import { bucketAll } from 'kodo/constants/dashboard'
import { Granularity, intervalsOf5Minutes } from 'kodo/constants/date-time'
import { flowSrcTypeTextMap, KodoBillGroup, FlowSrcType } from 'kodo/constants/statistics'
import { ISeries, fillColor, totalOfSeriesName } from 'kodo/constants/chart'

import { IFlowData, IFlowValue } from 'kodo/apis/statistics'

import getFlowComponent, { IComponentProps } from './index'
import styles from '../style.m.less'

@observer
class BandwidthReport extends React.Component<IComponentProps> {
  chart: React.RefObject<ReactChart> = React.createRef()

  disposable = new Disposable()

  @observable.ref chartSeries: ISeries[] | null = null

  @observable.ref peakFlow: IPeakFlow = {}

  @observable.ref peakFlowOfGroup: IPeakFlowOfGroup = {}

  @observable numOf95Percentile = 0

  constructor(props: IComponentProps) {
    super(props)
    makeObservable(this)
  }

  @action.bound
  updatePeakFlowOfGroup({ time, flow, group }: IPeakFlowOfGroup) {
    if (!this.peakFlowOfGroup.flow || this.peakFlowOfGroup.flow < flow!) {
      this.peakFlowOfGroup = { time, flow, group }
    }
  }

  @action.bound
  updateChartSeries(data: IFlowData<IFlowValue>, excludes: string[] = []) {
    if (this.props.groupBy) {
      this.updateChartSeriesByGroupedData(data, excludes)
      return
    }

    const { granularity } = this.props

    const times = data && data.map(item => item.time)

    let seriesData: ISeries['data'] = []

    if (granularity === Granularity.FiveMinutes) {
      seriesData = data.map(({ time, values }) => [Date.parse(time), +flowToBandwidth(sumFlowOfTime(values))])
    }

    if (granularity != null && intervalsOf5Minutes[granularity]) {
      getRangesByInterval(times.length, intervalsOf5Minutes[granularity]).reduce((start, end) => {
        if (end) {
          const { flow = 0 } = getPeakFlow(data.slice(start, end))
          seriesData.push([Date.parse(data[start].time), +flowToBandwidth(flow)])
        }
        return end
      })
    }

    this.chartSeries = !data || data.length === 0
      ? []
      : [{ name: bucketAll, fillColor, data: seriesData }]
  }

  @action.bound
  updateChartSeriesByGroupedData(data: IFlowData<IFlowValue> | null, excludes: string[] = []) {
    const { granularity } = this.props
    const times = data && data.map(item => item.time)
    const groups = data && data.length ? Object.keys(data[0].values) : []

    // 空间 / 域名 的带宽数据因为不能整合只取最多 50 条数据显示，TODO: 增加提示
    const chartData = groups.slice(0, 50).map(group => {
      const seriesData: ISeries['data'] = []

      if (granularity === Granularity.FiveMinutes) {
        times!.forEach((time, idx) => {
          const flow: number = data![idx].values && isValidFlowValue(data![idx].values[group])
            ? data![idx].values[group].flow
            : 0
          this.updatePeakFlowOfGroup({ time, group, flow })
          seriesData.push([Date.parse(time), +flowToBandwidth(flow)])
        })
      }

      if (granularity != null && intervalsOf5Minutes[granularity]) {
        getRangesByInterval(times!.length, intervalsOf5Minutes[granularity]).reduce((start, end) => {
          if (end) {
            const { time, flow } = getPeakFlowOfGroup(data!.slice(start, end), group)
            this.updatePeakFlowOfGroup({ time, group, flow })
            seriesData.push([Date.parse(data![start].time), +flowToBandwidth(flow!)])
          }
          return end
        })
      }

      return { name: group, fillColor, data: seriesData }
    })

    // 用于单独增加 “合计” 数据列
    if (granularity != null && intervalsOf5Minutes[granularity] && chartData.length && times) {
      const aggregated = getTotalFlowOfTimeByFlowData(data!, excludes)
      const listOfDayInterval: Array<[number, number]> = []

      getRangesByInterval(times.length, intervalsOf5Minutes[granularity]).reduce(
        (start, end) => {
          if (end) {
            const flow = aggregated.slice(start, end).sort((a, b) => (a - b)).pop()
            listOfDayInterval.push([Date.parse(data![start].time), +flowToBandwidth(flow!)])
          }

          return end
        }
      )

      chartData.unshift({ name: totalOfSeriesName, fillColor, data: listOfDayInterval })
    }

    this.chartSeries = chartData
  }

  @action.bound
  handleLegendItemClick(e: any) {
    const { data, granularity } = this.props
    const { index: targetIndex, visible: targetVisible, chart: { series, yAxis } } = e.target

    const excludes = Array.isArray(series)
      ? series.reduce(
        (prev, { name, visible }, index) => {
          if (index === targetIndex) {
            if (targetVisible) {
              prev.push(name)
            }
          } else if (!visible) {
            prev.push(name)
          }
          return prev
        },
        []
      )
      : []

    if (granularity !== Granularity.FiveMinutes) {
      this.updateChartSeries(data, excludes)
    }

    this.numOf95Percentile = flowToBandwidth(getNumOf95thPercentileByFlowData(data, excludes))

    yAxis[0].removePlotLine('plot-line-1')
    yAxis[0].addPlotLine(this.plotLineOf95Percentile)
  }

  @action.bound
  refresh() {
    this.chartSeries = null
    this.peakFlowOfGroup = {}

    const { data } = this.props

    this.peakFlow = getPeakFlow(data)
    this.numOf95Percentile = flowToBandwidth(getNumOf95thPercentileByFlowData(data))
    this.updateChartSeries(data)
  }

  @computed
  get plotLineOf95Percentile() {
    return {
      color: 'red',
      dashStyle: 'ShortDash',
      value: this.numOf95Percentile,
      width: 2,
      id: 'plot-line-1',
      zIndex: 5,
      label: {
        text: '95 峰值（' + humanizeBandwidth(this.numOf95Percentile) + '）',
        style: {
          color: 'orange',
          fontWeight: 'bold'
        }
      }
    }
  }

  @computed
  get baseConfig(): Highcharts.Options {
    const { granularity, timeFormat } = this.props
    return granularity === Granularity.FiveMinutes
      ? getAreaSplineStackedChartBaseConfig(humanizeBandwidth, timeFormat)
      : getAreaSplineChartBaseConfig(humanizeBandwidth, timeFormat)
  }

  @computed
  get plotOptions() {
    return {
      series: {
        events: {
          legendItemClick: (e: any) => this.handleLegendItemClick(e)
        }
      }
    }
  }

  @computed
  get chartConfig(): Highcharts.Options {
    return merge(this.baseConfig, {
      yAxis: {
        allowDecimals: false,
        plotLines: [this.plotLineOf95Percentile]
      },
      exporting: {
        filename: '空间带宽-' + flowSrcTypeTextMap[this.props.flowType!]
      },
      series: this.chartSeries,
      plotOptions: this.plotOptions
    })
  }

  @computed
  get statisticView() {
    const peakBandwidth = {
      time: this.peakFlow.time && humanizeTimestamp(this.peakFlow.time, this.props.timeFormat),
      bandwidth: humanizeBandwidth(flowToBandwidth(this.peakFlow.flow!))
    }

    const { time, flow, group } = this.peakFlowOfGroup

    const peakBandwidthOfGroup = {
      time: time && humanizeTimestamp(time, this.props.timeFormat),
      group,
      bandwidth: humanizeBandwidth(flowToBandwidth(flow!))
    }

    const hideBucketPeakBandwidth = (
      this.props.flowType === FlowSrcType.ExternalInflow
      && this.props.bucket !== bucketAll
      || !this.props.groupBy
      || !peakBandwidthOfGroup.time
    )

    return (
      <div className={styles.tipInfo}>
        <div className={styles.left}>
          <Spin spinning={this.props.isLoadingData}>
            {peakBandwidth.time && (
              <>
                <span className={styles.calculateData}>{peakBandwidth.bandwidth}</span>
                <p className={styles.primary}>总带宽峰值，出现在 {peakBandwidth.time}</p>
              </>
            )}
            {!hideBucketPeakBandwidth && (
              <span className={styles.next}>
                {this.props.groupBy === KodoBillGroup.Bucket ? '空间' : '域名'}
                带宽峰值 {peakBandwidthOfGroup.bandwidth}
                ，出现在 {peakBandwidthOfGroup.group}，{peakBandwidthOfGroup.time}
              </span>
            )}
          </Spin>
        </div>
        <div className={styles.right}>
          {(this.props.queryLimitInfo || this.props.granularity === Granularity.OneDay) && (
            <p>
              注：
              {this.props.queryLimitInfo || '日带宽数据不支持堆叠展示'}
            </p>
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

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.data,
      () => this.refresh(),
      { fireImmediately: true }
    ))

    this.disposable.addDisposer(reaction(
      () => this.props.granularity,
      () => this.updateChartSeriesByGroupedData(null)
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
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
  BandwidthReport,
  [Granularity.FiveMinutes, Granularity.OneDay], // 带宽的统计报告暂仅支持 `五分钟` 和 `天` 两种粒度，不支持 `小时`
  Granularity.FiveMinutes
)
