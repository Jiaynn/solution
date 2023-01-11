/**
 * @file component BucketBandwidth
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { action, observable, computed, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import Disposable from 'qn-fe-core/disposable'
import ReactChart from 'portal-base/common/components/ReactHighcharts'

import merge from 'kodo/utils/merge'

import { getAreaSplineChartBaseConfig } from 'kodo/transforms/chart'
import { getPeakFlow, getRangesByInterval, flowToBandwidth } from 'kodo/transforms/statistics'
import { humanizeBigNumber } from 'kodo/transforms/unit'
import { granularityFormatMap } from 'kodo/transforms/date-time'

import { Granularity, intervalsOf5Minutes } from 'kodo/constants/date-time'
import { ISeries, fillColor } from 'kodo/constants/chart'

import { IReportData, IFlowValue } from 'kodo/apis/statistics'

export interface IProps {
  isLoading: boolean
  data: IReportData<IFlowValue>
}

class BucketBandwidth extends React.Component<IProps> {
  @observable.ref bandwidthData: ISeries[] = []
  disposable = new Disposable()

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @computed get config() {
    return merge(
      getAreaSplineChartBaseConfig(
        value => humanizeBigNumber(value, { unit: 'bps', isBinary: false, sep: ' ' }),
        granularityFormatMap[Granularity.OneDay]
      ),
      { series: this.bandwidthData }
    )
  }

  @action.bound updateBandwidthData() {
    const { data } = this.props
    const times = data && data.map(item => item.time)

    const seriesData: ISeries['data'] = []

    getRangesByInterval(times.length, intervalsOf5Minutes[Granularity.OneDay]).reduce((start, end) => {
      if (end) {
        const { flow } = getPeakFlow(data.slice(start, end))
        seriesData.push([Date.parse(data[start].time), +flowToBandwidth(flow!)])
      }

      return end
    })

    this.bandwidthData = [{ name: '带宽', fillColor, data: seriesData }]
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.data,
      () => this.updateBandwidthData()
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    return (
      <div>
        <ReactChart config={this.config} isLoading={this.props.isLoading} />
      </div>
    )
  }
}

export default observer(BucketBandwidth)
