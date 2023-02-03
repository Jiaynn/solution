/**
 * @file config store
 * @author yinxulai <yinxulai@qiniu.com>
 */

import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import autobind from 'autobind-decorator'
import { observable, computed, action, makeObservable } from 'mobx'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { IUserInfo } from 'portal-base/user/account'

import { basenameMap } from 'portal-base/common/router'

import { keysOf, valuesOfEnum } from 'kodo/utils/ts'

import { isDev } from 'kodo/utils/dev'

import { StorageType } from 'kodo/constants/statistics'
import { RegionSymbol } from 'kodo/constants/region'
import { App } from 'kodo/constants/app'

import { UserInfoApisWithCache } from 'kodo/apis/user-info'
import { ConfigApis, IBaseConfigResponse, IConfigResponse } from 'kodo/apis/config'

import * as types from './types'
import { normalize, normalizeConfigResponse, normalizeEnable } from './utils'
import { combinedBaseConfig, combinedConfig } from './schema'

const notMatchedAppMessage = '找不到该页面或无匹配的应用配置！'

export enum Loading {
  Fetch = 'fetch'
}

interface IGetOptions {
  product?: App.Fog | App.Kodo
}

interface IGetRegionOptions extends IGetOptions {
  region: RegionSymbol
}

interface IGetAllRegionOptions extends IGetOptions {
  allRegion: true
}

function isGetAllRegionOptions(
  target: IGetRegionOptions | IGetOptions | IGetAllRegionOptions
): target is IGetAllRegionOptions {
  return target && (target as IGetAllRegionOptions).allRegion
}

const printCurrentApp = (() => {
  let app: App | null = null
  return (newApp: App) => {
    if (newApp === app) return
    // eslint-disable-next-line no-console
    console.info(`current APP：${newApp}`)
    app = newApp
  }
})()

const oncePrint = (() => {
  let message: string | null = null
  return (newMessage: string) => {
    if (message === newMessage) return
    // eslint-disable-next-line no-console
    console.warn(newMessage)
    message = newMessage
  }
})()

@injectable()
export class ConfigStore extends Store {
  constructor(
    private userInfoApis: UserInfoApisWithCache,
    private configApis: ConfigApis,
    private toasterStore: Toaster
  ) {
    super()
    makeObservable(this)
    Toaster.bindTo(this, this.toasterStore)
  }

  // 当前是否为海外用户
  @observable.ref private overseasUser = false

  // 完整的配置是否已经加载到位
  @observable.ref public isFullLoaded = false

  /**
   * 当前产品 Kodo or Fog
   */
  @observable.ref public product!: App.Kodo | App.Fog

  /**
   * 产品与 URL Map
   */
  private appUrlMap = observable.map<string, App>({}, { deep: false })

  /**
   * 产品与产品配置 Map
   */
  private appConfigMap = observable.map<App, types.IKodoFogConfig | types.IPlatformConfig>({}, { deep: false })

  /**
   * 产品与产品基本配置 Map
   */
  private appBaseConfigMap = observable
    .map<App, types.IKodoFogBaseConfig | types.IPlatformBaseConfig>({}, { deep: false })

  private loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  rawConfig: IBaseConfigResponse | IConfigResponse | null = null
  normalizedConfig: IBaseConfigResponse | IConfigResponse | null = null

  @computed
  get isLoading(): boolean {
    return !this.loadings.isAllFinished()
  }

  @computed
  get rootPath(): string {
    const config = this.appBaseConfigMap.get(this.product)
    return (config && config.site.rootPath) || ''
  }

