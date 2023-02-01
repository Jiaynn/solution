/**
 * @file bucket list api
 * @description bucket 列表相关的接口
 * @author yinxulai <me@yinxulai.com>
 */

import * as qs from 'query-string'
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { tagToBase64String } from 'kodo/transforms/bucket/setting/tag'

import { ConfigStore } from 'kodo/stores/config'

import { kodov2, proxy } from 'kodo/constants/apis'
import { RegionSymbol } from 'kodo/constants/region'
import { PrivateType } from 'kodo/constants/bucket/setting/access'
import { IShareUser, ShareType } from 'kodo/constants/bucket/setting/authorization'

import { ITag } from './setting/tag'

export interface IBucketListItem {
  allow_nullkey: boolean
  ctime: number
  encryption_enabled: boolean
  // file_num: number
  global: boolean
  itbl: number
  line: boolean
  oitbl: number
  otbl: string
  ouid: number
  perm: ShareType
  oemail?: string // 如果是被授权空间，会有这个被授权者的邮箱信息，webserver 插入的
  share_users?: IShareUser[]
  region: RegionSymbol
  // storage_size: number
  tbl: string
  uid: number
  private: PrivateType
  versioning: boolean
  product: string
  id: string
}

export interface IV3BucketListItem extends IBucketListItem {
  // 文件数
  file_num: number
  // 存储量
  storage_size: number
  // 空间配额
  bucket_quota: {
    size: number
    count: number
  }
}

export interface IGetBucketListOptions {
  tags?: Array<ITag | string> // tag 是同时指定 key、value, string 是仅搜索 key
  region?: RegionSymbol // 地区
  shared?: boolean // 共享空间
  line?: boolean // 兼容字段 原来有低频空间的概念、现在低频概念细化到了文件级别
  product?: string
}

@autobind
@injectable()
export class BucketListApis {
  constructor(
    private configStore: ConfigStore,
    private kodoProxyClient: KodoProxyClient,
    private kodoCommonClient: KodoCommonClient
  ) { }

  getBucketList(options?: IGetBucketListOptions): Promise<IBucketListItem[]> {
    const { tags = [], product = this.configStore.product, ...rest } = { ...options }
    const tagCondition = tagToBase64String(tags)

    const data = {
      ...rest,
      product,
      ...(tagCondition ? { tagCondition } : {})
    }

    return this.kodoCommonClient.post(`${kodov2.getBuckets}?${qs.stringify(data)}`, {})
  }

  getV3BucketList(options?: IGetBucketListOptions): Promise<IV3BucketListItem[]> {
    const { tags = [], product = this.configStore.product, ...rest } = { ...options }
    const tagCondition = tagToBase64String(tags)

    const data = {
      ...rest,
      product,
      ...(tagCondition ? { tagCondition } : {})
    }

    return this.kodoCommonClient.post<IV3BucketListItem[] | null>(`${kodov2.getV3Buckets}?${qs.stringify(data)}`, {}).then(result => result ?? [])
  }

  getBucketNameList(options?: IGetBucketListOptions): Promise<string[]> {
    const { tags = [], product = this.configStore.product, ...rest } = { ...options }
    const tagCondition = tagToBase64String(tags)

    const data = {
      ...rest,
      product,
      ...(tagCondition ? { tagCondition } : {})
    }

    return this.kodoProxyClient.get<string[] | null>(proxy.getBucketNameList, data).then(result => result ?? [])
  }

  getBucketListItemByName(name: string): Promise<IBucketListItem> {
    return this.kodoCommonClient.get(`${kodov2.getBucketWithFS}/${name}`, {})
  }
}
