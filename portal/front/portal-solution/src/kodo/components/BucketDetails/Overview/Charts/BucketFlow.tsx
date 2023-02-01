/**
 * @file component BucketFlow
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { action, observable, computed, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'
import Disposable from 'qn-fe-core/disposable'
import ReactChart from 'portal-base/common/components/ReactHighcharts'

import merge from 'kodo/utils/merge'

import { getAreaSplineChartBaseConfig } from 'kodo/transforms/chart'
import { granularityFormatMap } from 'kodo/transforms/date-time'
import { humanizeStorageSize } from 'kodo/transforms/unit'

import { Granularity } from 'kodo/constants/date-time'
import { ISeries, fillColor } from 'kodo/constants/chart'

import { IReportData, IFlowValue } from 'kodo/apis/statistics'

export interface IProps {
  isLoading: boolean
  data: IReportData<IFlowValue>
}

class BucketFlow extends React.Component<IProps> {
  @observable.ref flowData: ISeries[] = []
  disposable = new Disposable()

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @computed get config() {
    return merge(
      getAreaSplineChartBaseConfig(humanizeStorageSize, granularityFormatMap[Granularity.OneDay]),
      { series: this.flowData }
    )
  }

  @action.bound updateFlowData() {
    const { data } = this.props
    const flowList = data
      ? (
        data.filter(item => item.values && Number.isFinite(item.values.flow!))
          .map<[number, number]>(item => [moment(item.time).valueOf(), item.values.flow])
      )
      : []

    this.flowData = [{
      name: '流量',
      data: flowList,
      fillColor
    }]
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.data,
      () => this.updateFlowData()
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

export default observer(BucketFlow)
