import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'

import { Loadings } from 'portal-base/common/loading'

import autobind from 'autobind-decorator'

import { InteractMarketingApis } from 'apis/interactMarketing'
import AppConfigStore, {
  calcConfigValue
} from 'store/interactMarketing/appConfig'

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
  async loadMoreHub() {
    this.updateHubSize(this.hubSize + 6)
  }

  @computed get hubsForShow() {
    return this.hubs.slice(0, this.hubSize)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('hubs')
  async fetchHubs() {
    const data = await this.apis.getPiliHubList({
      page_num: 1,
      page_size: 1000
    })

    const hubs = data?.list.map(v => v.name) ?? []
    const hub = this.appConfigStore.config.hub
    const [newHub, newHus] = calcConfigValue(hub, hubs)
    this.appConfigStore.updateConfig({ hub: newHub })
    this.updateHubs(newHus)
  }

  init() {
    this.fetchHubs()
  }
}
