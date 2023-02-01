/**
 * @file apis of max age of bucket setting 文件缓存
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { injectable, lazyInject } from 'qn-fe-core/di'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { BucketStore } from 'kodo/stores/bucket'

import { proxy } from 'kodo/constants/apis'

@autobind
@injectable()
export class MaxAgeApis {
  constructor(
    private kodoProxyClient: KodoProxyClient,
    @lazyInject(() => BucketStore) private bucketStore: BucketStore
  ) { }

  // TODO: 这种情况下，应该提供这样的方法吗。。？
  getMaxAge(bucketName: string) {
    return this.bucketStore.fetchDetailsByName(bucketName).then(bucket => bucket.max_age)
  }

  setMaxAge(bucketName: string, maxAge: number) {
    const params = {
      bucket: bucketName,
      maxAge
    }
    return this.kodoProxyClient.post(formatURL(proxy.setBucketMaxAge, params), {})
  }
}
