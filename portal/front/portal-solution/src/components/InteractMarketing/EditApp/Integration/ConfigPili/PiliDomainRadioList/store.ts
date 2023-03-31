import { action, computed, makeObservable, observable, reaction } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import autobind from 'autobind-decorator'

import { PiliDomain } from 'apis/_types/interactMarketingType'
import { InteractMarketingApis } from 'apis/interactMarketing'
import AppConfigStore from 'store/interactMarketing/appConfig'

@injectable()
export default class PiliDomainRadioList extends Store {
  constructor(
    private toasterStore: ToasterStore,
    private apis: InteractMarketingApis,
    private appConfigStore: AppConfigStore
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, 'piliDomain')
  @computed get loading() {
    return this.loadings.isLoading('piliDomain')
  }

  @observable piliDomain: PiliDomain[] = []

  @computed get loadingPiliDomain() {
    return this.loadings.isLoading('piliDomain')
  }

  @computed get publishRtmp() {
    return this.piliDomain
      .filter(d => d.type === 'publishRtmp')
      .map(v => v.domain)
  }

  @computed get liveRtmp() {
    return this.piliDomain.filter(d => d.type === 'liveRtmp').map(v => v.domain)
  }

  @computed get liveHls() {
    return this.piliDomain.filter(d => d.type === 'liveHls').map(v => v.domain)
  }

  @computed get liveHdl() {
    return this.piliDomain.filter(d => d.type === 'liveHdl').map(v => v.domain)
  }

  @action.bound updatePiliDomain(result: PiliDomain[]) {
    this.piliDomain = result
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('piliDomain')
  async fetchPiliDomain() {
    if (this.appConfigStore.config.hub === '') {
      return
    }

    const data = await this.apis.getPiliDomain(this.appConfigStore.config.hub)
    this.updatePiliDomain(data?.domains ?? [])

    if (this.publishRtmp.length < 1) {
      this.appConfigStore.updateConfig({
        publishRtmp: ''
      })
    }

    const firstPublishRtmp = this.publishRtmp[0]
    const firstLiveRtmp = this.liveRtmp[0]
    const firstLiveHls = this.liveHls[0]
    const firstLiveHdl = this.liveHdl[0]

    this.appConfigStore.updateConfig({
      publishRtmp: firstPublishRtmp ?? '',
      liveRtmp: firstLiveRtmp ?? '',
      liveHls: firstLiveHls ?? '',
      liveHdl: firstLiveHdl ?? ''
    })
  }

  init(): void | Promise<void> {
    this.addDisposer(
      reaction(
        () => this.appConfigStore.config.hub,
        () => {
          this.fetchPiliDomain()
        }
      )
    )
    this.fetchPiliDomain()
  }
}
