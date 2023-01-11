/**
 * @file WORM API
 * @author hovenjay <hovenjay@outlook.com>
 */

import autobind from 'autobind-decorator'
import * as qs from 'query-string'
import { injectable } from 'qn-fe-core/di'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'

export interface IWorm {
  objectLockEnabled?: 'Enabled'
  rule?: {
    mode: string
    days?: number
    years?: number
  }
}

@autobind
@injectable()
export class WormApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  getWorm(bucketName: string): Promise<IWorm> {
    return this.kodoProxyClient.get(proxy.worm, { bucket: bucketName })
  }

  setWorm(bucketName: string, rule: IWorm) {
    return this.kodoProxyClient.put(
      proxy.worm + '?' + qs.stringify({ bucket: bucketName }),
      rule
    )
  }
}
