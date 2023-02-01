/**
 * @file bucket cross api
 * @description bucket 跨域管理相关的接口
 * @author yinxulai <me@yinxulai.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'

export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  HEAD = 'HEAD'
}

export interface ICrossOriginRule {
  allowed_origin: string[]
  allowed_method: Method[]
  allowed_header?: string[]
  exposed_header?: string[]
  max_age?: number
}

@autobind
@injectable()
export class CrossOriginApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  // 获取空间的跨域规则
  getCrossOriginRules(bucket: string): Promise<ICrossOriginRule[]> {
    return this.kodoProxyClient.get(`${proxy.getCorsRules}/${bucket}`, {})
  }

  // 更新空间的跨域规则
  updateCrossOriginRules(bucket: string, rules: ICrossOriginRule[]): Promise<void> {
    return this.kodoProxyClient.post(`${proxy.setCorsRules}/${bucket}`, rules)
  }
}
