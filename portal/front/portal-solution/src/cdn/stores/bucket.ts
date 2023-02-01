/**
 * @file bucket info store
 * @author nighca <nighca@live.cn>
 */

import { observable, action, when } from 'mobx'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'
import { UserInfoStore } from 'portal-base/user/account'

// 由于 bucket 未接入 iam，因此暂时提供 /api/fusion 开头的接口用于获取 bucket 相关信息
// import { IBucketSimplified, getBucketsSimplified } from 'portal-base/kodo/apis/bucket'
import BucketApis, { IBucketSimplified } from 'cdn/apis/bucket'

enum LoadingType {
  FetchBuckets = 'fetchBuckets'
}

@injectable()
export default class BucketStore extends Store {

  loadings = Loadings.collectFrom(this, LoadingType)

  @observable bucketsFetched = false
  @observable.shallow buckets: IBucketSimplified[] = []
  simplifiedBucketMap = observable.map<string, IBucketSimplified>({}, { deep: false })

  constructor(
    private bucketApis: BucketApis,
    private userInfoStore: UserInfoStore
  ) {
    super()
  }

  @action setBuckets(buckets: IBucketSimplified[]) {
    this.buckets = buckets
    this.simplifiedBucketMap.replace(
      buckets.map(
        bucket => [bucket.name, bucket]
      )
    )
  }

  @action updateBucketsFetched() {
    this.bucketsFetched = true
  }

  @Loadings.handle(LoadingType.FetchBuckets)
  fetchBuckets(force = false) {
    if (!force && this.bucketsFetched) {
      return Promise.resolve()
    }

    return this.bucketApis.getBucketsSimplified().then(
      buckets => {
        this.setBuckets(buckets)
        this.updateBucketsFetched()
      }
    )
  }

  hasBucket(name: string) {
    return this.simplifiedBucketMap.has(name)
  }

  getBucket(name: string) {
    return this.simplifiedBucketMap.get(name)
  }

  isBucketPrivate(name: string): boolean {
    if (!name || !this.simplifiedBucketMap.has(name)) {
      return false
    }
    const bucket = this.simplifiedBucketMap.get(name)
    return bucket ? !!bucket.private : false
  }

  async init() {
    await when(() => this.userInfoStore.inited)

    if (!this.userInfoStore.isGuest) {
      return this.fetchBuckets()
    }
  }
}
