/**
 * @file hoc for flow report
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { computed, action, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button } from 'react-icecream/lib'
import { InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import ReactChart from 'portal-base/common/components/ReactHighcharts'

import { getFormattedDateRangeValue, granularityFormatMap, isValidateDateRange } from 'kodo/transforms/date-time'

import { countTheGroupByFlowData } from 'kodo/transforms/statistics'

import { ConfigStore } from 'kodo/stores/config'

import {
  flowSrcValueMap, KodoBillGroup, FlowSrcType, SelectField, limitOfBucketNumber, limitOfDomainNumber
} from 'kodo/constants/statistics'
import { regionAll } from 'kodo/constants/region'
import { Granularity } from 'kodo/constants/date-time'
import { bucketAll } from 'kodo/constants/dashboard'

import FlowTypeTab from 'kodo/components/common/Tabs/FlowTypeTab'
import { Auth } from 'kodo/components/common/Auth'

import { StatisticsApis, IFlowData, IFlowValue, IFlowOptions } from 'kodo/apis/statistics'

import GranularityTab from '../GranularityTab'
import { IChildComponentProps } from '../index'
import styles from '../style.m.less'

const loadingId = 'flow'

interface IProps extends IChildComponentProps {
  inject: InjectFunc,
  flowType: FlowSrcType
  bucketNumber: number

  onFlowTypeChange(flowType: FlowSrcType): void

  onGranularityChanged(granularity: Granularity | null): void
}

export interface IComponentProps {
  bucket: string
  isLoadingData: boolean
  groupBy?: KodoBillGroup
  data: IFlowData<IFlowValue>
  timeFormat: string
  granularity?: Granularity
  flowType?: FlowSrcType
  queryLimitInfo?: string
  cname?: string
}

type IComponentInstance = { chart: React.RefObject<ReactChart> } & React.Component<IComponentProps>

function getFlowComponent(
  Component: React.ComponentClass<IComponentProps>,
  granularities: Granularity[] = [],
  granularity: Granularity = Granularity.OneDay
): React.ComponentClass<IProps> {

  class FlowLayout extends React.Component<IProps> {
    constructor(props: IProps) {
      super(props)

      makeObservable(this)

      const toaster = this.props.inject(Toaster)
      Toaster.bindTo(this, toaster)
    }

    configStore = this.props.inject(ConfigStore)

    statisticsApis = this.props.inject(StatisticsApis)

    disposable = new Disposable()

    instance: React.RefObject<IComponentInstance> = React.createRef()

    loadings = Loadings.collectFrom(this, loadingId)

    @observable granularity: Granularity = granularity

    @observable groupCounter: number | undefined // 用于记录查询到的数据中的空间/域名分组数量，决定数据展示时是汇总展示还是分组展示

    @observable.ref flowData: IFlowData<IFlowValue> = []

    @autobind exportCSV() {
      this.instance.current!.chart.current!.getChart().downloadCSV()
    }

    @computed get regionCname() {
      const regionConfig = this.configStore.getRegion({ region: this.props.queryOptions.region })
      if (regionConfig == null) return ''
      return regionConfig.objectStorage.domain.singleSourceHosts.flowOut
    }

    @computed get flowOptions(): IFlowOptions {
      const { region, bucket, dateRange } = this.props.queryOptions
      const [dateStart, dateEnd] = getFormattedDateRangeValue(dateRange)
      const $src = flowSrcValueMap[this.props.flowType]

      const options = {
        ...(region !== regionAll.symbol && { $region: region }),
        ...(bucket !== bucketAll && { $bucket: bucket }),
        select: SelectField.Flow,
        begin: dateStart,
        end: dateEnd,
        $ftype: this.props.queryOptions.ftype,
        /* 在查询带宽数据时，始终获取 5 分钟粒度的数据 */
        g: granularity === Granularity.FiveMinutes ? granularity : this.granularity,
        ...(this.group ? { group: this.group } : {})
      }

      if (this.props.flowType === FlowSrcType.SingleExternalOutflow) {
        return {
          ...options,
          // metric 参数在单线路外网流出请求时替换 $src
          $metric: flowSrcValueMap[FlowSrcType.SingleExternalOutflow]
        }
      }

      return {
        ...options,
        $src
      }
    }

    @computed get baseOptions() {
      return {
        ...this.props.queryOptions,
        flowType: this.props.flowType,
        granularity: this.granularity
      }
    }

    @computed
    get group() {
      const { bucketNumber } = this.props
      const { bucket } = this.props.queryOptions

      let group: KodoBillGroup | undefined

      // 外网流入流量不支持根据 Domain 进行 Group，只能不分组或者按空间分组查询
      if (bucket === bucketAll || this.props.flowType === FlowSrcType.ExternalInflow) {
        if (bucketNumber && bucketNumber <= limitOfBucketNumber) { group = KodoBillGroup.Bucket }
      } else {
        group = KodoBillGroup.Domain
      }

      return group
    }

    @computed
    get groupBy() {
      /* 按空间分组时，绘制图表按照查询时的分组进行绘制 */
      if (this.group === KodoBillGroup.Bucket) { return this.group }
      /* 按域名分组时，且域名数量没有超过限制时，绘制图表按照查询时的分组进行绘制 */
      if (this.groupCounter! < limitOfDomainNumber) { return this.group }
      /* 其他情况无返回值，则按照汇总数据进行绘制 */
    }

    @computed get timeFormat(): string {
      return granularityFormatMap[this.granularity]
    }

    @computed get queryLimitInfo() {
      const { flowType, queryOptions: { bucket } } = this.props

      if (flowType === FlowSrcType.ExternalInflow && bucket !== bucketAll) { return }

      if (!this.group) {
        return bucket === bucketAll
          ? '空间超过 ' + limitOfBucketNumber + ' 个时不支持堆叠展示'
          : undefined
      }

      if (!this.groupBy) {
        return '域名超过 ' + limitOfDomainNumber + ' 个时不支持堆叠展示'
      }
    }

    @action.bound updateFlowData(data: IFlowData<IFlowValue>) {
      this.groupCounter = countTheGroupByFlowData(data)
      this.flowData = data
    }

    @action.bound updateGranularity(value: Granularity) {
      this.granularity = value
      this.props.onGranularityChanged(value)
    }

    @Toaster.handle()
    @Loadings.handle(loadingId)
    fetchFlow() {
      // 外网流入接口和其他几个不同
      const api = this.props.flowType === FlowSrcType.ExternalInflow
        ? this.statisticsApis.getInflowData
        : this.statisticsApis.getOutflowData

      const req = api<IFlowValue>(this.flowOptions)
      req.then(flowData => this.updateFlowData(flowData))
        .catch(() => this.updateFlowData([]))
      return req
    }

    componentDidMount() {
      this.props.onGranularityChanged(this.granularity)
      this.disposable.addDisposer(reaction(
        () => this.baseOptions,
        ({ bucket, region, dateRange }) => (
          /* 避免请求重复调用：仅在依赖的数值完全初始化之后才发起请求 */
          bucket && region && isValidateDateRange(dateRange, this.granularity) && this.fetchFlow()
        ),
        { fireImmediately: true }
      ))
    }

    componentWillUnmount() {
      this.props.onGranularityChanged(null)
      this.disposable.dispose()
    }

    @computed get controlView() {
      return (
        <div className={styles.contentHeaderBox}>
          <div>
            <FlowTypeTab onChange={this.props.onFlowTypeChange} value={this.props.flowType} />
            <GranularityTab
              className={styles.tabLeftGap}
              onChange={this.updateGranularity}
              value={this.granularity}
              granularities={granularities}
            />
          </div>
          <div>
            <Auth
              notProtectedUser
              render={disabled => (
                <Button icon="cloud-download" disabled={disabled} onClick={this.exportCSV}>导出 CSV</Button>
              )}
            />
          </div>
        </div>
      )
    }

    render() {
      return (
        <div>
          {this.controlView}
          <Component
            ref={this.instance}
            isLoadingData={this.loadings.isLoading(loadingId)}
            groupBy={this.groupBy}
            bucket={this.props.queryOptions.bucket}
            data={this.flowData}
            timeFormat={this.timeFormat}
            granularity={this.granularity}
            flowType={this.props.flowType}
            queryLimitInfo={this.queryLimitInfo}
            cname={this.regionCname}
          />
        </div>
      )
    }
  }

  return observer(FlowLayout)
}

export default getFlowComponent
