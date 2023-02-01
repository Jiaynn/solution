/**
 * @file 空间备注
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'

@autobind
@injectable()
export class RemarkApis {
  constructor(
    private kodoProxyClient: KodoProxyClient
  ) { }

  setRemark(bucketName: string, remark: string) {
    const url = proxy.setRemark(bucketName)
    return this.kodoProxyClient.put(url, { remark })
  }
}
