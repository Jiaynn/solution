import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import autobind from 'autobind-decorator'

import AppConfigStore, {
  calcConfigValue
} from 'store/interactMarketing/appConfig'
import { InteractMarketingApis } from 'apis/interactMarketing'

@injectable()
export default class BucketRadioList extends Store {
  constructor(
    private appConfigStore: AppConfigStore,
    private apis: InteractMarketingApis,
    private toasterStore: ToasterStore
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, 'buckets')
  @computed get loadingBuckets() {
    return this.loadings.isLoading('buckets')
  }

  /** 存储空间 */
  @observable buckets: string[] = []
  @action.bound updateBuckets(list: string[]) {
    this.buckets = list
  }

  /**
   * bucket加载数量
   */
  @observable bucketSize = 3
  @action.bound updateBucketSize(value: number) {
    this.bucketSize = value
  }

  /**
   * 加载更多buckets
   */
  @autobind
  loadingMore() {
    this.updateBucketSize(this.bucketSize + 6)
  }

  @computed get bucketsForShow() {
    return this.buckets.slice(0, this.bucketSize)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('buckets')
  async fetchBucketList() {
    const data = await this.apis.getKodoBucketList({
      page_num: 1,
      page_size: 1000
    })

    const bucket = this.appConfigStore.config.bucket
    const buckets = data?.list.map(v => v.name) ?? []
    const [newBucket, newBuckets] = calcConfigValue(bucket ?? '', buckets)
    this.appConfigStore.updateConfig({ bucket: newBucket })
    this.updateBuckets(newBuckets ?? [])
    return data
  }

  init() {
    this.fetchBucketList()
  }
}
