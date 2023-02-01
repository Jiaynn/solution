/**
 * @file bucket default index api
 * @description bucket 设置默认首页
 * @author Surmon <i@surmon.me>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'

@autobind
@injectable()
export class DefaultIndexApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  updateDefaultIndexState(bucketName: string, noIndexPage: number) {
    const params = {
      bucket: bucketName,
      noIndexPage
    }
    return this.kodoProxyClient.post(formatURL(proxy.setBucketNoIndexPageState, params))
  }
}
