/**
 * @file component Overview
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import { InjectFunc, Inject } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { ChartPieOptions, LegendPieObjectOptions, LegendPointDataObject, PieChart } from 'react-icecream-charts'

import { ConfigStore } from 'kodo/stores/config'
import { BucketListStore } from 'kodo/stores/bucket/list'

import { StorageType } from 'kodo/constants/statistics'

import OverviewStatistics from 'kodo/components/common/OverviewStatistics'
import { Description } from 'kodo/components/common/Description'
import FtypeTab from 'kodo/components/common/Tabs/FtypeTab'
import Prompt from 'kodo/components/common/Prompt'

import StorageTrend from './StorageTrend'
import BucketStorageTop3 from './BucketStorageTop3'

import styles from './style.m.less'

const loadingId = 'chart'

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalOverview extends React.Component<DiDeps> {
  constructor(props: DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  configStore = this.props.inject(ConfigStore)
  bucketListStore = this.props.inject(BucketListStore)

  @observable ftype: StorageType = StorageType.Standard
  @observable unLoadedBucketList = true // 用来标记 Bucket 数据还没开始加载的状态 [页面刷新后 - 数据加载前]，仅使用一次

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, loadingId)

  @action.bound
  updateFtype(value: StorageType) {
    this.ftype = value
  }

  @action.bound
  updateUnLoadedBucketList(value: boolean) {
    this.unLoadedBucketList = value
  }

  @computed
  get globalConfig() {
    return this.configStore.getFull()
  }

  @computed
  get bucketCounts() {
    return this.bucketListStore.nameList.length
  }

  @Toaster.handle()
  @Loadings.handle(loadingId)
  fetchBucketList() {
    return this.bucketListStore.fetchList().then(() => { this.updateUnLoadedBucketList(false) })
  }

  componentDidMount() {
    this.fetchBucketList()
  }

  @computed
  get descriptionView() {
    if (!this.globalConfig.objectStorage.overview.description) {
      return null
    }

    return (
      <Prompt type="assist">
        <Description dangerouslyText={
          this.globalConfig.objectStorage.overview.description
        } />
      </Prompt>
    )
  }

  @computed
  get pieChartOptions() {
    const chartOptions: ChartPieOptions = {
      height: 200
    }
    const legend: LegendPieObjectOptions = {
      x: -100,
      columns: 2,
      labelFormatter(data: LegendPointDataObject) {
        return `<span style="color: #B2B2B2">${data.name}</span>`
        + `<span> ${data.value}</span>`
      }
    }
    const options = {
      // 外直径
      size: 142,
      // 内直径
      innerSize: 92,
      innerTitle: '',
      // 关闭数据标识箭头
      dataLabels: false
    }

    const data = [...this.bucketListStore.listGroupByRegion]
      .filter(([_, list]) => list.length)
      .map(([region, bucketList]) => {
        const regionConfig = this.configStore.getRegion({ region })
        return {
          name: regionConfig.name,
          y: bucketList.length
        }
      })

    chartOptions.legend = legend
    // 判断是否处于还没开始加载和加载中两个状态
    // 这两个状态不能添加数据和 innerTitle
    // 否则会提前渲染出饼图轮廓和标题
    if (this.unLoadedBucketList || this.loadings.isLoading(loadingId)) {
      return {
        chartOptions,
        options,
        series: []
      }
    }
    options.innerTitle = `<span style="font-size: 18px; font-weight: 400;">${this.bucketCounts}<span>`
    // 不大于 6 个，图例只显示 1 列
    // 同时修改图例和饼图的间距
    if (data.length <= 6) {
      legend.columns = 1
      legend.x = -100
    }

    if (data.some(({ name }) => name.length > 10)) {
      legend.x! += 30
    }

    return {
      chartOptions,
      options,
      series: [{ name: '空间数量', data }]
    }
  }

  @computed
  get bucketsChartView() {
    return (
      <div className={styles.bucketsChart}>
        <div className={styles.bucketDistribution}>
          <div className={styles.title}>空间分布</div>
          <PieChart
            {...this.pieChartOptions}
            loading={this.loadings.isLoading(loadingId)}
          />
        </div>
        <div className={styles.divider} />
        <BucketStorageTop3 />
      </div>
    )
  }

  // @computed
  // get publicTopAdView() {
  //   return (
  //     <>
  //       <Alert
  //         closable
  //         showIcon
  //         type="info"
  //         className={styles.topAd}
  //         icon={<Icon type="sound" />}
  //         message={(
  //           <Link
  //             rel="noopener"
  //             target="_blank"
  //             to="https://marketing.qiniu.com/activity/kodopackage?ref=https://qiniu.com/kodo/overview"
  //           >
  //             资源包折扣套餐，上新特惠，火热销售中!
  //           </Link>
  //         )}
  //       />
  //     </>
  //   )
  // }

  render() {

    return (
      <div className={styles.overview}>
        {this.descriptionView}
        {/* 公有云专用广告位，需要启用时修改 publicTopAdView */}
        {/* {isPublic && this.publicTopAdView} */}
        {this.bucketsChartView}
        <div className={styles.storageCard}>
          <FtypeTab onChange={this.updateFtype} value={this.ftype} />
          <OverviewStatistics ftype={this.ftype} />
          <StorageTrend ftype={this.ftype} />
        </div>
      </div>
    )
  }
}

export default function Overview(props: {}) {
  return (
    <Inject render={({ inject }) => (
      <InternalOverview {...props} inject={inject} />
    )} />
  )
}
