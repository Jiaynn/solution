import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import Store from 'qn-fe-core/store'

import { injectable } from 'qn-fe-core/di'

import autobind from 'autobind-decorator'

import { ToasterStore } from 'portal-base/common/toaster'

import {
  AppComponentList,
  AppCreateOptions,
  AppInfo,
  AppParam,
  PiliDomain,
  RtcAppListQuery,
  SelectableId
} from 'apis/_types/interfactMarketingType'
import { InteractMarketingApis } from 'apis/interactMarketing'

export function infoToConfig(info: AppInfo): AppCreateOptions {
  const result = {
    appName: info.appName,
    appDesc: info.appDesc,
    appScenarios: info.appScenarios,
    integrationWay: info.integrationWay,
    component: info.components.map(c => c.componentId),
    hub: info.hub,
    publishRtmp: info.piliDomain.publishRtmp,
    liveRtmp: info.piliDomain.liveRtmp,
    liveHls: info.piliDomain.liveHls,
    liveHdl: info.piliDomain.liveHdl,
    RTCApp: info.RTCApp,
    IMServer: info.IMServer
  }

  if (info.kodo) {
    Object.assign(result, {
      bucket: info.kodo.bucket,
      addr: info.kodo.addr,
      callback: info.kodo.callback
    })
  }
  return result
}

/**
 * 计算默认组件的id
 * @param appParam
 * @returns
 */
export function calcDefaultComponets(appParam: AppComponentList[]): string[] {
  const result: string[] = []
  appParam.forEach(group => {
    group.items.forEach(componet => {
      if (componet.default === SelectableId.No) {
        result.push(componet.componentId)
      }
    })
  })
  return result
}

/**
 * 是否选择了某个类型的组件
 * @param type 组件类型
 * @param compIds 已选组件的id
 * @param target 查询目标
 * @returns
 */

export function isInCompType(
  type: string,
  compIds: string[],
  target: AppParam
) {
  return compIds.some(id => target.some(group => group.items.some(c => c.componentId === id && c.type === type)))
}

@injectable()
export default class AppConfigStore extends Store {
  constructor(
    private apis: InteractMarketingApis,
    private toasterStore: ToasterStore
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }

  // ********** 应用配置 **********
  /**
   * 应用配置
   */
  @observable.deep config: AppCreateOptions = {
    appName: '',
    appDesc: '',
    appScenarios: 0,
    integrationWay: 0,
    component: [],
    hub: '',
    publishRtmp: '',
    liveRtmp: '',
    liveHls: '',
    liveHdl: '',
    RTCApp: '',
    IMServer: ''
  }

  /**
   * 更新config
   * @param config
   */
  @action.bound
  updateConfig(config: Partial<AppCreateOptions>) {
    Object.assign(this.config, config)
  }

  /**
   * 检查名字是否合法
   */
  @computed
  get isAppNameLegal() {
    const appNameReg = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/
    return appNameReg.test(this.config.appName)
  }

  /**
   * 是否选择了某个类型的组件
   * @param type
   * @returns
   */
  isSelectedCompType(type: string) {
    return isInCompType(type, this.config.component, this.appParam)
  }

  /**
   * 是否选择安全组件
   */
  @computed
  get isSelectedSafeComp() {
    return this.isSelectedCompType('安全组件')
  }

  @action.bound
  selectDefaultComp() {
    this.config.component = calcDefaultComponets(this.appParam)
  }

  /**
   * 创建应用时config应该恢复默认值
   */
  @action.bound
  resetConfig() {
    this.config = {
      appName: '',
      appDesc: '',
      appScenarios: 0,
      integrationWay: 0,
      component: [],
      hub: '',
      publishRtmp: '',
      liveRtmp: '',
      liveHls: '',
      liveHdl: '',
      RTCApp: '',
      IMServer: ''
    }
    this.hubSize = 3
  }

  /**
   * 如果没有选择安全组件，在创建/更新应用时这些都不应该存在
   */
  @action.bound
  removeKodoConfig() {
    delete this.config.bucket
    delete this.config.addr
    delete this.config.callback
  }

  /**
   * 更新应用时根据appId获取的应用信息设置config
   * @param appId
   */
  @autobind
  @ToasterStore.handle()
  async fetchConfigByAppId(appId: string) {
    const info = await this.apis.getAppInfo({ appId })
    if (info) {
      runInAction(() => {
        this.updateConfig(infoToConfig(info))
      })
    }
  }

  @autobind
  @ToasterStore.handle()
  async createApp() {
    if (!this.isSelectedSafeComp) {
      this.removeKodoConfig()
    }
    const appId = await this.apis.createApp(this.config)
    return appId
  }

