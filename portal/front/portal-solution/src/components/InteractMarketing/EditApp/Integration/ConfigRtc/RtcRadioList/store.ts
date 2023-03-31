import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import autobind from 'autobind-decorator'

import { InteractMarketingApis } from 'apis/interactMarketing'
import AppConfigStore from 'store/interactMarketing/appConfig'

@injectable()
export default class RtcRadioListStore extends Store {
  constructor(
    private toasterStore: ToasterStore,
    private apis: InteractMarketingApis,
    private appConfigStore: AppConfigStore
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, 'rtc')
  @computed get loadingRtc() {
    return this.loadings.isLoading('rtc')
  }

  @observable.ref rtcApps: string[] = []
  @action.bound updateRtcAppList(list: string[]) {
    this.rtcApps = list
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('rtc')
  async fetchRtcAppList() {
    const data = await this.apis.getRtcAppList({
      page_num: 1,
      page_size: this.size
    })
    const rtcApps = data?.list.map(v => v.name)
    this.updateRtcAppList(rtcApps ?? [])
    if (this.rtcApps.length < 1) {
      this.appConfigStore.updateConfig({ RTCApp: '' })
    } else if (!this.rtcApps.includes(this.appConfigStore.config.RTCApp)) {
      this.appConfigStore.updateConfig({ RTCApp: this.rtcApps[0] })
    }
  }

  @observable size = 3
  @action.bound updateSize(value: number) {
    this.size = value
  }

  @autobind
  async loadMore() {
    this.updateSize(this.size + 3)
    await this.fetchRtcAppList()
  }

  init(): void | Promise<void> {
    this.fetchRtcAppList() 
  }
}
