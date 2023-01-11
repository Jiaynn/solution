/**
 * @file component OverviewStatistics 概览里的统计信息
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import moment from 'moment'
import * as React from 'react'
import { reaction, observable, computed, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import { valuesOfEnum } from 'kodo/utils/ts'

import { getMomentRangeBaseDuration, getFormattedDateRangeValue } from 'kodo/transforms/date-time'
import { humanizeStorageSize } from 'kodo/transforms/unit'
import { Humanizer } from 'kodo/transforms/chart'
import { hasPreDelQueryOption } from 'kodo/transforms/statistics'

import { ConfigStore } from 'kodo/stores/config'

import { StorageType, SelectField, flowSrcValueMap } from 'kodo/constants/statistics'
import { Granularity } from 'kodo/constants/date-time'
import { RegionSymbol } from 'kodo/constants/region'

import {
  StatisticsApis,
  IStorageValue, IReportData,
  IAPIValue, IFlowValue, IStatdBaseData
} from 'kodo/apis/statistics'

import StatisticsCard from './Statistics'

import styles from './style.m.less'

export interface IProps {
  ftype: StorageType
  bucketName?: string
  region?: RegionSymbol
}

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  Storage = 'storage',
  FileCount = 'fileCount',
  APICount = 'apiCount',
  ExternalOutflow = 'externalOutflow',
  ExternalInflow = 'externalInflow',
  CDNFlow = 'cdnFlow'
}

export enum Arrow {
  Down = 'arrow-down',
  Up = 'arrow-up'
}

@observer
class InternalOverviewStatistics extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  configStore = this.props.inject(ConfigStore)
  statisticsApis = this.props.inject(StatisticsApis)

  // 今日存储量与昨日存储量
  @observable todayStorage: number | null
  @observable yesterdayStorage: number | null
  // 今日文件数与昨日文件数
  @observable todayFileCount: number | null
  @observable yesterdayFileCount: number | null
  // 本月外部流出流量与上月外部流出流量
  @observable currentMonthExternalOutflow: number
  @observable lastMonthExternalOutflow: number
  // 本月外部流入流量与上月外部流入流量
  @observable currentMonthExternalInflow: number
  @observable lastMonthExternalInflow: number
  // 本月 cdn 流量与上月 cdn 流量
  @observable currentMonthCDNFlow: number
  @observable lastMonthCDNFlow: number
  // 本月 API 请求数与上月 API 请求数
  @observable currentMonthAPIGetCount: number
  @observable lastMonthAPIGetCount: number
  @observable currentMonthAPIPutCount: number
  @observable lastMonthAPIPutCount: number

  currentMonth = getMomentRangeBaseDuration('month') // 本月
  lastMonth = getMomentRangeBaseDuration('month', moment().subtract(1, 'month')) // 上月

  today = getMomentRangeBaseDuration('day')
  yesterday = getMomentRangeBaseDuration('day', moment().subtract(1, 'day')) // 昨天

  disposable = new Disposable()

  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  formattedDate(date: [moment.Moment, moment.Moment]) {
    const [begin, end] = getFormattedDateRangeValue(date)
    return { begin, end }
  }

  humanizeData(value: number | null, humanize?: Humanizer) {
    if (value == null) {
      return '--'
    }

    return humanize ? humanize(value) : value
  }

  getFlowValue(value: IFlowValue) {
    return value && Number.isFinite(value.flow) ? value.flow : 0
  }

  getAPIValue(value: IAPIValue) {
    return value && Number.isFinite(value.hits) ? value.hits : 0
  }

  getStorageValue(value: IStorageValue, type: SelectField) {
    return value && Number.isFinite(value[type]) ? value[type] : 0
  }

  @computed
  get fileCountType() {
    return this.props.ftype === StorageType.Standard
      ? SelectField.CountSet
      : SelectField.CountLineSet
  }

  @computed
  get commonOptions() {
    const { bucketName, region, ftype } = this.props
    return {
      $ftype: ftype,
      g: Granularity.OneDay,
      ...(bucketName && { $bucket: bucketName }),
      ...(region && { $region: region })
    }
  }

  @computed
  get baseFlowOptions() {
    return {
      ...this.commonOptions,
      select: SelectField.Flow
    }
  }

  @computed
  get storageIcon(): string | undefined {
    if (!Number.isFinite(this.todayStorage!) || !Number.isFinite(this.yesterdayStorage!)) {
      return undefined
    }

    if (this.todayStorage! - this.yesterdayStorage! > 0) {
      return Arrow.Up
    }

    return (this.todayStorage! - this.yesterdayStorage! < 0) ? Arrow.Down : undefined
  }

  @computed
  get fileCountIcon(): string | undefined {
    if (!Number.isFinite(this.todayFileCount!) || !Number.isFinite(this.yesterdayFileCount!)) {
      return undefined
    }

    if (this.todayFileCount! - this.yesterdayFileCount! > 0) {
      return Arrow.Up
    }

    return (this.todayFileCount! - this.yesterdayFileCount! < 0) ? Arrow.Down : undefined
  }

  @action.bound
  updateStorage(current: IStatdBaseData, last: IStatdBaseData) {

    this.todayStorage = current && current.datas
      ? current.datas[current.datas.length - 1]
      : null

    this.yesterdayStorage = last && last.datas
      ? last.datas[last.datas.length - 1]
      : null
  }

  @action.bound
  updateFileCount(current: IStatdBaseData, last: IStatdBaseData) {
    this.todayFileCount = current && current.datas
      ? current.datas[current.datas.length - 1]
      : null

    this.yesterdayFileCount = last && last.datas
      ? last.datas[last.datas.length - 1]
      : null
  }

  @action.bound
  updateAPICount(data: Array<IReportData<IAPIValue>>) {
    const [currentGet, lastGet, currentPut, lastPut] = data

    this.currentMonthAPIGetCount = currentGet && currentGet.reduce((result, item) => {
      result += this.getAPIValue(item.values)
      return result
    }, 0)

    this.currentMonthAPIPutCount = currentGet && currentPut.reduce((result, item) => {
      result += this.getAPIValue(item.values)
      return result
    }, 0)

    this.lastMonthAPIGetCount = lastGet && lastGet.reduce((result, item) => {
      result += this.getAPIValue(item.values)
      return result
    }, 0)

    this.lastMonthAPIPutCount = lastPut && lastPut.reduce((result, item) => {
      result += this.getAPIValue(item.values)
      return result
    }, 0)
  }

  @action.bound
  updateExternalOutflowData(data: Array<IReportData<IFlowValue>>) {
    const [currentFlow, lastFlow] = data
    this.currentMonthExternalOutflow = currentFlow && currentFlow.reduce((result, item) => {
      result += this.getFlowValue(item.values)
      return result
    }, 0)

    this.lastMonthExternalOutflow = lastFlow && lastFlow.reduce((result, item) => {
      result += this.getFlowValue(item.values)
      return result
    }, 0)
  }

  @action.bound
  updateExternalInflowData(data: Array<IReportData<IFlowValue>>) {
    const [currentFlow, lastFlow] = data
    this.currentMonthExternalInflow = currentFlow && currentFlow.reduce((result, item) => {
      result += this.getFlowValue(item.values)
      return result
    }, 0)

    this.lastMonthExternalInflow = lastFlow && lastFlow.reduce((result, item) => {
      result += this.getFlowValue(item.values)
      return result
    }, 0)
  }

  @action.bound
  updateCDNFlowData(data: Array<IReportData<IFlowValue>>) {
    const [currentFlow, lastFlow] = data
    this.currentMonthCDNFlow = currentFlow && currentFlow.reduce((result, item) => {
      result += this.getFlowValue(item.values)
      return result
    }, 0)

    this.lastMonthCDNFlow = lastFlow && lastFlow.reduce((result, item) => {
      result += this.getFlowValue(item.values)
      return result
    }, 0)
  }

  @Toaster.handle()
  @Loadings.handle(Loading.Storage)
  fetchSpace() {
    const { bucketName, region, ftype } = this.props

    const fetchStorageData = this.statisticsApis.getStorageTypeStorageDataFetchMethod(ftype)

    if (!fetchStorageData) { return Promise.reject('存储量拉取失败') }

    const basicOptions = {
      ...(bucketName && { bucket: bucketName }),
      ...(region && { region }),
      g: Granularity.OneDay,
      ...(hasPreDelQueryOption(ftype) ? { no_predel: 1 } as const : {})
    }

    return Promise.all([
      fetchStorageData({
        ...basicOptions,
        ...this.formattedDate(this.today)
      }),
      fetchStorageData({
        ...basicOptions,
        ...this.formattedDate(this.yesterday)
      })
    ])
  }

  @Toaster.handle()
  @Loadings.handle(Loading.FileCount)
  fetchFileCount() {
    const { bucketName, region, ftype } = this.props

    const fetchStorageData = this.statisticsApis.getStorageTypeCountDataFetchMethod(ftype)

    if (!fetchStorageData) { return Promise.reject('错误的存储类型') }

    const basicOptions = {
      ...(bucketName && { bucket: bucketName }),
      ...(region && { region }),
      g: Granularity.OneDay
    }

    return Promise.all([
      fetchStorageData({
        ...basicOptions,
        ...this.formattedDate(this.today)
      }),
      fetchStorageData({
        ...basicOptions,
        ...this.formattedDate(this.yesterday)
      })
    ])
  }

  @Toaster.handle()
  @Loadings.handle(Loading.APICount)
  fetchAPIRequestCount() {
    const basicOptions = {
      ...this.commonOptions,
      select: SelectField.Hits
    }
    const getOptions = {
      ...basicOptions,
      $src: flowSrcValueMap.api
    }
    const req = Promise.all([
      this.statisticsApis.getOutflowData<IAPIValue>({
        ...getOptions,
        ...this.formattedDate(this.currentMonth)
      }),
      this.statisticsApis.getOutflowData<IAPIValue>({
        ...getOptions,
        ...this.formattedDate(this.lastMonth)
      }),
      this.statisticsApis.getAPIPutData<IAPIValue>({
        ...basicOptions,
        ...this.formattedDate(this.currentMonth)
      }),
      this.statisticsApis.getAPIPutData<IAPIValue>({
        ...basicOptions,
        ...this.formattedDate(this.lastMonth)
      })
    ])
    req.then(this.updateAPICount).catch(() => { /**/ })
    return req
  }

  @Toaster.handle()
  @Loadings.handle(Loading.ExternalOutflow)
  fetchBucketExternalOutflow() {
    const req = Promise.all([
      this.statisticsApis.getOutflowData<IFlowValue>({
        ...this.baseFlowOptions,
        ...this.formattedDate(this.currentMonth),
        $src: flowSrcValueMap.externalOutflow
      }),
      this.statisticsApis.getOutflowData<IFlowValue>({
        ...this.baseFlowOptions,
        ...this.formattedDate(this.lastMonth),
        $src: flowSrcValueMap.externalOutflow
      })
    ])

    req.then(this.updateExternalOutflowData).catch(() => { /**/ })
    return req
  }

  @Toaster.handle()
  @Loadings.handle(Loading.ExternalInflow)
  fetchBucketExternalInflow() {
    const req = Promise.all([
      this.statisticsApis.getInflowData<IFlowValue>({
        ...this.baseFlowOptions,
        ...this.formattedDate(this.currentMonth),
        $src: flowSrcValueMap.externalInflow
      }),
      this.statisticsApis.getInflowData<IFlowValue>({
        ...this.baseFlowOptions,
        ...this.formattedDate(this.lastMonth),
        $src: flowSrcValueMap.externalInflow
      })
    ])

    req.then(this.updateExternalInflowData).catch(() => { /**/ })
    return req
  }

  @Toaster.handle()
  @Loadings.handle(Loading.CDNFlow)
  fetchBucketCDNFlow() {
    const req = Promise.all([
      this.statisticsApis.getOutflowData<IFlowValue>({
        ...this.baseFlowOptions,
        ...this.formattedDate(this.currentMonth),
        $src: flowSrcValueMap.cdn
      }),
      this.statisticsApis.getOutflowData<IFlowValue>({
        ...this.baseFlowOptions,
        ...this.formattedDate(this.lastMonth),
        $src: flowSrcValueMap.cdn
      })
    ])

    req.then(this.updateCDNFlowData).catch(() => { /**/ })
    return req
  }

  refresh() {
    this.fetchSpace().then(([currentData, lastData]) => {
      this.updateStorage(currentData, lastData)
    })
    this.fetchFileCount().then(([currentData, lastData]) => {
      this.updateFileCount(currentData, lastData)
    })
    this.fetchAPIRequestCount()
    this.fetchBucketExternalOutflow()
    this.fetchBucketExternalInflow()
    this.fetchBucketCDNFlow()
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.ftype,
      () => this.refresh(),
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    const isCdnDomainEnable = this.configStore.getFull().fusion.domain.enable
    return (
      <div className={styles.statisticsBox}>
        <StatisticsCard
          isLoading={this.loadings.isLoading(Loading.Storage)}
          currentText="今日存储量"
          lastText="昨日存储量"
          currentData={
            Number.isFinite(this.todayStorage!)
              ? this.humanizeData(this.todayStorage, humanizeStorageSize)
              : '--'
          }
          lastData={
            Number.isFinite(this.yesterdayStorage!)
              ? this.humanizeData(this.yesterdayStorage, humanizeStorageSize)
              : '--'
          }
          icon={this.storageIcon}
        />
        <StatisticsCard
          isLoading={this.loadings.isLoading(Loading.FileCount)}
          currentText="今日文件数"
          lastText="昨日文件数"
          currentData={this.humanizeData(this.todayFileCount)}
          lastData={this.humanizeData(this.yesterdayFileCount)}
          icon={this.fileCountIcon}
        />
        <StatisticsCard
          isLoading={this.loadings.isLoading(Loading.APICount)}
          currentText="本月 API 请求次数（GET/PUT）"
          lastText="上月 API 请求次数（GET/PUT）"
          currentData={
            Number.isFinite(this.currentMonthAPIGetCount!) && Number.isFinite(this.currentMonthAPIPutCount!)
              ? this.currentMonthAPIGetCount + '/' + this.currentMonthAPIPutCount
              : '--'
          }
          lastData={
            Number.isFinite(this.lastMonthAPIGetCount!) && Number.isFinite(this.lastMonthAPIPutCount!)
              ? this.lastMonthAPIGetCount + '/' + this.lastMonthAPIPutCount
              : '--'
          }
        />
        <StatisticsCard
          isLoading={this.loadings.isLoading(Loading.ExternalOutflow)}
          currentText="本月空间外网流出流量"
          lastText="上月空间外网流出流量"
          currentData={
            Number.isFinite(this.currentMonthExternalOutflow!)
              ? this.humanizeData(this.currentMonthExternalOutflow, humanizeStorageSize)
              : '--'
          }
          lastData={this.humanizeData(this.lastMonthExternalOutflow, humanizeStorageSize)}
        />
        <StatisticsCard
          isLoading={this.loadings.isLoading(Loading.ExternalInflow)}
          currentText="本月空间外网流入流量"
          lastText="上月空间外网流入流量"
          currentData={
            Number.isFinite(this.currentMonthExternalInflow!)
              ? this.humanizeData(this.currentMonthExternalInflow, humanizeStorageSize)
              : '--'
          }
          lastData={this.humanizeData(this.lastMonthExternalInflow, humanizeStorageSize)}
        />
        {isCdnDomainEnable && (
          <StatisticsCard
            isLoading={this.loadings.isLoading(Loading.ExternalOutflow)}
            currentText="本月空间 CDN 回源流量"
            lastText="上月空间 CDN 回源流量"
            currentData={
              Number.isFinite(this.currentMonthCDNFlow!)
                ? this.humanizeData(this.currentMonthCDNFlow, humanizeStorageSize)
                : '--'
            }
            lastData={
              Number.isFinite(this.lastMonthCDNFlow!)
                ? this.humanizeData(this.lastMonthCDNFlow, humanizeStorageSize)
                : '--'
            }
          />
        )}
      </div>
    )
  }
}

export default function OverviewStatistics(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalOverviewStatistics {...props} inject={inject} />
    )} />
  )
}