  @computed
  get routerBasenameMap(): Record<App, string> {
    // const currentApp = this.matchApp()
    // if (currentApp == null) return {} as Record<App, string>
    //
    // const currentAppBaseConfig = this.appBaseConfigMap.get(currentApp)!
    //
    // const basenameMap: Record<string, string> = process.env.ROUTE_BASE_NAME_MAP !== 'built-in'
    //   ? ({ ...process.env.ROUTE_BASE_NAME_MAP })
    //   : {}
    //
    // if (this.appBaseConfigMap.size > 0) {
    //   this.appBaseConfigMap.forEach((config, app) => {
    //     // 如果非当前 APP，又出现 rootPath 相同，一定是域名不同，对于真·跨站无需设置 basenameMap
    //     if (app !== currentApp && currentAppBaseConfig.site.rootPath === config.site.rootPath) {
    //       return
    //     }
    //
    //     const appName = appNameMap[app]
    //     basenameMap[appName] = config.site.rootPath
    //   })
    // }

    return basenameMap
  }

  @autobind
  isApp(app: App): boolean {
    const matchedApp = this.matchApp()
    return app === matchedApp
  }

  @autobind
  hasApp(app: App): boolean {
    return this.appBaseConfigMap.has(app)
  }

  @autobind matchApp(): App | null {
    const currentUrl = window.location.host + window.location.pathname

    const storedList = Array.from(this.appUrlMap.entries())
      .filter(([_, app]) => this.appBaseConfigMap.get(app))
      .sort(([url], [url2]) => url2.length - url.length)

    for (const [url, app] of storedList) {
      if (currentUrl.startsWith(url)) {
        return app
      }
    }

    console.log('log storedList', storedList)
    console.log('log this.appUrlMap', this.appUrlMap)
    console.log('log this.this.appBaseConfigMap', this.appBaseConfigMap)

    if (isDev) {
      // 先做一下安全检查，有没有出现跨域名的配置
      const urls = storedList.map(item => item[0])
      const hosts = new Set(urls.map(url => url.split('/')[0]))
      // eslint-disable-next-line no-console
      if (hosts.size > 1) oncePrint('存在多个 host 定义，本机的调试时可能无法准确命中 APP。')

      // 再去把 host 换成本地的匹配试试
      for (const [url, app] of storedList) {
        const devUrl = url.replace(/[^/]*/, window.location.host)
        if (currentUrl.indexOf(devUrl) === 0) {
          printCurrentApp(app)
          return app
        }
      }
    }

    return null
  }

  // 完整配置
  // 登录后获取到的配置
  // 默认 product 为当前的 product
  getFull(): types.IKodoFogConfig
  getFull(app: App.Platform): types.IPlatformConfig
  getFull(app: App.Fog | App.Kodo): types.IKodoFogConfig
  /**
   * 获取完整的配置信息
   * @param [app] 默认 product 为当前的 product
   */
  @autobind
  getFull(app: App = this.product): types.IPlatformConfig | types.IKodoFogConfig {
    if (app == null || !this.appConfigMap.has(app)) {
      throw new Error(notMatchedAppMessage)
    }

    return this.appConfigMap.get(app)!
  }

  getBase(): types.IKodoFogBaseConfig
  getBase(app: App.Platform): types.IPlatformBaseConfig
  getBase(app: App.Fog | App.Kodo): types.IKodoFogBaseConfig
  getBase(app: App): types.IPlatformBaseConfig | types.IKodoFogBaseConfig
  /**
   * 基础配置
   * @param app
   */
  @autobind
  getBase(app: App = this.product): types.IPlatformBaseConfig | types.IKodoFogBaseConfig {
    if (app == null || !this.appBaseConfigMap.has(app)) {
      throw new Error(notMatchedAppMessage)
    }

    return this.appBaseConfigMap.get(app)!
  }

  getRegion(options: IGetAllRegionOptions): types.IRegion[]
  getRegion(options: IGetRegionOptions): types.IRegion
  /**
   * 获取 kodo 或者 fog 的 region 配置
   * @param options
   */
  @autobind
  getRegion(options: IGetAllRegionOptions | IGetRegionOptions): types.IRegion[] | types.IRegion {
    const { product = this.product } = options

    const globalConfig = this.getFull(product)
    if (isGetAllRegionOptions(options)) {
      const regions = globalConfig.regions

      // 海外用户只能看到海外的空间
      if (this.overseasUser) return regions.filter(region => region.overseas)

      return regions
    }

    // isGetRegionOptions(options)
    return globalConfig.regions.find(item => item.symbol === options.region)!
  }

