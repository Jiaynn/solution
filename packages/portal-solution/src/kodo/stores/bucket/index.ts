/**
 * @file bucket store
 * @author yinxulai <me@yinxulai.cn>
 */

import { injectable } from 'qn-fe-core/di'

import { action, observable, makeObservable, runInAction } from 'mobx'
import Store from 'qn-fe-core/store'
import autobind from 'autobind-decorator'
import { Loadings } from 'portal-base/common/loading'

import { valuesOfEnum } from 'kodo/utils/ts'

import { isShared } from 'kodo/transforms/bucket/setting/authorization'

import { isBlockChainPBucket } from 'kodo/transforms/bucket'

import { getFormattedDateRangeValue, getMomentRangeBaseDuration } from 'kodo/transforms/date-time'

import { StorageType } from 'kodo/constants/statistics'
import { Granularity } from 'kodo/constants/date-time'
import { RegionSymbol } from 'kodo/constants/region'

import { ImageStyleApis, MediaStyle } from 'kodo/apis/bucket/image-style'
import { BucketApis, IBucket, ICreateBucketOptions } from 'kodo/apis/bucket'
import { IStatdBaseOptionsWithRegion, StatisticsApis } from 'kodo/apis/statistics'

import { BucketListStore } from './list'

export enum Loading {
  Details = 'details',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  MediaStyle = 'mediaStyle',
  LineStorage = 'lineStorage',
  StandardStorage = 'standardStorage',
  ArchiveStorage = 'archiveStorage',
  DeepArchiveStorage = 'deepArchiveStorage'
}

export type StorageStatistics = {
  [key in StorageType]?: {
    /* 空间中对应存储类型的文件数量 */
    fileCount: number

    /* 空间中对应存储类型的文件占用的存储容量大小 */
    storageSize: number
  }
}

export interface IStorageFetchOptions extends Partial<IStatdBaseOptionsWithRegion> {
  bucket: string
  region: RegionSymbol
}

@injectable()
export class BucketStore extends Store {
  constructor(
    private bucketApis: BucketApis,
    private statisticsApis: StatisticsApis,
    private imageStyleApis: ImageStyleApis,
    private bucketListStore: BucketListStore
  ) {
    super()
    makeObservable(this)
  }

  // loadings
  private loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  // bucket 详细信息
  private detailsMap = observable.map<string, IBucket>({}, { deep: false })

  // bucket 与 存储统计信息 表
  private bucketStorageStatisticsMap = observable.map<string, StorageStatistics>()

  // bucket 的多媒体样式信息
  private mediaStyleMap = observable.map<string, MediaStyle[]>()

  private promiseMap = new Map<string, Promise<any>>()

  // isLoading
  @autobind
  isLoading(key?: Loading) {
    return key ? this.loadings.isLoading(key) : !this.loadings.isAllFinished()
  }

  @autobind
  getDetailsByName(name: string) {
    return this.detailsMap.get(name)
  }

  @autobind
  getStorageInfoByName(name: string) {
    return this.bucketStorageStatisticsMap.get(name)
  }

  @autobind
  getMediaStyleListByName(name: string) {
    return this.mediaStyleMap.get(name)
  }

  @action.bound
  private updateDetailsMap(name: string, data: IBucket) {
    this.detailsMap.set(name, data)
  }

  @action.bound
  private updateStorageMap(name: string, data: StorageStatistics) {
    const prevData = this.bucketStorageStatisticsMap.get(name)!
    this.bucketStorageStatisticsMap.set(name, { ...prevData, ...data })
  }

  @autobind
  async ensureDetailsLoaded(name: string) {
    if (this.getDetailsByName(name) == null) {
      await this.fetchDetailsByName(name)
    }
  }

  /**
   * 获取 Bucket 详情信息
   *
   * TODO: 并发控制待优化，避免同时发起多次请求
   *
   * 这里本来只需要 `getBucketDetailsByName` 方法来获取空间的详细信息，
   * 但是由于业务上依赖 systags 字段，而原方法对应对接口无法提供该字段，
   * 所以增加了 `getBucketDetailsWithSysTagByName` 来获取 systags 字段对空间详细信息进行补充。
   *
   * @param name 空间名称
   */
  @autobind
  @Loadings.handle(Loading.Details)
  async fetchDetailsByName(name: string): Promise<IBucket> {
    const key = 'fetchByName-' + name

    let req = this.promiseMap.get(key)

    if (!req) {
      req = Promise.all([
        this.bucketApis.getBucketDetailsByName(name),
        this.bucketApis.getBucketDetailsWithSysTagByName(name)
      ])
      this.promiseMap.set(key, req)
    }

    try {
      const [bucketDetails, bucketDetailsWithSysTag] = await req
      bucketDetails.systags = bucketDetailsWithSysTag.systags // 添加 systags 字段到空间详细信息中
      this.updateDetailsMap(name, bucketDetails)
      return bucketDetails
    } finally {
      this.promiseMap.delete(key)
    }
  }

