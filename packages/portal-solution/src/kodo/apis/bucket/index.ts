/**
 * @file bucket api
 * @description bucket 相关的接口
 * @author yinxulai <me@yinxulai.com>
 */

import autobind from 'autobind-decorator'
import { injectable, lazyInject } from 'qn-fe-core/di'
import { InvalidOutputPayloadException } from 'qn-fe-core/client'

import { UserInfoStore } from 'portal-base/user/account'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'
import { KodoCommonApiException, KodoCommonClient, KodoCommonErrorCode } from 'portal-base/kodo/apis/common'

import { ConfigStore } from 'kodo/stores/config'

import { kodov2, proxy } from 'kodo/constants/apis'
import { BucketSysTag, BucketType } from 'kodo/constants/bucket'
import { PrivateType } from 'kodo/constants/bucket/setting/access'
import { ShareType, IShareUser } from 'kodo/constants/bucket/setting/authorization'
import { NoReferrer, AntiLeechMode } from 'kodo/constants/bucket/setting/referrer'
import { ProtectedMode } from 'kodo/constants/bucket/setting/original-protected'
import { NoIndexPage } from 'kodo/constants/bucket/setting/default-index'
import { RegionSymbol } from 'kodo/constants/region'

// 字段不全（谁使用 -> 谁维护，主要没文档、或者文档也不全）
export interface IBucket {
  file_num: number                        // 文件数
  storage_size: number                    // 存储量
  itbl: number                            // 空间唯一 ID（owner 的空间）
  phy: string
  // tbl: string                            // 空间名称（owner 的空间）有些空间没有该信息，慎用
  region: RegionSymbol                    // 所属区域
  global: boolean
  line: boolean
  versioning: boolean
  ouid: number                            // 空间 owner uid
  oitbl: number                           // 空间唯一 ID（被授权的空间）
  otbl: string                            // 空间名称（被授权的空间）
  perm: ShareType
  protected: ProtectedMode
  oemail?: string                         // 如果是被授权空间，会有这个被授权者的邮箱信息，webserver 插入的
  share_users?: IShareUser[]
  ctime: number
  private: PrivateType                    // 访问控制，是否私有
  max_age: number                         // maxAge
  no_index_page: NoIndexPage              // 默认首页设置，是否无默认首页
  cors_rules: string[]
  anti_leech_mode: AntiLeechMode
  refer_wl: string[]
  refer_bl: string[]
  no_refer: NoReferrer
  encryption_enabled: boolean
  transcode_styles: ITranscodeStyle
  separator: string
  systags?: BucketSysTag[]                // 空间系统标签
  styles: { [key: string]: string }
  remark: string                          // 空间备注
}

export interface BucketInfo {
  id: string
  tbl: string
  itbl: number
  uid: number
  zone: string
  region: string
  global: boolean
  line: boolean
  systags?: BucketSysTag[]                // 空间系统标签
}

export interface ITranscodeStyle {
  [key: string]: ITranscodeStyleInfo
}

export interface ITranscodeStyleInfo {
  command: string
  bucket: string
  callback_url: string
  pipeline: string
}

@autobind
@injectable()
export class BucketApis {
  constructor(
    private configStore: ConfigStore,
    private kodoProxyClient: KodoProxyClient,
    private kodoCommonClient: KodoCommonClient,
    @lazyInject(() => UserInfoStore) private userInfoStore: UserInfoStore
  ) { }

  getBucketDetailsWithSysTagByName(bucketName: string): Promise<BucketInfo> {
    return this.kodoProxyClient.get(proxy.getBucketInfo + '/' + encodeURIComponent(bucketName), {})
  }

  getBucketDetailsByName(bucketName: string): Promise<IBucket> {
    return this.kodoCommonClient.post(`${kodov2.getBucketDetails}?bucket=${bucketName}&fs=true`, {})
  }

  // 创建 Bucket
  createBucket(options: ICreateBucketOptions): Promise<void> {
    const params = {
      bucket: options.name,
      zone: options.region,
      bucket_type: options.bucketType,
      private: String(options.privateType),
      product: this.configStore.product
    }

    return this.kodoCommonClient.post<void>(kodov2.createBucket, params).catch((e: unknown) => {
      if (e instanceof KodoCommonApiException && e.code === KodoCommonErrorCode.UnidentifiedUser) {
        throw e.withMessage(
          (this.userInfoStore.isOverseasStdUser || this.userInfoStore.isOverseasUser)
            ? '账号信息未完善'
            : '账户未认证'
        )
      }

      throw e
    })
  }

  deleteBucket(bucketName: string, isDeleteDomain = true): Promise<void> {
    return this.kodoCommonClient.post(kodov2.deleteBucket, {
      product: this.configStore.product,
      bucket: bucketName,
      isDeleteDomain
    })
  }

  async hasBucket(bucketName: string): Promise<boolean> {
    const result: any = await this.kodoCommonClient.get(`${kodov2.checkExisting}/${bucketName}`, {})
    if (!result) {
      throw new InvalidOutputPayloadException(result, '接口响应有误')
    }
    return !!result.exist
  }

  // 对删除空间进行预检查
  canDropBucket(bucketName: string): Promise<ICheckDropResult> {
    return this.kodoCommonClient.get(`${kodov2.canDropBucket}/${bucketName}`, {
      product: this.configStore.product
    })
  }
}

export interface ICreateBucketOptions {
  name: string
  region: RegionSymbol
  privateType: PrivateType // 是否开启私有
  bucketType?: BucketType // 空间类型
}

interface ICheckDropResult {
  result: boolean
  allowDropNonEmpty?: boolean
  hubs?: string[]
  domains?: string[]
  source?: 'bucket' | 'fusion' | 'pili'
}
