/**
 * @file domain api
 * @description domain 相关的接口
 * @author yinxulai <me@yinxulai.com>
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { MimeType } from 'qn-fe-core/client'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'
import { KodoProxyApiException, KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { ConfigStore } from 'kodo/stores/config'

import { kodov2, proxy } from 'kodo/constants/apis'
import {
  DomainSourceType, CDNDomainStatus, CDNDomainOperationType, CDNDomainType, DomainScope, DomainFreezeType, DomainType
} from 'kodo/constants/domain'
import { AntiLeechMode } from 'kodo/constants/bucket/setting/referrer'

export type Protocol = 'http' | 'https'

export interface DomainInfo {
  domain: string                        // 域名
  bucket: string                        // 空间名
  create_time?: number                  // 创建时间时间戳
  update_time?: number                  // 更新时间时间戳
  api_scope?: DomainScope               // 域名使用的接口
  domain_types?: DomainType[]           // 域名类型列表，只有在查询是 DomainType.All 的时候才会返回这个字段
  freeze_types?: DomainFreezeType[]     // 冻结类型列表
}

export interface ICDNDomainOptions {
  sourceQiniuBucket: string
}

export interface IDefaultDomain {
  domain: string
  protocol: Protocol
  domainType: DomainSourceType
  isAvailable?: boolean
}

export interface ICDNDomainInfo {
  cname: string
  sourceQiniuBucket: string
  couldOperateBySelf: boolean
  createAt: string
  geoCover: string
  leftDays: number
  modifyAt: string
  name: string
  operatingState: CDNDomainStatus
  operatingStateDesc: string
  operationType: CDNDomainOperationType
  pareDomain: string
  platform: string
  protocol: Protocol
  qiniuPrivate: boolean
  testURLPath: string
  type: CDNDomainType
}

export interface IS3Domain {
  s3endpoint: string
  domain: string
  tbl: string
  owner: number
  domaintype: DomainSourceType.Source
  antileech: AntiLeechMode
}

export interface IBindDomainOptions {
  bucket: string
  domain: string
  api_scope: DomainScope
}

const cdnDomainMessageMap = {
  403: '暂无权限，获取 CDN 加速域名失败'
}

@autobind
@injectable()
export class DomainApis {
  constructor(
    private configStore: ConfigStore,
    private kodoProxyClient: KodoProxyClient,
    private kodoCommonClient: KodoCommonClient
  ) { }

  // 获取指定 bucket 下的所有域名
  getDomainsByBucketName(bucketName: string): Promise<DomainInfo[]> {
    return this.kodoCommonClient.get(kodov2.getDomainsByBucketName, { bucket: bucketName })
  }

  // 绑定域名到空间
  bindDomainToBucket(options: IBindDomainOptions): Promise<void> {
    return this.kodoProxyClient.post(proxy.domain, options)
  }

  // 解绑空间域名
  unbindBucketDomain(domain: string, bucket?: string): Promise<void> {
    return this.kodoProxyClient.fetch(proxy.domain, {
      method: 'Delete',
      payload: bucket ? { domain, bucket } : { domain }
    })
  }

  // 解冻域名
  unfreezeDomain(domain: string): Promise<void> {
    return this.kodoProxyClient.post(proxy.unfreezeDomain, { domain }, {
      headers: { 'content-type': MimeType.XWwwFormUrlencoded }
    })
  }

  // 不直接调用这些接口，而是通过相关 store 去拿

  async getCDNDomains(options: ICDNDomainOptions, requestCounts = 5): Promise<ICDNDomainInfo[]> {
    const params = {
      sourceTypes: ['qiniuBucket'],
      limit: 100,
      marker: '',
      ...options
    }

    const domains: ICDNDomainInfo[] = []

    const getDomains = async () => {
      const result = await this.kodoProxyClient.get<any>(proxy.getCDNDomains, params)
        .catch(error => {
          if (error instanceof KodoProxyApiException) {
            throw error.withMessage(cdnDomainMessageMap[error.code])
          }
          throw error
        })

      requestCounts--

      result.domains = result.domains.map((item: ICDNDomainInfo) => ({
        ...item,
        sourceQiniuBucket: options.sourceQiniuBucket
      }))

      domains.push(...result.domains)

      if (result.marker && requestCounts) {
        params.marker = result.marker
        await getDomains()
      }
    }

    await getDomains()

    return domains
  }

  getDefaultDomain(bucket: string): Promise<IDefaultDomain> {
    return this.kodoCommonClient.get(kodov2.getDefaultDomain, {
      bucket,
      product: this.configStore.product
    })
  }

  setDefaultDomain(bucket: string, domain: string): Promise<void> {
    return this.kodoCommonClient.post(kodov2.setDefaultDomain, { bucket, domain })
  }

  getS3Domain(bucket: string): Promise<IS3Domain> {
    return this.kodoProxyClient.get(`${proxy.getS3Domain}?tbl=${bucket}`, {})
  }
}