  // 获取低频存储信息
  @autobind
  @Loadings.handle(Loading.LineStorage)
  async fetchLineStorageInfo(options: IStorageFetchOptions) {
    const [begin, end] = getFormattedDateRangeValue(getMomentRangeBaseDuration())
    const fullOptions: IStatdBaseOptionsWithRegion = { g: Granularity.OneDay, begin, end, no_predel: 1, ...options }

    const [lineCount, lineStorage] = await Promise.all([
      this.statisticsApis.getLineCountData(fullOptions),
      this.statisticsApis.getLineStorageData(fullOptions)
    ])

    this.updateStorageMap(fullOptions.bucket!, {
      [StorageType.LowFrequency]: { fileCount: lineCount.datas[0], storageSize: lineStorage.datas[0] }
    })
  }

  // 获取标准存储信息
  @autobind
  @Loadings.handle(Loading.StandardStorage)
  async fetchStandardStorageInfo(options: IStorageFetchOptions) {
    const [begin, end] = getFormattedDateRangeValue(getMomentRangeBaseDuration())
    const fullOptions: IStatdBaseOptionsWithRegion = { g: Granularity.OneDay, begin, end, ...options }

    const [standardCount, standardStorage] = await Promise.all([
      this.statisticsApis.getStandardCountData(fullOptions),
      this.statisticsApis.getStandardStorageData(fullOptions)
    ])

    this.updateStorageMap(fullOptions.bucket!, {
      [StorageType.Standard]: { fileCount: standardCount.datas[0], storageSize: standardStorage.datas[0] }
    })
  }

  // 获取归档存储信息
  @autobind
  @Loadings.handle(Loading.ArchiveStorage)
  async fetchArchiveStorageInfo(options: IStorageFetchOptions) {
    const [begin, end] = getFormattedDateRangeValue(getMomentRangeBaseDuration())
    const fullOptions: IStatdBaseOptionsWithRegion = { g: Granularity.OneDay, begin, end, no_predel: 1, ...options }

    const [archiveCount, archiveStorage] = await Promise.all([
      this.statisticsApis.getArchiveCountData(fullOptions),
      this.statisticsApis.getArchiveStorageData(fullOptions)
    ])

    this.updateStorageMap(fullOptions.bucket!, {
      [StorageType.Archive]: { fileCount: archiveCount.datas[0], storageSize: archiveStorage.datas[0] }
    })
  }

  @autobind
  @Loadings.handle(Loading.DeepArchiveStorage)
  async fetchDeepArchiveStorageInfo(options: IStorageFetchOptions) {
    const [begin, end] = getFormattedDateRangeValue(getMomentRangeBaseDuration())
    const fullOptions: IStatdBaseOptionsWithRegion = { g: Granularity.OneDay, begin, end, no_predel: 1, ...options }

    const [archiveCount, archiveStorage] = await Promise.all([
      this.statisticsApis.getDeepArchiveCountData(fullOptions),
      this.statisticsApis.getDeepArchiveStorageData(fullOptions)
    ])

    this.updateStorageMap(fullOptions.bucket!, {
      [StorageType.DeepArchive]: { fileCount: archiveCount.datas[0], storageSize: archiveStorage.datas[0] }
    })
  }

  @autobind
  delayedFetchByName(bucket: string) {
    return new Promise((resolve, reject) => {
      setTimeout(
        () => this.fetchDetailsByName(bucket).then(resolve, reject),
        2500
      )
    })
  }

  @autobind
  @Loadings.handle(Loading.MediaStyle)
  async fetchMediaStyleList(bucket: string) {
    const data = await this.imageStyleApis.getImageStyles(bucket)
    runInAction(() => { this.mediaStyleMap.set(bucket, data) })
  }

  isShared(name: string): boolean | null {
    const bucket = this.getDetailsByName(name)
    return bucket ? isShared(bucket.perm) : null
  }

  @autobind
  isBlockChainPBucket(name: string) {
    const detail = this.getDetailsByName(name)
    return isBlockChainPBucket(detail && detail.systags)
  }

  @action.bound
  private handleCreateBucketSuccess(name: string) {
    this.fetchDetailsByName(name)
    this.bucketListStore.fetchByName(name)
  }

  @autobind
  create(options: ICreateBucketOptions) {
    const req = this.bucketApis.createBucket(options)
    req.then(() => this.handleCreateBucketSuccess(options.name)).catch(() => { /**/ }) // 创建成功 fetch 一下
    return req
  }

  @action.bound
  private handleDeleteBucketSuccess(name: string) {
    this.detailsMap.delete(name) // 清理缓存
    this.bucketListStore.fetchList()
  }

  @autobind
  delete(name: string) {
    const req = this.bucketApis.deleteBucket(name)
    req.then(() => this.handleDeleteBucketSuccess(name), () => null).catch(() => { /**/ })
    return req
  }
}
