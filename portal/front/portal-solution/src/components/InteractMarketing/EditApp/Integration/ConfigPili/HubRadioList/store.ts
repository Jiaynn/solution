import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'

import { Loadings } from 'portal-base/common/loading'

import autobind from 'autobind-decorator'

import { InteractMarketingApis } from 'apis/interactMarketing'
import AppConfigStore from 'store/interactMarketing/appConfig'

@injectable()
export default class HubRadioListStore extends Store {
  constructor(
    private toasterStore: ToasterStore,
    private apis: InteractMarketingApis,
    private appConfigStore: AppConfigStore
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, 'hubs')
  @computed get loadingHubs() {
    return this.loadings.isLoading('hubs')
  }

  @observable hubs: string[] = []
  @action.bound updateHubs(value: string[]) {
    this.hubs = value
  }

  @observable hubSize = 3
  @action.bound updateHubSize(value: number) {
    this.hubSize = value
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('hubs')
  async fetchHubs() {
    const data = await this.apis.getPiliHubList({
      page_num: 1,
      page_size: this.hubSize
    })
    if (data) {
      this.updateHubs(data.list.map(v => v.name))
      if (this.hubs.length < 1) {
        this.appConfigStore.updateConfig({ hub: '' })
      } else if (!this.hubs.includes(this.appConfigStore.config.hub)) {
        this.appConfigStore.updateConfig({ hub: this.hubs[0] })
      }
    }
  }

  @autobind
  async loadMoreHub() {
    this.updateHubSize(this.hubSize + 3)
    await this.fetchHubs()
  }

  init() {
    this.fetchHubs()
  }
}