  @autobind
  @ToasterStore.handle()
  async updateApp(appId: string) {
    if (!this.isSelectedSafeComp) {
      this.removeKodoConfig()
    }
    await this.apis.updateApp({ appId, ...this.config })
  }

  // ********** 选项 **********
  //   ********** 组件 **********
  /**
   * 应用组件
   */
  @observable.deep
  appParam: AppComponentList[] = []

  @action.bound
  updateAppParam(appParam: AppComponentList[]) {
    this.appParam = appParam
  }

  @autobind
  @ToasterStore.handle()
  async fetchAppParam() {
    const appParam = await this.apis.getAppParam()
    if (appParam) {
      this.updateAppParam(appParam)
      // TODO: 设为默认组件
      // this.updateConfig({
      //   component: calcDefaultComponets(appParam)
      // })
    }
    return appParam
  }

  // ********** pili hub **********
  // TODO: 放到local store
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
  async fecthPiliHubList() {
    const data = await this.apis.getPiliHubList({
      page_num: 1,
      page_size: this.hubSize
    })
    const hubs = data?.list.map(v => v.name)

    this.updateHubs(hubs || [])

    if (!this.hubs.length) {
      this.updateConfig({ hub: '' })
    } else if (!this.hubs.includes(this.config.hub)) {
      this.updateConfig({ hub: this.hubs[0] })
    }
  }

  /**
   * pili 域名
   */
  @observable hubDomains: PiliDomain[] = []

  @computed get publishRtmp() {
    return this.hubDomains
      .filter(d => d.type === 'publishRtmp')
      .map(v => v.domain)
  }

  @computed get liveRtmp() {
    return this.hubDomains.filter(d => d.type === 'liveRtmp').map(v => v.domain)
  }

  @computed get liveHls() {
    return this.hubDomains.filter(d => d.type === 'liveHls').map(v => v.domain)
  }

  @computed get liveHdl() {
    return this.hubDomains.filter(d => d.type === 'liveHdl').map(v => v.domain)
  }

  @action.bound
  updateHubDomainsResult(result: PiliDomain[]) {
    this.hubDomains = result
  }

  @autobind
  @ToasterStore.handle()
  async fecthPiliDomain() {
    if (this.config.hub !== '') {
      const data = await this.apis.getPiliDomain(this.config.hub)

      this.updateHubDomainsResult(data?.domains || [])

      const firstPublishRtmp = this.publishRtmp[0]
      const firstLiveRtmp = this.liveRtmp[0]
      const firstLiveHls = this.liveHls[0]
      const firstLiveHdl = this.liveHdl[0]

      this.updateConfig({
        publishRtmp: firstPublishRtmp || '',
        liveRtmp: firstLiveRtmp || '',
        liveHls: firstLiveHls || '',
        liveHdl: firstLiveHdl || ''
      })
    }
  }

  // ********** rtc **********
  // TODO: 放到local store
  @observable.ref rtcApps: string[] = []
  @observable.ref imServer: string[] = []
  @observable rtcSize = 3
  @action.bound
  updateRtcSize(value: number) {
    this.rtcSize = value
  }
  @action.bound
  updateRtcAppList(list: string[]) {
    this.rtcApps = list
  }
  @action.bound
  updateImServer(list: string[]) {
    this.imServer = list
  }

  @autobind
  @ToasterStore.handle()
  async fetchRtcAppList(query: RtcAppListQuery) {
    const data = await this.apis.getRtcAppList(query)
    const rtcApps = data?.list.map(v => v.name)

    this.updateRtcAppList(rtcApps || [])

    if (!this.rtcApps.length) {
      this.updateConfig({ RTCApp: '' })
    } else if (!this.rtcApps.includes(this.config.RTCApp)) {
      this.updateConfig({ RTCApp: this.rtcApps[0] })
    }
  }

  @autobind
  @ToasterStore.handle()
  async fetchIMServer() {
    if (this.config.RTCApp !== '') {
      const imAppId = await this.apis.getImAppId(this.config.RTCApp)
      this.updateImServer(imAppId ? [imAppId] : [])

      if (!imAppId) {
        this.updateConfig({ IMServer: '' })
      } else if (imAppId !== this.config.IMServer) {
        this.updateConfig({ IMServer: imAppId })
      }
    }
  }

  // ********** kodo **********

  /**
   * 初始化请求
   */
  @autobind
  @ToasterStore.handle()
  async fetchAllOptions() {
    await this.fetchAppParam()
    await this.fecthPiliHubList()
    await this.fecthPiliDomain()
    await this.fetchRtcAppList({ page_num: 1, page_size: 3 })
    await this.fetchIMServer()
  }

  init(): void | Promise<void> {
    this.fetchAllOptions()
  }
}
