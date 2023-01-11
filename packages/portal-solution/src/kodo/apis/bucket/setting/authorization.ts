/**
 * @file 空间授权
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// TODO: ACL 升级，功能更全，不止 rw
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'

import { kodov2 } from 'kodo/constants/apis'
import { ShareType } from 'kodo/constants/bucket/setting/authorization'

export type ShareBucketErrorResp = any

export interface IShareBucketOptions {
  sourceBucketName: string
  targetBucketName?: string
  targetEmail: string
  shareType: ShareType
}

@autobind
@injectable()
export class AuthorizationApis {
  constructor(private kodoCommonClient: KodoCommonClient) { }

  // https://github.com/qbox/product/blob/master/kodo/bucket/tblmgr.md#share-%E7%A9%BA%E9%97%B4%E6%8E%88%E6%9D%83
  // https://developer.qiniu.com/kodo/manual/3647/authorization-of-the-space
  async shareBucket(options: IShareBucketOptions) {
    const {
      sourceBucketName, targetBucketName, targetEmail, shareType
    } = options

    return this.kodoCommonClient.post(kodov2.shareBucket, {
      bucket: sourceBucketName,
      email: targetEmail,
      perm: String(shareType),
      ...(targetBucketName ? { name: targetBucketName } : {})
    })
  }
}
