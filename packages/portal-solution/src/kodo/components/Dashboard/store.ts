/**
 * @file store for Dashboard
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import moment from 'moment'
import { computed, action, observable, reaction, makeObservable } from 'mobx'

import autobind from 'autobind-decorator'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { getMomentRangeBaseDuration, getLatestDuration } from 'kodo/transforms/date-time'
import { isShared } from 'kodo/transforms/bucket/setting/authorization'

import { BucketListStore } from 'kodo/stores/bucket/list'
import { ConfigStore } from 'kodo/stores/config'
import { KodoIamStore } from 'kodo/stores/iam'

import { RangePickerValue } from 'kodo/polyfills/icecream/date-picker'

import { regionAll, RegionSymbolWithAll } from 'kodo/constants/region'
import { FlowSrcType, StorageType } from 'kodo/constants/statistics'
import { bucketAll } from 'kodo/constants/dashboard'
import { Granularity, granularityDateRangeLimitMap } from 'kodo/constants/date-time'

import { OverviewDateRangeType } from 'kodo/components/common/Tabs/OverviewDateRangeTab'

import { StatisticsApis, IIamStatisticsBucketInfo } from 'kodo/apis/statistics'
import { IBucketListItem } from 'kodo/apis/bucket/list'

export interface IQueryOptions {
  region: RegionSymbolWithAll
  bucket: string
  dateRange: RangePickerValue
  ftype: StorageType
}

@injectable()
export class StateStore extends Store {
  constructor(
    private bucketListStore: BucketListStore,
    private configStore: ConfigStore,
    private iamStore: KodoIamStore,
    private statisticsApis: StatisticsApis,
    toasterStore: Toaster
  ) {
    super()
    makeObservable(this)
    Toaster.bindTo(this, toasterStore)
  }

  @observable currentRegion: RegionSymbolWithAll
  @observable currentBucket: string
  @observable currentFlowType: FlowSrcType = FlowSrcType.ExternalOutflow
  @observable overviewPredefinedTime: OverviewDateRangeType | undefined = OverviewDateRangeType.SevenDays
  @observable ftype: StorageType = StorageType.Standard

  @observable currentGranularity: Granularity

  @observable.ref startTime: moment.Moment | undefined

  // 默认值最近七天
  @observable.ref dateRange: RangePickerValue = getLatestDuration(6, undefined, 'days')
  // iam 权限下统计分析允许的 buckets
  @observable.ref iamStatisticsBucketInfo: IIamStatisticsBucketInfo

  @autobind
  handlePredefinedTimeChange(value: OverviewDateRangeType) {
    switch (value) {
      case OverviewDateRangeType.SevenDays:
        this.chooseSevenDays()
        break
      case OverviewDateRangeType.FifteenDays:
        this.chooseFifteenDays()
        break
      case OverviewDateRangeType.CurrentMonth:
        this.chooseCurrentMonth()
        break
      case OverviewDateRangeType.LastMonth:
        this.chooseLastMonth()
        break
      default:
    }
  }

  @computed
  get queryOptions(): IQueryOptions {
    return {
      region: this.currentRegion,
      bucket: this.currentBucket,
      dateRange: this.dateRange,
      ftype: this.ftype
    }
  }

  /** 是允许查询全部空间？是主账号或者子账号拥有查询全部空间权限时为真 */
  @computed
  get isAllowAllBucket() {
    return !this.iamStatisticsBucketInfo || this.iamStatisticsBucketInfo.allowAll
  }

  @computed
  get bucketNames() {
    let bucketList: IBucketListItem[] = []

    if (this.currentRegion === regionAll.symbol) {
      bucketList = this.bucketListStore.list || []
    } else if (this.currentRegion) {
      bucketList = this.bucketListStore.listGroupByRegion.get(this.currentRegion) || []
    }

    // 后端支持查询指定的共享空间的数据，但是在用户统计数据的汇总中是不包含共享空间的
    return bucketList
      .filter(({ tbl, perm }) => (
        !isShared(perm) && (this.isAllowAllBucket || this.iamStatisticsBucketInfo.allowList.includes(tbl))
      ))
      .map(({ tbl }) => tbl)
  }

  @computed
  get regions() {
    const allRegionConfigs = this.configStore.getRegion({ allRegion: true })
    return this.isAllowAllBucket ? [regionAll, ...allRegionConfigs] : allRegionConfigs
  }

  @action.bound
  updateCurrentGranularity(granularity: Granularity) {
    this.currentGranularity = granularity

    const [start, end] = this.dateRange

    if (this.dateRange && this.dateRange.length === 2 && granularity) {
      const maxDate = start!.clone()
      maxDate.add(...granularityDateRangeLimitMap[granularity]).subtract(1, 'day').endOf('day')
      if (end! > maxDate) { this.updateDateRange([start!, maxDate]) }
    }
  }

  @action.bound
  updateStartTime(time?: moment.Moment) {
    this.startTime = time
  }

  @action.bound
  updateDateRange(
    dateRange: RangePickerValue,
    isOverviewPredefinedTimeChange?: boolean
  ) {
    if (!isOverviewPredefinedTimeChange) {
      this.overviewPredefinedTime = undefined
    }
    this.dateRange = dateRange
  }

  @action.bound
  updateCurrentRegion(region: RegionSymbolWithAll) {
    this.currentRegion = region
  }

  @action.bound
  updateFtype(value: StorageType) {
    this.ftype = value
  }

  @action.bound
  updateCurrentBucket(bucketName: string) {
    this.currentBucket = bucketName
  }

  @action.bound
  updateCurrentFlowType(value: FlowSrcType) {
    this.currentFlowType = value
  }

  @action.bound
  chooseSevenDays() {
    this.overviewPredefinedTime = OverviewDateRangeType.SevenDays
    this.updateDateRange(getLatestDuration(6, undefined, 'days'), true)
  }

  @action.bound
  chooseFifteenDays() {
    this.overviewPredefinedTime = OverviewDateRangeType.FifteenDays
    this.updateDateRange(getLatestDuration(14, undefined, 'days'), true)
  }

  @action.bound
  chooseCurrentMonth() {
    this.overviewPredefinedTime = OverviewDateRangeType.CurrentMonth
    this.updateDateRange(getMomentRangeBaseDuration('month'), true)
  }

  @action.bound
  chooseLastMonth() {
    this.overviewPredefinedTime = OverviewDateRangeType.LastMonth
    this.updateDateRange(getMomentRangeBaseDuration('month', moment().subtract(1, 'month')), true)
  }

  @action.bound
  updateIamStatisticsBucketInfo(data: IIamStatisticsBucketInfo) {
    this.iamStatisticsBucketInfo = data
    const region = data && !data.allowAll ? this.regions[0].symbol : regionAll.symbol
    this.updateCurrentRegion(region)
  }

  @action.bound
  isDisabledDate(date: moment.Moment) {
    if (!date) { return false }

    /* !this.startTime 说明没有选择范围的开始时间 或者 没有限制日期的选择范围 */
    if (!this.startTime) { return date > moment().endOf('day') }

    /* 处理有范围限制时，比较的日期大于选择的起始日期的情况 */
    if (date > this.startTime) {
      const maxDate = this.startTime.clone()
      maxDate.add(...granularityDateRangeLimitMap[this.currentGranularity]).subtract(1, 'day').endOf('day')
      return date > moment().endOf('day') || date > maxDate
    }

    /* 处理有范围限制时，比较的日期小于选择的起始日期的情况 */
    const minDate = this.startTime.clone()
    minDate.subtract(...granularityDateRangeLimitMap[this.currentGranularity]).add(1, 'day').startOf('day')
    return date < minDate
  }

  @action.bound
  handleCalendarChange(dates: RangePickerValue) {
    /* this.startTime 仅用于需要限制日期选择范围的场景，当没有限制日期选择范围时，也就不需要给它设置值 */
    if (dates.length === 1 && this.currentGranularity) {
      this.updateStartTime(dates[0])
    } else {
      this.updateStartTime()
    }
  }

  @autobind
  @Toaster.handle()
  fetchBucketList() {
    return this.bucketListStore.fetchList()
  }

  @autobind
  @Toaster.handle()
  async fetchIamStatisticBuckets() {
    const data = await this.statisticsApis.getIamStatisticsBucketInfo()
    this.updateIamStatisticsBucketInfo(data)
  }

  init() {
    this.addDisposer(reaction(
      () => ({
        region: this.currentRegion,
        buckets: this.bucketNames
      }),
      // 切换 region 的时候，Bucket 默认选全部，对于不具有查询所有空间权限的子账号，默认选第一个空间
      ({ buckets }) => { this.updateCurrentBucket(this.isAllowAllBucket ? bucketAll : buckets[0]) }
    ))

    this.addDisposer(reaction(
      () => this.iamStore.isIamUser,
      isIamUser => {
        if (isIamUser) {
          this.fetchIamStatisticBuckets()
        } else {
          this.updateCurrentRegion(regionAll.symbol)
        }
      },
      { fireImmediately: true }
    ))

    this.fetchBucketList()
  }
}
