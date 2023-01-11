/**
 * @file bucket censor api
 * @description bucket 审核设置
 * @author yinxulai <me@yinxulai.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'
import { CensorType, CensorStatus } from 'kodo/constants/bucket/setting/censor'

export interface IBucketCensorStatus {
  type: CensorType
  status: CensorStatus
}

@autobind
@injectable()
export class CensorApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  getStatus(bucket: string): Promise<IBucketCensorStatus[]> {
    const source = encodeURIComponent(JSON.stringify({ buckets: [{ bucket }] }))
    return this.kodoProxyClient.get(`${proxy.getCensorStatus}?source_type=KODO&source=${source}`, {})
  }
}
