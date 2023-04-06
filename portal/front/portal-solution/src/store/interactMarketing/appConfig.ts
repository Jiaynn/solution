import { action, computed, makeObservable, observable } from 'mobx'
import Store from 'qn-fe-core/store'

import { injectable } from 'qn-fe-core/di'

import autobind from 'autobind-decorator'

import { ToasterStore } from 'portal-base/common/toaster'

import {
  AppComponentList,
  AppCreateOptions,
  AppInfo,
  AppParam,
  SelectableId
} from 'apis/_types/interactMarketingType'
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
 *
 * 当通过网络请求获取选项列表时，更新对应配置的逻辑
 * @param cur 当前配置的值
 * @param options 选项列表
 * @returns
 */
export function calcConfigValue(
  cur: string,
  options: string[]
): [string, string[]] {
  const innerOptions = [...options]

  // 如果获取的列表为空，当前配置应为''
  if (innerOptions.length < 1) {
    return ['', innerOptions]
  }

  // 当前配置不在列表内，配置应为列表的第一项
  if (!innerOptions.includes(cur)) {
    return [innerOptions[0], innerOptions]
  }

  // 当前配置存在于列表内，不更新配置, 并且配置的位置移动到列表的首位
  const curIndex = innerOptions.findIndex(el => el === cur)
  innerOptions.splice(curIndex, 1)
  innerOptions.unshift(cur)
  return [cur, innerOptions]
}

/**
 * 计算默认组件的id
 * @param appParam
 * @returns
 */
export function calcDefaultComponents(appParam: AppComponentList[]): string[] {
  const result: string[] = []
  appParam.forEach(group => {
    group.items.forEach(component => {
      if (component.default === SelectableId.No) {
        result.push(component.componentId)
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

  @computed get appName() {
    return this.config.appName
  }

  @computed get appDesc() {
    return this.config.appDesc
  }

  @computed get appScenarios() {
    return this.config.appScenarios
  }

  @computed get integrationWay() {
    return this.config.integrationWay
  }

  @computed get component() {
    return this.config.component
  }

  @computed get hub() {
    return this.config.hub
  }

  @computed get publishRtmp() {
    return this.config.publishRtmp
  }

  @computed get liveRtmp() {
    return this.config.liveRtmp
  }

  @computed get liveHls() {
    return this.config.liveHls
  }

  @computed get liveHdl() {
    return this.config.liveHdl
  }

  @computed get bucket() {
    return this.config.bucket
  }

  @computed get addr() {
    return this.config.addr
  }

  @computed get callback() {
    return this.config.callback
  }

  @action.bound updateAppName(value) {
    this.config.appName = value
  }

  @action.bound updateAppDesc(value) {
    this.config.appDesc = value
  }

  @action.bound updateAppScenarios(value) {
    this.config.appScenarios = value
  }

  @action.bound updateIntegrationWay(value) {
    this.config.integrationWay = value
  }

  @action.bound updateComponent(value) {
    this.config.component = value
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

  /**
   * 设为默认组件
   */
  @action.bound
  selectDefaultComp() {
    this.config.component = calcDefaultComponents(this.appParam)
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
      this.updateConfig(infoToConfig(info))
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
      // 选择默认组件, 不覆盖原来的配置
      const setForUpdate = new Set([
        ...calcDefaultComponents(appParam),
        ...this.component
      ])

      this.updateConfig({ component: [...setForUpdate] })
    }
    return appParam
  }

  init(): void | Promise<void> {}
}
