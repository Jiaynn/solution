/**
 * @file base component for bucket-flow
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { action, computed, observable, reaction, makeObservable } from 'mobx'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import { getFormattedDateRangeValue, getLatestDuration } from 'kodo/transforms/date-time'

import { RegionSymbol } from 'kodo/constants/region'
import { Granularity } from 'kodo/constants/date-time'
import { FlowSrcType, flowSrcValueMap, SelectField } from 'kodo/constants/statistics'

import FlowTypeTab from 'kodo/components/common/Tabs/FlowTypeTab'

import Prompt from 'kodo/components/common/Prompt'

import { StatisticsApis, IFlowValue, IReportData } from 'kodo/apis/statistics'

import { IProps as CommonProps } from '.'
import styles from './style.m.less'

export interface IProps extends CommonProps {
  title: string

  render(data: IReportData<IFlowValue>, isLoading: boolean): React.ReactElement

  granularity: Granularity
}

interface DiDeps {
  inject: InjectFunc
}

const loadingId = 'flow'

@observer
class InternalBaseFlow extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  @observable flowType: FlowSrcType = FlowSrcType.ExternalOutflow
  @observable.ref flowData: IReportData<IFlowValue> = []

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, loadingId)

  @computed
  get isLoading() {
    return this.loadings.isLoading(loadingId)
  }

  @action.bound
  updateFlowData(data: IReportData<IFlowValue>) {
    this.flowData = data
  }

  @action.bound updateFlowType(value: FlowSrcType) {
    this.flowType = value
  }

  @Toaster.handle()
  @Loadings.handle(loadingId)
  fetchFlowData() {
    const statisticsApis = this.props.inject(StatisticsApis)
    const [begin, end] = getFormattedDateRangeValue(getLatestDuration(6, undefined, 'days'))

    const options = {
      $bucket: this.props.bucketName,
      $region: this.props.region as RegionSymbol,
      $src: flowSrcValueMap[this.flowType],
      $ftype: this.props.ftype,
      select: SelectField.Flow,
      g: this.props.granularity,
      begin,
      end
    }

    // 外网流入接口和其他几个不同
    const getData = this.flowType === FlowSrcType.ExternalInflow
      ? statisticsApis.getInflowData
      : statisticsApis.getOutflowData

    const req = getData<IFlowValue>(options)
    req.then(this.updateFlowData).catch(() => { /**/ })
    return req
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => ({
        ftype: this.props.ftype,
        region: this.props.region,
        flowType: this.flowType
      }),
      () => {
        if (this.props.region) {
          this.fetchFlowData()
        }
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    return (
      <div className={styles.chart}>
        <div className={styles.header}>
          <div className={styles.title}>
            <span className={styles.chartTitle}>{this.props.title}</span>
          </div>
          <div>
            <FlowTypeTab onChange={this.updateFlowType} value={this.flowType} />
          </div>
        </div>
        <div style={{ height: '20px' }}>
          {this.flowType === FlowSrcType.ExternalInflow && (
            <Prompt type="normal" style={{ textAlign: 'right' }}>注：外网流入不区分存储类型</Prompt>
          )}
        </div>
        {this.props.render(this.flowData, this.isLoading)}
      </div>
    )
  }
}

export default function BaseFlow(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalBaseFlow {...props} inject={inject} />
    )} />
  )
}
