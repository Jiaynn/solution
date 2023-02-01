/**
 * @desc Bucket event notification rules api list.
 * @author hovenjay <hovenjay@outlook.com>
 */
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { MimeType } from 'qn-fe-core/client'

import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'

export enum EventType {
  Put = 'put',
  CreateDeleteMarker = 'deleteMarkerCreate',
  Mkfile = 'mkfile',
  Delete = 'delete',
  Copy = 'copy',
  Move = 'move',
  Append = 'append',
  Disable = 'disable',
  Enable = 'enable',
  RestoreComplete = 'restore:completed'
}

export interface EventNotificationRule {
  /** 通知规则名称，空间内唯一，长度小于 50，不能为空，只能为字母、数字、下划线 */
  name: string
  /** 事件通知规则创建时间 */
  ctime?: string
  /** 可选，事件通知规则对空间中哪一部分前缀的文件生效 */
  prefix?: string
  /** 可选，事件通知规则对空间中哪一部分后缀的文件生效 */
  suffix?: string
  /** 事件通知规则对空间中哪些事件生效，至少一个，可设置多个 */
  events: EventType[]
  /** 事件通知规则触发后的回调 URL，至少一个，可设置多个 */
  callback_urls: string[]
}

@autobind
@injectable()
export class EventNotificationRuleApi {
  constructor(private kodoProxyClient: KodoProxyClient) {}

  /**
    * 获取事件通知规则列表
    *
    * @param bucket - 空间名称
    */
  fetchRules(bucket: string): Promise<{notifications: EventNotificationRule[]}> {
    return this.kodoProxyClient.get(proxy.notification(bucket))
  }

  /**
  * 设置事件通知规则
  *
  * @param bucket - 空间名称
  * @param rule - 事件通知规则
  */
  putRule(bucket: string, rules: EventNotificationRule[]): Promise<void> {
    return this.kodoProxyClient.put(proxy.notification(bucket), { notifications: rules }, { headers: { 'content-type': MimeType.Json } })
  }

  /**
  * 删除事件通知规则
  *
  * @param bucket - 空间
  * @param ruleName - 规则名称
  */
  deleteRule(bucket: string, ruleName: string): Promise<void> {
    return this.kodoProxyClient.delete(`${proxy.notification(bucket)}?name=${ruleName}`)
  }
}

