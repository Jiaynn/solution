/**
 * @file bucket routing API
 * @author zhaojianan <zhaojianan@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'

export enum KeyType {
  Default = 'default',
  Fix ='fix',
  Append = 'append',
  Replace = 'replace'
}

export interface Condition {
  code?: number,
  prefix?: string,
  suffix?: string
}

export interface Redirect {
  host: string,
  code: number,
  scheme: string,
  retain_query: boolean,
  key_type: KeyType,
  path?: string,
  prefix?: string,
  suffix?: string,
  replace_blank_prefix?: boolean,
  replace_blank_suffix?: boolean
}

export interface RoutingRule {
  condition: Condition,
  redirect: Redirect
}

@autobind
@injectable()
export class RoutingApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  async fetchRoutingRules(bucketName: string): Promise<RoutingRule[]> {
    return this.kodoProxyClient.get(proxy.routing(bucketName))
  }

  async putRoutingRules(bucketName: string, rules: RoutingRule[]): Promise<void> {
    return this.kodoProxyClient.put(proxy.routing(bucketName), rules)
  }
}
