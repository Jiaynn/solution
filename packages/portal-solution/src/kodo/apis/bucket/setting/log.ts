/**
 * @file bucket log api
 * @description bucket 日志设置
 * @author yinxulai <me@yinxulai.com>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'
import { KodoProxyApiException, KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'

// TODO：通过自定义 client._send 支持接口自定义 errorMassage
const logErrors = {
  404: '空间不存在'
}

export interface IBucketLogStatus {
  issave: boolean
  format: string
  savebucket: string
  compress: string
  blocksize: number
}

@autobind
@injectable()
export class LogApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  setLog(bucket: string, savebucket: string) {
    return this.kodoProxyClient.post(formatURL(proxy.setLog, { bucket, savebucket }), {})
      .catch((e: unknown) => {
        if (e instanceof KodoProxyApiException) {
          throw e.withMessage(logErrors[e.code])
        }

        throw e
      })
  }

  setDisable(bucket: string) {
    return this.kodoProxyClient.post(formatURL(proxy.setLogDisable, { bucket }), {})
      .catch((e: unknown) => {
        if (e instanceof KodoProxyApiException) {
          throw e.withMessage(logErrors[e.code])
        }

        throw e
      })
  }

  getLog(bucket: string): Promise<IBucketLogStatus> {
    return this.kodoProxyClient.post<IBucketLogStatus>(formatURL(proxy.getLog, { bucket }), {})
      .catch((e: unknown) => {
        if (e instanceof KodoProxyApiException) {
          throw e.withMessage(logErrors[e.code])
        }

        throw e
      })
  }
}
