import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'

import autobind from 'autobind-decorator'

import { Loadings } from 'portal-base/common/loading'

import { RouterStore } from 'portal-base/common/router'

import { AppInfo, AppPackStatusId } from 'apis/_types/interactMarketingType'
import { InteractMarketingApis } from 'apis/interactMarketing'

@injectable()
export default class AppInfoStore extends Store {
  constructor(
    private apis: InteractMarketingApis,
    private routerStore: RouterStore,
    private toasterStore: ToasterStore
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }
  loadings = Loadings.collectFrom(this, 'info')
  @computed get loading() {
    return this.loadings.isLoading('info')
  }

  @computed get appId() {
    return this.routerStore.query.appId as string
  }
  /** 应用详情 */
  @observable.deep info: AppInfo = {
    appId: '',
    appName: '',
    appDesc: '',
    appScenarios: 0,
    appScenariosVo: '',
    integrationWay: 0,
    integrationWayVo: '',
    packStatus: 0,
    urls: {
      android_url: '',
      ios_url: '',
      server_url: '',
      server_fixed_url: ''
    },
    components: [],
    hub: '',
    piliDomain: {
      publishRtmp: '',
      liveRtmp: '',
      liveHls: '',
      liveHdl: ''
    },
    RTCApp: '',
    IMServer: '',
    kodo: {
      bucket: '',
      callback: '',
      addr: ''
    },
    createTime: 0
  }
  @action.bound updateInfo(info: AppInfo) {
    this.info = info
  }
  @computed get downloadable() {
    return this.info.packStatus === AppPackStatusId.PackCompleted
  }

  @observable empty = true
  @action.bound updateEmpty(value: boolean) {
    this.empty = value
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('info')
  async fetchAppInfo() {
    this.updateEmpty(true)
    const appInfo = await this.apis.getAppInfo({ appId: this.appId })
    if (appInfo) {
      this.updateInfo(appInfo)
      this.updateEmpty(false)
    }
  }

  init() {
    this.fetchAppInfo()
  }
}
