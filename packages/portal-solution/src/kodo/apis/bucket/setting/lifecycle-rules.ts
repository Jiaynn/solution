/**
 * @desc Bucket object lifecycle api list.
 * @author hovenjay <hovenjay@outlook.com>
 */
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { MimeType } from 'qn-fe-core/client'
import { StorageType } from 'kodo-base/lib/constants'

import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'

export interface Transition {
  days: number
  storage_class: StorageType
}

export interface HistoryTransition {
  noncurrent_days: number
  storage_class: StorageType
}

/* 规则按最长前缀匹配，前缀规则优先于全局规则匹配，每个上传的文件最多匹配一个规则 */
export interface LifecycleRule {
  /** 规则名称 */
  name: string
  /** 规则对空间中哪一部分前缀的文件生效，同一个 bucket 里面前缀不能重复 */
  prefix: string
  /** 指定 Object生命周期规则的过期属性 */
  expiration: {
    days: number
  }
  /** 指定 Object 何时转储为低频、归档和深度归档的存储类型 */
  transition: Transition[]
  /** 历史版本，对标 expiration */
  noncurrent_version_expiration: {
    noncurrent_days: number
  }
  /** 历史版本，对标 transition */
  noncurrent_version_transition: HistoryTransition[]
  /** 暂未启用 */
  tag?: {
    key: string
    value: string
  }
  /** 设置允许分片上传保持运行的最长时间 */
  abort_incomplete_multipart_upload?: {
    /** 指明分片上传开始后多少天内必须完成上传 */
    days_after_initiation: number
  }
  /** 创建时间 */
  ctime?: string
}

@autobind
@injectable()
export class LifecycleRuleApi {
  constructor(private kodoProxyClient: KodoProxyClient) {}

  /**
  * 获取空间生命周期规则列表
  *
  * @param bucket - 空间名称
  */
  fetchRules(bucket: string): Promise<{rules: LifecycleRule[]}> {
    return this.kodoProxyClient.get(proxy.lifecycle(bucket))
  }

  /**
  * 设置空间生命周期规则
  *
  * @param bucket 空间
  * @param rule - 规则信息
  */
  putRule(bucket: string, rules: LifecycleRule[]): Promise<void> {
    return this.kodoProxyClient.put(proxy.lifecycle(bucket), { rules }, { headers: { 'content-type': MimeType.Json } })
  }

  /**
  * 删除空间生命周期规则
  *
  * @param bucket - 空间
  * @param ruleName - 规则名
  */
  deleteRule(bucket: string, ruleName: string): Promise<void> {
    return this.kodoProxyClient.delete(`${proxy.lifecycle(bucket)}?name=${ruleName}`, { headers: { 'content-type': MimeType.Json } })
  }
}
