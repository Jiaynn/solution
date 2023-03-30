import { action, computed, makeObservable, observable, when } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import autobind from 'autobind-decorator'

import { InteractMarketingApis } from 'apis/interactMarketing'
import AppConfigStore from 'store/interactMarketing/appConfig'

@injectable()
export default class AddrRadioListStore extends Store {
  constructor(
    private appConfigStore: AppConfigStore,
    private apis: InteractMarketingApis,
    private toasterStore: ToasterStore
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, 'addr')
  @computed get loadingAddr() {
    return this.loadings.isLoading('addr')
  }

  @observable bucketDomains: string[] = []
  @action.bound updateBucketDomains(value: string[]) {
    this.bucketDomains = value
  }

  @autobind
  async fetchAddr() {
    const data = await this.apis.getKodoDomain(
      this.appConfigStore.config.bucket || ''
    )

    this.updateBucketDomains(data || [])

    if (this.bucketDomains.length < 1) {
      // 如果获取到的列表为空，将当前的选中的值设为默认值
      this.appConfigStore.updateConfig({ addr: '' })
    } else if (
      !this.bucketDomains.includes(this.appConfigStore.config.addr || '')
    ) {
      // 如果当前选中值不在获取的列表内，设为列表第一项
      this.appConfigStore.updateConfig({ addr: this.bucketDomains[0] })
    }
  }

  init() {
    this.addDisposer(
      when(
        () => this.appConfigStore.config.bucket !== '',
        () => {
          this.fetchAddr()
        }
      )
    )

    this.fetchAddr()
  }
}
