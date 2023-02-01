/**
 * @file bucket referrer API
 * @author Surmon <i@surmon.me>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'
import { NoReferrer, AntiLeechMode } from 'kodo/constants/bucket/setting/referrer'

export interface IReferrer {
  mode: AntiLeechMode
  norefer: NoReferrer
  pattern: string
  source_enabled: 1
}

@autobind
@injectable()
export class ReferrerApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  // 设置防盗链
  updateReferrer(bucketName: string, referrer: IReferrer) {
    const params = {
      ...referrer,
      bucket: bucketName
    }
    return this.kodoProxyClient.post(formatURL(proxy.setBucketReferrerAntiLeech, params), {})
  }
}
