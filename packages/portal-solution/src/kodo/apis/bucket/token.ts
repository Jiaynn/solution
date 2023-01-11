/**
 * @file bucket 资源相关接口
 * @author nighca <nighca@live.cn> and yinxulai <me@yinxulai.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'

import { kodov2 } from 'kodo/constants/apis'

export interface IPutPolicy {
  scope: string
  isPrefixalScope: number // 若为非0，则Scope的key部分表示为前缀限定
  callbackUrl: string
  callbackHost: string
  callbackBodyType: string
  callbackBody: string
  callbackFetchKey: number // 先回调取得key再改名 https://pm.qbox.me/issues/11851
  callbackTimeout: number // 允许自定义超时需求 https://pm.qbox.me/issues/21576
  customer: string
  endUser: string
  transform: string
  fopTimeout: number
  // 截止时间（以秒为单位）原来是number 上限为到2106年 如果用户设置过期时间超过了这个上限就会鉴权失败 请各单位如果编译不过自行调整https://pm.qbox.me/issues/25718
  deadline: number
  escape: number // 是否允许存在转义符号
  detectMime: number
  exclusive: number // 若为非0, 即使Scope为"Bucket:key"的形式也是insert only
  insertOnly: number // Exclusive 的别名
  returnBody: string
  signReturnBody: number // 默认不开启签名，需要用户的 AK SK
  returnUrl: string
  fsizeMin: number
  fsizeLimit: number
  mimeLimit: string
  saveKey: string
  persistentOps: string
  persistentNotifyUrl: string
  persistentPipeline: string
  checksum: string
  accesses
  deleteAfterDays: number
  fileType: number
  notifyQueue: string
  notifyMessage: string
  notifyMessageType: string
  oldFh: string
}

@autobind
@injectable()
export class TokenApis {
  constructor(private kodoCommonClient: KodoCommonClient) { }

  async getUpToken(bucket: string, putPolicy?: Partial<IPutPolicy>): Promise<string> {
    // TODO: 想个啥办法把这个 returnBody 的类型给丢出去
    // 上传策略：https://developer.qiniu.com/kodo/manual/1206/put-policy
    putPolicy = {
      scope: bucket,
      deadline: Math.floor(new Date().getTime() / 1000 + 86400), // 过期时间 1 天
      returnBody: '{"key":"$(key)","mimeType":"$(mimeType)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
      ...putPolicy
    }

    return this.kodoCommonClient.get(kodov2.getUpToken, { putPolicy: JSON.stringify(putPolicy) })
  }
}
