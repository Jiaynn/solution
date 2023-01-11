/**
 * @file apis of original protected of bucket setting 原图保护
 * @author yinxulai <yinxulai@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'
import { ProtectedMode } from 'kodo/constants/bucket/setting/original-protected'

@autobind
@injectable()
export class OriginalProtectedApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  setProtectedMode(bucketName: string, mode: ProtectedMode): Promise<void> {
    return this.kodoProxyClient.post(`${proxy.setAccessMode}/${bucketName}/mode/${mode}`, {})
  }
}
