/**
 * @file apis of Dashboard
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as qs from 'query-string'
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'

import { ConfigStore } from 'kodo/stores/config'

import {
  IFlowSrcValue, FileUploadCountSelectField,
  SelectField, StorageType, KodoBillGroup
} from 'kodo/constants/statistics'
import { Granularity } from 'kodo/constants/date-time'
import { RegionSymbol } from 'kodo/constants/region'
import { proxy, kodov2 } from 'kodo/constants/apis'

export interface ITimeSelectOptions<ST = string> {
  select: ST
  begin: string
  end: string
  g: Granularity
}

export interface IBucketSelectOptions {
  bucket?: string
  region?: RegionSymbol
}

export interface IBucketSelectWith$Options {
  $bucket?: string
  $region?: RegionSymbol
}

export interface IFlowOptions extends ITimeSelectOptions, IBucketSelectWith$Options {
  $ftype: StorageType
  $src?: IFlowSrcValue
  $domain?: string
  $metric?: IFlowSrcValue // single_isp_flow_out 使用这个
  group?: KodoBillGroup
}

export interface IAPIPutOptions extends ITimeSelectOptions<SelectField>, IBucketSelectWith$Options {
  $ftype: StorageType
}

export interface IFileUploadCountOptions extends ITimeSelectOptions<FileUploadCountSelectField>, IBucketSelectOptions {
}

export interface INormalFileUploadCountOptions extends IFileUploadCountOptions {
  select: FileUploadCountSelectField.NormalUpCount
}

export interface ILineFileUploadCountOptions extends IFileUploadCountOptions {
  select: FileUploadCountSelectField.LineUpCount
}

export interface IArchiveFileUploadCountOptions extends IFileUploadCountOptions {
  select: FileUploadCountSelectField.ArchiveUpCount
}

export interface IStatdBaseOptions extends Omit<ITimeSelectOptions, 'select'> {
  bucket?: string
  no_predel?: 1   // 值为 1 时表示剔除低频存储和归档存储中提前删除的量来计算剩余的存储量
  only_predel?: 1 // 值为 1 时表示仅查询提前删除的量
}

export interface IStatdBaseOptionsWithRegion extends IStatdBaseOptions {
  region?: RegionSymbol
}

export interface ITransferFlowOptions extends ITimeSelectOptions {
  bucket?: string
  isOversea: boolean // false 国内，true 海外

  $product?: string
}

export interface IStatdBaseData {
  times: number[]
  datas: number[]
}

export interface IReportBaseData<T> {
  time: string
  values: T
}

export interface IGroupedReportBaseData<T> {
  time: string
  values: { [s: string]: T }
}

export type IReportData<T> = Array<IReportBaseData<T>>
export type IGroupedReportData<T> = Array<IGroupedReportBaseData<T>>
export type IFlowData<T> = Array<IReportBaseData<T> | IGroupedReportBaseData<T>>

export type IStorageKey = (
  SelectField.CountSet
  | SelectField.SpaceSet
  | SelectField.SpaceLineSet
  | SelectField.CountLineSet
)

export type IStorageValue = Partial<Record<IStorageKey, number>>

export interface IFlowValue {
  flow: number
}

export interface IAPIValue {
  hits: number
}

export interface ITransferFlowValue {
  size: number
}

export interface IFileUploadCountValue {
  normal_up_count: number
}

export interface IFileUploadCountLineValue {
  line_up_count: number
}

export interface IFileUploadCountArchiveValue {
  archive_up_count
}

export type NormalFileUploadCountData = IReportData<IFileUploadCountValue>
export type LineFileUploadCountData = IReportData<IFileUploadCountLineValue>
export type ArchiveFileUploadCountData = IReportData<IFileUploadCountArchiveValue>
export type FileUploadCountData = NormalFileUploadCountData | LineFileUploadCountData | ArchiveFileUploadCountData

export type TransferFlowData = IReportData<ITransferFlowValue>

export interface IIamStatisticsBucketInfo {
  allowAll: boolean
  allowList: string[]
}

@autobind
@injectable()
export class StatisticsApis {
  constructor(
    private configStore: ConfigStore,
    private kodoProxyClient: KodoProxyClient,
    private kodoCommonClient: KodoCommonClient
  ) { }

  getStorageTypeStorageDataFetchMethod(type: StorageType) {
    const methodMap = {
      [StorageType.Standard]: this.getStandardStorageData,
      [StorageType.LowFrequency]: this.getLineStorageData,
      [StorageType.Archive]: this.getArchiveStorageData,
      [StorageType.DeepArchive]: this.getDeepArchiveStorageData
    } as const

    return methodMap[type]
  }

  getStorageTypeCountDataFetchMethod(type: StorageType) {
    const methodMap = {
      [StorageType.Standard]: this.getStandardCountData,
      [StorageType.LowFrequency]: this.getLineCountData,
      [StorageType.Archive]: this.getArchiveCountData,
      [StorageType.DeepArchive]: this.getDeepArchiveCountData
    }

    return methodMap[type]
  }

  // 获取外网流出流量数据
  getOutflowData<T>(options: IFlowOptions & { group: KodoBillGroup }): Promise<IGroupedReportData<T>>
  getOutflowData<T>(options: IFlowOptions & { group?: KodoBillGroup }): Promise<IReportData<T>>
  getOutflowData<T>(options: IFlowOptions): Promise<IReportData<T>> {
    const { $src, ...params } = options

    const queryString = $src ? `?${qs.stringify({ $src })}` : ''
    const url = proxy.getOutflowData + queryString
    return this.kodoProxyClient.get(url, {
      ...params,
      disable_ctime: true,

      $product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  // 获取外网流入流量数据
  getInflowData<T>(options: IFlowOptions): Promise<IReportData<T>> {
    // FIXME: 流入暂时不支持 ftype 指定
    const { $src, $ftype: _, ...params } = options

    const queryString = $src ? `?${qs.stringify({ $src })}` : ''
    const url = proxy.getInflowData + queryString
    return this.kodoProxyClient.get(url, {
      ...params,
      disable_ctime: true,

      $product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  // put 请求数
  getAPIPutData<T>(options: IAPIPutOptions): Promise<IReportData<T>> {
    return this.kodoProxyClient.get(proxy.getAPIPutData, {
      ...options,
      disable_ctime: true,

      $product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  // 低频存储量
  getLineStorageData(options: IStatdBaseOptionsWithRegion): Promise<IStatdBaseData> {
    return this.kodoProxyClient.get(proxy.getLineStorageData, {
      ...options,
      disable_ctime: true,

      product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  // 低频存储文件数
  getLineCountData(options: IStatdBaseOptionsWithRegion): Promise<IStatdBaseData> {
    return this.kodoProxyClient.get(proxy.getLineCountData, {
      ...options,
      disable_ctime: true,

      product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  // 标准存储量
  getStandardStorageData(options: IStatdBaseOptionsWithRegion): Promise<IStatdBaseData> {
    return this.kodoProxyClient.get(proxy.getStandardStorageData, {
      ...options,
      disable_ctime: true,

      product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  // 标准存储文件数
  getStandardCountData(options: IStatdBaseOptionsWithRegion): Promise<IStatdBaseData> {
    return this.kodoProxyClient.get(proxy.getStandardCountData, {
      ...options,
      disable_ctime: true,

      product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  // 归档存储量
  getArchiveStorageData(options: IStatdBaseOptionsWithRegion): Promise<IStatdBaseData> {
    return this.kodoProxyClient.get(proxy.getArchiveStorageData, {
      ...options,
      disable_ctime: true,

      product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  // 归档存储文件数
  getArchiveCountData(options: IStatdBaseOptionsWithRegion): Promise<IStatdBaseData> {
    return this.kodoProxyClient.get(proxy.getArchiveCountData, {
      ...options,
      disable_ctime: true,

      product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  getDeepArchiveStorageData(options: IStatdBaseOptionsWithRegion): Promise<IStatdBaseData> {
    return this.kodoProxyClient.get(proxy.getDeepArchiveStorageData, {
      ...options,
      disable_ctime: true,

      product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  getDeepArchiveCountData(options: IStatdBaseOptionsWithRegion): Promise<IStatdBaseData> {
    return this.kodoProxyClient.get(proxy.getDeepArchiveCountData, {
      ...options,
      disable_ctime: true,

      product: this.configStore.product,
      fogRegionsEnable: true
    })
  }

  getFileUploadCount(options: INormalFileUploadCountOptions): Promise<NormalFileUploadCountData>
  getFileUploadCount(options: ILineFileUploadCountOptions): Promise<LineFileUploadCountData>
  getFileUploadCount(options: IArchiveFileUploadCountOptions): Promise<ArchiveFileUploadCountData>
  getFileUploadCount(options: IFileUploadCountOptions): Promise<FileUploadCountData>
  getFileUploadCount(options: IFileUploadCountOptions): Promise<FileUploadCountData> {
    const { region, bucket, ...params } = options

    return this.kodoProxyClient.get(proxy.getFileUploadCount, {
      ...params,
      disable_ctime: true,

      $product: this.configStore.product,
      fogRegionsEnable: true,

      ...(region && { $region: region }),
      ...(bucket && { $bucket: bucket })
    })
  }

  getTransferFlow(options: ITransferFlowOptions): Promise<TransferFlowData> {
    const { isOversea, ...params } = options

    return this.kodoProxyClient.get(proxy.getTransferFlow, {
      ...params,
      disable_ctime: true,

      $product: this.configStore.product,
      fogRegionsEnable: true,
      $is_oversea: isOversea ? 1 : 0
    })
  }

  getIamStatisticsBucketInfo(): Promise<IIamStatisticsBucketInfo> {
    return this.kodoCommonClient.get(kodov2.getIamStatisticsBuckets, { product: this.configStore.product })
  }
}
