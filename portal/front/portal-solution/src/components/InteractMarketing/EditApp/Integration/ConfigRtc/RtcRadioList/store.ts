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

  @observable size = 3
  @action.bound updateSize(value: number) {
    this.size = value
  }

  @autobind
  async loadMore() {
    this.updateSize(this.size + 6)
  }

  @computed get rtcAppsForShow() {
    return this.rtcApps.slice(0, this.size)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('rtc')
  async fetchRtcAppList() {
    const data = await this.apis.getRtcAppList({
      page_num: 1,
      page_size: 1000
    })
    const rtcApps = data?.list.map(v => v.name) ?? []
    const rtcApp = this.appConfigStore.config.RTCApp
    const [newRtcApp, newRtcApps] = calcConfigValue(rtcApp, rtcApps)
    this.appConfigStore.updateConfig({ RTCApp: newRtcApp })
    this.updateRtcAppList(newRtcApps)
  }

  init(): void | Promise<void> {
    this.fetchRtcAppList()
  }
}
