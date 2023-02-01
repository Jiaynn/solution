/**
 * @file domain store
 * @author yinxulai <me@yinxulai.cn>
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import autobind from 'autobind-decorator'
import { action, computed, observable, makeObservable } from 'mobx'
import { Loadings } from 'portal-base/common/loading'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import { valuesOfEnum } from 'kodo/utils/ts'
import { promiseAllSettled } from 'kodo/utils/promise-all-settled'

import { getCDNDomainBucketType, isDomainType } from 'kodo/transforms/domain'

import { CertStore } from 'kodo/stores/certificate'
import { ConfigStore } from 'kodo/stores/config'
import { BucketStore } from 'kodo/stores/bucket'

import { RegionSymbol } from 'kodo/constants/region'
import {
  CDNDomainBucketType, CDNDomainOperationType, CDNDomainStatus, CDNDomainType, DomainScope, DomainSourceType, DomainType
} from 'kodo/constants/domain'

import { DomainApis, DomainInfo, ICDNDomainInfo, IDefaultDomain, IS3Domain, Protocol } from 'kodo/apis/domain'

// store 的 loading 是指 store 内数据的可用状态
export enum Loading {
  SourceDomain = 'sourceDomain',
  CDNDomain = 'CDNDomain',
  S3Domain = 's3Domain',
  DefaultDomain = 'defaultDomain'
}

export interface ICDNDomain extends ICDNDomainInfo {
  domainBucketType: CDNDomainBucketType
}

export interface IDomainInfo {
  domain: string
  type: DomainSourceType
}

// TODO: store 的组织形式以 bucket 而不是 domain
@injectable()
export class DomainStore extends Store {
  constructor(
    private domainApis: DomainApis,
    private userInfoStore: UserInfo,
    private featureConfigStore: FeatureConfigStore,
    private configStore: ConfigStore,
    private bucketStore: BucketStore,
    private certStore: CertStore
  ) {
    super()
    makeObservable(this)
  }

  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  // 对象存储服务端配置的全部域名，包含 cdn、源站
  domainList = observable.array<DomainInfo>([], { deep: false })
  CDNDomainMap = observable.map<string, ICDNDomain>([], { deep: false })
  s3DomainMap = observable.map<string, IS3Domain>([], { deep: false })
  defaultDomainMap = observable.map<string, IDefaultDomain>([], { deep: false })

  @computed
  get sourceDomainMap() {
    return new Map<string, DomainInfo>(
      this.domainList
        .filter(domainInfo => isDomainType(domainInfo.domain_types, DomainType.Source))
        .map(domainInfo => [domainInfo.domain, domainInfo])
    )
  }

  @computed
  get isLoadingCDN() {
    return this.loadings.isLoading(Loading.CDNDomain)
  }

  @computed
  get isLoadingSource() {
    return this.loadings.isLoading(Loading.SourceDomain)
  }

  @computed
  get isLoadingS3() {
    return this.loadings.isLoading(Loading.S3Domain)
  }

  @computed
  get isLoadingDefault() {
    return this.loadings.isLoading(Loading.DefaultDomain)
  }

  @computed
  get isLoading() {
    return !this.loadings.isAllFinished()
      || this.certStore.isLoadingCertificateWithDomain
  }

  @computed
  get sourceDomainList() {
    return [...this.sourceDomainMap.keys()]
  }

  @computed
  // eslint-disable-next-line @typescript-eslint/naming-convention
  get CDNDomainList() {
    return [...this.CDNDomainMap.keys()]
  }

  @computed
  get sourceDomainListGroupByBucketName() {
    return this.sourceDomainList.reduce(
      (map, domain) => {
        const domainInfo = this.sourceDomainMap.get(domain)!
        const domainList = map.get(domainInfo.bucket)
        if (domainList) {
          domainList.push(domainInfo)
        } else {
          map.set(domainInfo.bucket, [domainInfo])
        }
        return map
      },
      new Map<string, DomainInfo[]>()
    )
  }

  @computed
  // eslint-disable-next-line @typescript-eslint/naming-convention
  get CDNDomainListGroupByBucketName() {
    return this.CDNDomainList.reduce(
      (map, domain) => {
        const domainInfo = this.CDNDomainMap.get(domain)!
        const domainList = map.get(domainInfo.sourceQiniuBucket)
        if (domainList) {
          domainList.push(domainInfo)
        } else {
          map.set(domainInfo.sourceQiniuBucket, [domainInfo])
        }
        return map
      },
      new Map<string, ICDNDomain[]>()
    )
  }

  @computed
  private get isCdnDomainAvailable() {
    const globalConfig = this.configStore.getFull()
    const fusionConfigEnable = globalConfig.fusion.domain.enable
    const fusionFeatureEnable = !this.featureConfigStore.isDisabled('KODO.KODO_DOMAIN_SETTING')
    return fusionConfigEnable && fusionFeatureEnable
  }

  @autobind
  private isSourceDomainAvailable(bucket: string) {
    const bucketInfo = this.bucketStore.getDetailsByName(bucket)!
    const regionConfig = this.configStore.getRegion({ region: bucketInfo.region })
    const sourceConfigEnable = regionConfig.objectStorage.domain.enable
    const sourceFeatureEnable = !this.featureConfigStore.isDisabled('KODO.KODO_SOURCE_DOMAIN')
    return sourceConfigEnable && sourceFeatureEnable
  }

  @autobind
  getCDNDomainProtocol(bucketName: string, domain: string): 'http' | 'https' | null {
    const domainItem = (this.CDNDomainListGroupByBucketName.get(bucketName) || []).find(data => data.name === domain)
    return domainItem ? domainItem.protocol : null
  }

  @autobind
  getDomainProtocol(bucketName: string, domainInfo: IDomainInfo): 'http' | 'https' | null {
    if (domainInfo.type === DomainSourceType.CDN) {
      return this.getCDNDomainProtocol(bucketName, domainInfo.domain)
    }

    return this.certStore.getProtocolByDomain(domainInfo.domain)
  }

  /**
   * @param  {string} bucketName
   * @returns IDomainInfo
   * @description 获取指定空间的可用域名，顺序为默认域名、CDN 自定义、源站、CDN 测试
   */
  @autobind
  getAvailableDomainInfoByBucketName(bucketName: string, sourceFirst = false): IDomainInfo | null {
    const defaultDomain = this.defaultDomainMap.get(bucketName)
    if (defaultDomain && defaultDomain.isAvailable) {
      return { domain: defaultDomain.domain, type: defaultDomain.domainType }
    }

    // 没有可用的默认域名，则依次检查 cdn 和源站有没有可用域名
    const availableCDNDomains = this.getCDNAvailableDomainListByBucketName(bucketName)

    // 可用的测试域名
    const availableTestCDNDomains = availableCDNDomains.filter(domain => (
      domain.type === CDNDomainType.Test
    ))

    // 用户的自己的测试域名
    const availableUserCDNDomains = availableCDNDomains.filter(domain => (
      domain.type !== CDNDomainType.Test
    ))

    // 可用的源站域名
    const availableSourceDomains = this.getSourceDomainListByBucketName(bucketName)

    // 参数指定源站优先的话，先检查源站
    if (sourceFirst) {
      if (availableSourceDomains.length > 0) {
        return { domain: availableSourceDomains[0].domain, type: DomainSourceType.Source }
      }
    }

    // 使用用户自定义 CDN 域名
    if (availableUserCDNDomains.length) {
      return { domain: availableCDNDomains[0].name, type: DomainSourceType.CDN }
    }

    // 其次使用用户的自定义源站域名
    if (availableSourceDomains.length > 0) {
      return { domain: availableSourceDomains[0].domain, type: DomainSourceType.Source }
    }

    // 最后使用 CDN 加速测试域名
    if (availableTestCDNDomains.length) {
      return { domain: availableTestCDNDomains[0].name, type: DomainSourceType.CDN }
    }

    return null
  }

  /**
   * @param  {string} bucketName
   * @param  {IDomainInfo} domainInfo
   * @returns string
   * @todo 和上面的 [getDomainProtocol] 存在类似职责，整合一下
   * @description 根据指定域名生成对应的 url，并根据不同的类型和证书信息添加协议头
   */
  @autobind
  private generateUrlWithProtocol(bucketName: string, domainInfo: IDomainInfo, forceProtocol?: Protocol): string {
    const { domain, type } = domainInfo

    if (forceProtocol != null) {
      return `${forceProtocol}://${domain}`
    }

    if (type === DomainSourceType.Source) {
      // 针对源站 s3 域名的处理（默认使用 https 协议）
      const s3Domain = this.s3DomainMap.get(bucketName)
      if (domain === (s3Domain && s3Domain.domain)) {
        return 'https://' + domain
      }

      // 源站通过检查证书来判断协议
      const protocol = this.certStore.getProtocolByDomain(domain)
      return `${protocol}://${domain}`
    }

    if (type === DomainSourceType.CDN) {
      const protocol = this.getCDNDomainProtocol(bucketName, domain)
      if (protocol) return `${protocol}://${domain}`
    }

    // 同时绑定了源站和 CDN
    if (type === DomainSourceType.CDNAndSource) {
      // 具体使用取决于域名当前解析生效的方式
    }

    // TODO: 这里协议可能会导致不可用
    return `http://${domain}`
  }

  /**
   * @todo 支持通过参数自定义协议
   * @description 获取空间的资源链接，默认顺序依次为默认域名、CDN 自定义、源站、CDN 加速、系统配置下载域名
   */
  @autobind
  getResourceBaseUrl(bucketName: string, domainInfo?: IDomainInfo, sourceFirst = false): string | undefined {
    let currentDomain = domainInfo

    // 用户未指定域名，使用默认域名
    if (currentDomain == null || this.bucketStore.isShared(bucketName)) {
      const defaultDomainInfo = this.defaultDomainMap.get(bucketName)
      if (defaultDomainInfo != null && defaultDomainInfo.isAvailable) {
        currentDomain = {
          domain: defaultDomainInfo.domain,
          type: defaultDomainInfo.domainType
        }

        return this.generateUrlWithProtocol(
          bucketName,
          currentDomain,
          defaultDomainInfo.protocol
        )
      }

      // 分享空间只允许使用默认域名，没获取到就返回 undefined
      if (this.bucketStore.isShared(bucketName)) {
        return undefined
      }
    }

    if (currentDomain == null) {
      // 上一步没有获取到可用域名则根据 CDN自定义、源站自定义、CDN测试 依次获取一个可用域名
      const availableDomainInfo = this.getAvailableDomainInfoByBucketName(bucketName, sourceFirst)
      if (availableDomainInfo != null) currentDomain = availableDomainInfo
    }

    // 如果成功获取到了域名或者用户指定了域名，则添加协议生成 URL 返回
    if (currentDomain != null) return this.generateUrlWithProtocol(bucketName, currentDomain)

    // 获取系统配置的下载域名（目前在非公有云环境下可能会开启）
    const bucketInfo = this.bucketStore.getDetailsByName(bucketName)
    if (bucketInfo == null) return undefined
    const regionConfig = this.configStore.getRegion({ region: bucketInfo.region })
    if (regionConfig.objectStorage.downloadUrls.length > 0) {
      return this.getSystemDownloadBaseUrl(bucketInfo.region, bucketName)
    }

    return undefined
  }

  @autobind
  getSourceDomainListByBucketName(bucketName: string) {
    const domainList = this.sourceDomainListGroupByBucketName.get(bucketName) || []

    const s3Domain = this.s3DomainMap.get(bucketName)
    if (this.bucketStore.isBlockChainPBucket(bucketName) && s3Domain) {
      const { domain } = s3Domain
      domainList.unshift({ domain, bucket: bucketName })
    }

    return domainList.filter(item => (!Array.isArray(item.freeze_types) || item.freeze_types.length === 0))
  }

  @autobind
  getCDNTestDomainListByBucketName(bucketName: string) {
    return (this.CDNDomainListGroupByBucketName.get(bucketName) || []).filter((domain: ICDNDomain) => (
      [CDNDomainBucketType.KodoBktTest, CDNDomainBucketType.KodoTest].includes(domain.domainBucketType)
    ))
  }

  @autobind
  getCDNAccelerateDomainListByBucketName(bucketName: string) {
    const list = this.CDNDomainListGroupByBucketName.get(bucketName) || []
    return list.filter((domain: ICDNDomain) => (
      ![CDNDomainBucketType.KodoBktTest, CDNDomainBucketType.KodoTest, CDNDomainBucketType.PiliTest]
        .includes(domain.domainBucketType)
    ))
  }

  @autobind
  getCDNAvailableDomainListByBucketName(bucketName: string) {
    return (this.CDNDomainListGroupByBucketName.get(bucketName) || []).filter((domain: ICDNDomain) => {
      // 如果在对象存储的服务端域名队列里找不到该域名，说明该域名不可用
      if (this.domainList && !this.domainList.find(item => item.domain === domain.name)) {
        return false
      }

      // 过滤掉泛域名或者操作状态是删除的域名
      if (
        domain.type === CDNDomainType.Wildcard
        || domain.operationType === CDNDomainOperationType.DeleteDomain
      ) {
        return false
      }

      // 如果操作是创建域名，则操作状态必须是 success
      // 如果操作不是创建域名，则操作状态不能是冻结或者下线
      if (domain.operationType === CDNDomainOperationType.CreateDomain) {
        return domain.operatingState === CDNDomainStatus.Success
      }

      return ![CDNDomainStatus.Frozen, CDNDomainStatus.Offlined].includes(domain.operatingState)
    })
  }

  @autobind
  getSourceHostByRegion(symbol: string, domainScope: DomainScope): string | null {
    const regionConfig = this.configStore.getRegion({ region: symbol })

    switch (domainScope) {
      case DomainScope.IO:
        if (regionConfig.objectStorage.domain.enable && !this.featureConfigStore.isDisabled('KODO.KODO_SOURCE_DOMAIN')) {
          return regionConfig.objectStorage.domain.sourceHosts[0]
        }
        return null
      case DomainScope.S3:
        if (regionConfig.objectStorage.domain.awsS3.enable && !this.featureConfigStore.isDisabled('KODO.KODO_SOURCE_DOMAIN')) {
          return regionConfig.objectStorage.domain.awsS3.sourceHosts[0] || null
        }
        return null
      default:
        return null
    }
  }

  @autobind
  getUpHostByRegion(region: string): string[] {
    const regionInfo = this.configStore.getRegion({ region })
    return regionInfo.objectStorage.uploadUrls
  }

  @autobind
  getSystemDownloadUrlByRegion(region: RegionSymbol) {
    const regionInfo = this.configStore.getRegion({ region })
    return regionInfo.objectStorage.downloadUrls[0]
  }

  @autobind
  getSystemDownloadBaseUrl(region: RegionSymbol, bucketName: string) {
    const downloadUrl = this.getSystemDownloadUrlByRegion(region)
    if (downloadUrl) return downloadUrl + `/getfile/${this.userInfoStore.uid}/${bucketName}`
  }

  @action.bound
  updateDomainList(data: DomainInfo | DomainInfo[]) {
    this.domainList.clear()

    if (!data) {
      return
    }

    if (!Array.isArray(data)) {
      this.domainList.push(data)
      return
    }

    this.domainList.push(...data)
  }

  @action.bound
  updateCDNDomainMap(data: ICDNDomainInfo[] | ICDNDomainInfo, force = false) {
    if (force) {
      this.CDNDomainMap.clear()
    }

    if (!data) {
      return
    }

    if (!Array.isArray(data)) {
      this.CDNDomainMap.set(data.name, {
        ...data,
        domainBucketType: getCDNDomainBucketType(data)
      })
      return
    }

    data.forEach(item => {
      this.CDNDomainMap.set(item.name, {
        ...item,
        domainBucketType: getCDNDomainBucketType(item)
      })
    })
  }

  @action.bound
  updateS3DomainMap(bucketName: string, domain: IS3Domain) {
    this.s3DomainMap.set(bucketName, domain)
  }

  @action.bound
  updateDefaultDomainMap(bucketName: string, domain: IDefaultDomain) {
    const isSourceDomainAvailable = this.isSourceDomainAvailable(bucketName)

    if (DomainSourceType.CDN === domain.domainType) {
      if (!this.isCdnDomainAvailable) {
        domain.isAvailable = false
      }
    }

    if (DomainSourceType.Source === domain.domainType) {
      if (!isSourceDomainAvailable) {
        domain.isAvailable = false
      }
    }

    if (DomainSourceType.CDNAndSource === domain.domainType) {
      if (!isSourceDomainAvailable && !this.isCdnDomainAvailable) {
        domain.isAvailable = false
      }
    }

    this.defaultDomainMap.set(bucketName, domain)
  }

  // 获取 Kodo 的所有域名记录
  @autobind
  @Loadings.handle(Loading.SourceDomain)
  async fetchKodoDomainListByBucketName(name: string) {
    // CDN 也依赖这个信息
    // 所以只要源站和 CDN 有任一开启就发送请求

    if (this.bucketStore.isShared(name)) return
    const isSourceDomainAvailable = this.isSourceDomainAvailable(name)
    if (!isSourceDomainAvailable && !this.isCdnDomainAvailable) return

    const result = await this.domainApis.getDomainsByBucketName(name)

    this.updateDomainList(result.filter(i => {
      if (!this.isCdnDomainAvailable && isDomainType(i.domain_types, DomainType.CDN)) return false
      if (!isSourceDomainAvailable && isDomainType(i.domain_types, DomainType.Source)) return false
      return true
    }))
  }

  // 获取 cdn 域名
  @autobind
  @Loadings.handle(Loading.CDNDomain)
  async fetchCDNDomainListByBucketName(name: string) {
    if (!this.isCdnDomainAvailable) return
    if (this.bucketStore.isShared(name)) return

    const domains = await this.domainApis.getCDNDomains({ sourceQiniuBucket: name })
    // TODO: 这里不应该默认强制 force 为 true
    this.updateCDNDomainMap(domains, true)
  }

  @autobind
  async fetchAllDomainsByBucketName(name: string) {
    await this.bucketStore.ensureDetailsLoaded(name)
    const isShared = this.bucketStore.isShared(name)

    const fetchList: Array<Promise<any>> = []
    fetchList.push(this.fetchKodoDomainListByBucketName(name))
    fetchList.push(this.fetchCDNDomainListByBucketName(name))
    fetchList.push(this.fetchDefaultDomainByBucketName(name))

    // 分享空间不用去拿 cdn 列表和证书，默认域名里会有协议
    if (!isShared) fetchList.push(this.certStore.fetchListWithDomain())

    return promiseAllSettled(fetchList)
  }

  @autobind
  @Loadings.handle(Loading.DefaultDomain)
  fetchDefaultDomainByBucketName(name: string) {
    const req = this.domainApis.getDefaultDomain(name)
    req.then(data => this.updateDefaultDomainMap(name, data), () => null)
    return req
  }

  @autobind
  @Loadings.handle(Loading.S3Domain)
  fetchS3DomainByBucketName(name: string) {
    const req = this.domainApis.getS3Domain(name)
    req.then(data => this.updateS3DomainMap(name, data), () => null)
    return req
  }

  @autobind
  setDefaultDomain(bucketName: string, domainInfo: IDomainInfo) {
    const req = this.domainApis.setDefaultDomain(bucketName, domainInfo.domain)
    req.then(() => this.updateDefaultDomainMap(bucketName, {
      domain: domainInfo.domain,
      domainType: domainInfo.type,
      protocol: this.getDomainProtocol(bucketName, domainInfo)!,
      isAvailable: true
    }), () => null)
    return req
  }

  /* 域名绑定源站 */
  @autobind
  bindSourceBucket(domain: string, bucketName: string, scope: DomainScope) {
    const req = this.domainApis.bindDomainToBucket({ domain, bucket: bucketName, api_scope: scope })
    req.then(() => this.fetchKodoDomainListByBucketName(bucketName), () => null)
    return req
  }

  /**
   * 域名解绑源站
   * @param domain - 要解绑的域名
   * @param [bucketName] - 空间名称，可选，指定该参数会刷新 Store 中对应空间的的域名列表
   */
  @autobind
  unbindSourceBucket(domain: string, bucketName?: string) {
    if (bucketName) {
      const req = this.domainApis.unbindBucketDomain(domain, bucketName)
      req.then(() => this.fetchKodoDomainListByBucketName(bucketName), () => null)
      return req
    }

    return this.domainApis.unbindBucketDomain(domain)
  }

  /* 域名解冻 */
  @autobind
  unfreezeDomain(domain: string, bucketName: string) {
    const req = this.domainApis.unfreezeDomain(domain)
    req.then(_ => this.fetchKodoDomainListByBucketName(bucketName)).catch(() => { /**/ })
    return req
  }
}