  /**
   * 获取当前产品全局配置中受支持的存储类型
   */
  @computed
  get supportedStorageTypes(): StorageType[] {
    const supportedStorageTypes: StorageType[] = [StorageType.Standard]

    const globalConfig = this.getFull()

    if (globalConfig.objectStorage.storageType.lowFrequency.enable) {
      supportedStorageTypes.push(StorageType.LowFrequency)
    }

    if (globalConfig.objectStorage.storageType.archive.enable) {
      supportedStorageTypes.push(StorageType.Archive)
    }

    if (globalConfig.objectStorage.storageType.deepArchive.enable) {
      supportedStorageTypes.push(StorageType.DeepArchive)
    }

    return supportedStorageTypes
  }

  @action.bound
  private updateProduct() {
    const app = this.matchApp()
    if (app === App.Fog || app === App.Kodo) {
      this.product = app
    }
  }

  @action.bound
  private updateAppUrlMap(app: keyof IBaseConfigResponse, urls: string[]) {
    for (const url of urls) {
      this.appUrlMap.set(url, app)
    }
  }

  @action.bound
  private updateBaseConfig(response: IBaseConfigResponse) {
    this.rawConfig = response
    this.appBaseConfigMap.clear()
    const normalizedConfig = normalizeEnable(normalize(combinedBaseConfig, response))
    keysOf(normalizedConfig).forEach(key => {
      if (response[key] == null) {
        // 把没配置的产品 normalize 后的结构删干净
        // 其实也可以延迟去做 normalize
        delete normalizedConfig[key]
        return
      }

      this.appBaseConfigMap.set(key, normalizedConfig[key])
      this.updateAppUrlMap(key, normalizedConfig[key].productUrl)
    })

    this.normalizedConfig = normalizedConfig
  }

  @autobind
  @Loadings.handle(Loading.Fetch)
  private async fetchBaseConfig(): Promise<void> {
    const response = await this.configApis.getBaseConfig()
    this.updateBaseConfig(response)
  }

  @action.bound
  updateFullConfig(response: IConfigResponse) {
    this.rawConfig = response
    this.appConfigMap.clear()
    this.appBaseConfigMap.clear()
    const normalizedResponse = normalizeConfigResponse(response)
    const normalizedConfig = normalizeEnable(normalize(combinedConfig, normalizedResponse))

    keysOf(normalizedConfig).forEach(key => {
      if (response[key] == null) {
        // 把没配置的产品 normalize 后的结构删干净
        // 其实也可以延迟去做 normalize
        delete normalizedConfig[key]
        return
      }

      this.appConfigMap.set(key, normalizedConfig[key])
      this.appBaseConfigMap.set(key, normalizedConfig[key])
      this.updateAppUrlMap(key, normalizedConfig[key].productUrl)
    })

    this.isFullLoaded = true
    this.normalizedConfig = normalizedConfig
  }

  @autobind
  @Loadings.handle(Loading.Fetch)
  private async fetchFullConfig(): Promise<void> {
    const response = await this.configApis.getConfig()
    this.updateFullConfig(response)
  }

  @action
  private updateOverseasUser(userInfo: IUserInfo) {
    if (
      userInfo.is_overseas_user === true
      || userInfo.is_overseas_std_user === true
    ) {
      this.overseasUser = true
      return
    }

    this.overseasUser = false
  }

  async isSignedIn() {
    return this.userInfoApis.get().then(result => {
      // 在请求成功时缓存请求结果，并允许对该结果进行 1 次复用
      this.userInfoApis.setCache(result)
      this.updateOverseasUser(result)
      return true
    }).catch(() => false)
  }

  async init() {
    const isSignedIn = await this.isSignedIn()

    if (isSignedIn) {
      await this.fetchFullConfig()
    } else {
      await this.fetchBaseConfig()
    }

    this.updateProduct()
  }
}
