import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import autobind from 'autobind-decorator'

import AppConfigStore from 'store/interactMarketing/appConfig'
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
  @observable.ref buckets: string[] = []
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

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('buckets')
  async fetchBucketList() {
    const data = await this.apis.getKodoBucketList({
      page_num: 1,
      page_size: this.bucketSize
    })

    const buckets = data?.list.map(v => v.name)

    this.updateBuckets(buckets || [])

    if (this.buckets.length < 1) {
      // 如果获取到的列表为空，将当前的选中的值设为默认值
      this.appConfigStore.updateConfig({ bucket: '' })
    } else if (
      !this.buckets.includes(this.appConfigStore.config.bucket || '')
    ) {
      // 如果当前选中值不在获取的列表内，设为列表第一项
      this.appConfigStore.updateConfig({ bucket: this.buckets[0] })
    }

    return data
  }

  /**
   * 加载更多buckets
   */
  @autobind
  @ToasterStore.handle()
  @Loadings.handle('buckets')
  async loadingMore() {
    this.updateBucketSize(this.bucketSize + 3)
    await this.fetchBucketList()
  }

  init() {
    this.fetchBucketList()
  }
}
