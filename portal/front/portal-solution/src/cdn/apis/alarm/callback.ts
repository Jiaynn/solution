/**
 * @file 告警回调地址配置相关 API
 * @author linchen <linchen@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'

import AlarmClient from 'cdn/apis/clients/alarm'

export interface CallbackInfo {
  /** 告警回调地址，没有设置的用户返回空字符串 */
  callbackUri: string
}

@injectable()
export default class AlarmCallbackApis {
  private apiPrefix = '/alarm/user/callback'

  constructor(
    private client: AlarmClient
  ) {}

  getAlarmCallback() {
    return this.client.get<CallbackInfo>(this.apiPrefix)
  }

  upsertAlarmCallback(uri: string) {
    return this.client.post<void>(this.apiPrefix, { callbackUri: uri })
  }

  deleteAlarmCallback() {
    return this.client.delete<void>(this.apiPrefix)
  }
}
