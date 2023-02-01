/**
 * @file apis of encryption of bucket setting 服务端加密
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { MimeType } from 'qn-fe-core/client'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'

import { kodov2 } from 'kodo/constants/apis'

@autobind
@injectable()
export class EncryptionApis {
  constructor(private kodoCommonClient: KodoCommonClient) { }

  setEncryption(bucketName: string, enabled: boolean) {
    const params = {
      tbl: bucketName,
      enabled
    }

    return this.kodoCommonClient.post(kodov2.setBucketEncryption, params, {
      headers: { 'content-type': MimeType.XWwwFormUrlencoded }
    })
  }
}
