/**
 * @file apis of access control of bucket setting 公有 / 私有 空间
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'
import { KodoProxyApiException, KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { PrivateType } from 'kodo/constants/bucket/setting/access'

import { proxy } from 'kodo/constants/apis'

// TODO：通过自定义 client._send 支持接口自定义 errorMassage
const errorsOfSetPrivate = {
  631: '指定的空间不存在'
}

@autobind
@injectable()
export class AccessApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  setPrivate(bucketName: string, privateType: PrivateType) {
    const params = {
      bucket: bucketName,
      private: privateType
    }

    return this.kodoProxyClient.post(
      formatURL(proxy.setBucketPrivate, params)
    ).catch(error => {
      if (error instanceof KodoProxyApiException) {
        throw error.withMessage(errorsOfSetPrivate[error.code])
      }
      throw error
    })

  }
}
