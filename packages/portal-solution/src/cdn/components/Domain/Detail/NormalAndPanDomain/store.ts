
import { observable, computed, reaction, action, autorun } from 'mobx'
import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { ICertInfo, SslClient } from 'portal-base/certificate'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'
import { FeatureConfigStore as FeatureConfig } from 'portal-base/user/feature-config'

import { shouldForbidSourceUrlRewrite, sourceConfigForSubmit } from 'cdn/transforms/domain/source'
import { cacheConfigForm2Api } from 'cdn/transforms/domain/cache'
import { timeRefererConfigForSubmit } from 'cdn/transforms/domain/time-referer'
import { bsAuthConfigForSubmit } from 'cdn/transforms/domain/bs-auth'
import { splitImageSlims } from 'cdn/transforms/domain/image-slim'
import { transformHttpsConfigForSubmit, shouldForbidAutoFreeCert } from 'cdn/transforms/domain/https-config'

import { getSupportDesc, shouldForbidByCertExpired, shouldForbidSslize, shouldForbidUnsslize } from 'cdn/transforms/domain'

import DomainStore from 'cdn/stores/domain'

import AbilityConfig from 'cdn/constants/ability-config'
import { isOEM, isQiniu } from 'cdn/constants/env'
import { Protocol, DomainType, CertInputType, OperatingState } from 'cdn/constants/domain'

import DomainApis, { IDomain, IRespHeaderOptions } from 'cdn/apis/domain'

import BaseStateStore from '../common/store'
import { NormalAndPanDomainDetailProps as Props } from '.'

import {
  ConfigType,
  StateMap,
  createStateMap,
  getSourceConfigValue,
  getBsAuthConfigValue,
  getHttpsConfigValue,
  getCacheConfigValue,
  getRefererConfigValue,
  getTimeRefererConfigValue,
  getIpAclConfigValue,
  getImageSlimConfigValue,
  getFopConfigValue,
  getRespHeaderConfigValue,
  createStateByType
} from './formstate'

const pageSizeForPandomains = 20

export { ConfigType }

export enum LoadingType {
  FetchPanDomains = 'fetchPanDomains',
  RemovePanDomain = 'removePanDomain',
  SubmitSourceConfig = 'submitSourceConfig',
  SubmitCacheConfig = 'submitCacheConfig',
  SubmitRefererConfig = 'submitRefererConfig',
  SubmitTimeRefererConfig = 'submitTimeRefererConfig',
  SubmitBsAuthConfig = 'submitBsAuthConfig',
  SubmitIpAclConfig = 'submitIpAclConfig',
  SubmitHttpsConfig = 'submitHttpsConfig',
  SubmitImageSlimConfig = 'submitImageSlimConfig',
  SubmitRespHeaderConfig = 'submitRespHeaderConfig',
  SubmitFopConfig = 'submitFopConfig',
  EnableDomain = 'enableDomain',
  DisableDomain = 'disableDomain',
  RemoveDomain = 'removeDomain'
}

@injectable()
export default class LocalStore extends BaseStateStore {
  @observable.ref pandomainList: IDomain[] = []
  @observable pandomainListMarker?: string
  @observable pandomainListHasMore = false

  @observable.ref stateMap!: StateMap

  loadings = Loadings.collectFrom(this, LoadingType)

  constructor(
    @injectProps() protected props: Props,
    private toasterStore: Toaster,
    public userStore: UserInfo,
    public featureConfig: FeatureConfig,
    protected domainApis: DomainApis,
    private sslClient: SslClient,
    protected domainStore: DomainStore,
    private abilityConfig: AbilityConfig
  ) {
    super(
      () => props,
      domainApis,
      domainStore,
      userStore
    )
    Toaster.bindTo(this, this.toasterStore)
  }

  @action updatePandomainList(pandomains: IDomain[], marker: string, hasMore: boolean) {
    this.pandomainList = pandomains
    this.pandomainListMarker = marker
    this.pandomainListHasMore = hasMore
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.FetchPanDomains)
  fetchPanDomains(marker?: string) {
    return this.domainApis.getPandomains(this.name, {
      marker,
      limit: pageSizeForPandomains
    })
  }

  refreshPandomains() {
    return this.fetchPanDomains().then(
      ({ marker, domains }) => this.updatePandomainList(
        domains,
        marker,
        hasMorePandomainList(domains)
      )
    )
  }

  fetchMorePandomains() {
    return this.fetchPanDomains(this.pandomainListMarker!).then(
      ({ marker, domains }) => this.updatePandomainList(
        this.pandomainList.concat(domains),
        marker,
        hasMorePandomainList(domains)
      )
    )
  }

  @autobind
  @Toaster.handle('催单发送成功，您可同时提交工单以便查看处理进度。')
  freeCertHurryUp() {
    return this.domainApis.freeCertHurryUp(this.domainDetail.name)
      .then(
        () => {
          const { https, name, configProcessRatio, operatingState } = this.domainDetail
          const params = {
            category: '证书问题',
            space: 'CDN',
            title: '免费 from 自动催单',
            certificateID: https.certId || '未获取证书 ID',
            domain: name,
            description: getSupportDesc(configProcessRatio!, operatingState),
            mobile: this.userStore.mobile,
            email: this.userStore.email
          }
          window.open(formatURL('https://support.qiniu.com/tickets/new/form', params))
          return this.markDirty(true)
        }
      )
  }

  @Loadings.handle(LoadingType.RemovePanDomain)
  removePandomain(name: string) {
    return this.domainApis.deleteDomain(name).then(
      () => this.refreshPandomains()
    )
  }

  @observable cnamed?: boolean

  @computed get needConfigureCname() {
    return this.cnamed === false
  }

  @action updateCnamed(cnamed?: boolean) { this.cnamed = cnamed }

  checkCnamed() {
    const domain = this.domainDetail
    if (!domain) {
      return Promise.reject('非法的 domain 信息')
    }
    const req = this.domainApis.checkCnamed({
      domain: domain.name,
      cname: domain.cname
    }).then(
      cnamed => this.updateCnamed(cnamed)
    )
    return this.loadings.promise('checkCnamed', req)
  }

  @computed get httpsConfig() {
    return getHttpsConfigValue(this.stateMap.httpsConfig)
  }

  @computed get isForbidAutoFreeCert() {
    return this.httpsConfig.certInputType === CertInputType.Free
      && !!shouldForbidAutoFreeCert(this.domainDetail)
  }

  @observable certInfo?: ICertInfo

  @computed get shouldForbidByCertExpired() {
    return this.domainDetail.operatingState === OperatingState.Success
      && shouldForbidByCertExpired(this.domainDetail, this.certInfo)
  }

  @action updateCertInfo(certInfo: ICertInfo) {
    this.certInfo = certInfo
  }

  @Toaster.handle()
  fetchCertInfo(certId: string) {
    return this.sslClient.getCertInfo(certId)
      .then(certInfo => this.updateCertInfo(certInfo))
  }

  @observable configuring: Record<ConfigType, boolean> = {
    sourceConfig: false,
    cacheConfig: false,
    refererConfig: false,
    timeRefererConfig: false,
    bsAuthConfig: false,
    ipACLConfig: false,
    httpsConfig: false,
    imageSlimConfig: false,
    fopConfig: false,
    responseHeaderControlConfig: false
  }

  @action startConfigure(type: ConfigType) {
    this.configuring[type] = true
  }

  @action endConfigure(type: ConfigType) {
    this.configuring[type] = false
    this.resetInputs(type)
  }

  @computed get sourceConfig() {
    return getSourceConfigValue(this.stateMap.sourceConfig)
  }

  @computed get isSourceUrlRewriteForbidden() {
    return !!shouldForbidSourceUrlRewrite(
      this.domainDetail,
      isOEM,
      this.userStore,
      this.featureConfig
    )
  }

  @computed get sourceConfigForSubmit() {
    return sourceConfigForSubmit(
      this.sourceConfig,
      this.domainDetail.type,
      this.domainDetail.protocol,
      this.domainDetail.name,
      this.isSourceUrlRewriteForbidden
    )
  }

  @Loadings.handle(LoadingType.SubmitSourceConfig)
  submitSourceConfig() {
    return this.domainApis.updateSource(this.name, this.sourceConfigForSubmit).then(
      () => this.markDirty()
    )
  }

  @computed get cacheConfig() {
    return getCacheConfigValue(this.stateMap.cacheConfig)
  }

  @computed get cacheConfigForSubmit() {
    return cacheConfigForm2Api(this.cacheConfig, this.abilityConfig.useStaticCacheConfig)
  }

  @Loadings.handle(LoadingType.SubmitCacheConfig)
  submitCacheConfig() {
    return this.domainApis.updateCache(this.name, this.cacheConfigForSubmit).then(
      () => this.markDirty()
    )
  }

  @computed get refererConfigForSubmit() {
    return getRefererConfigValue(this.stateMap.refererConfig)
  }

  @Loadings.handle(LoadingType.SubmitRefererConfig)
  submitRefererConfig() {
    return this.domainApis.updateReferer(this.name, this.refererConfigForSubmit).then(
      () => this.markDirty()
    )
  }

  @computed get timeRefererConfig() {
    return getTimeRefererConfigValue(this.stateMap.timeRefererConfig)
  }

  @computed get timeRefererConfigForSubmit() {
    return timeRefererConfigForSubmit(this.timeRefererConfig)
  }

  @Loadings.handle(LoadingType.SubmitTimeRefererConfig)
  submitTimeRefererConfig() {
    return this.domainApis.updateTimeReferer(this.name, this.timeRefererConfigForSubmit).then(
      () => this.markDirty()
    )
  }

  @computed get bsAuthConfig() {
    return getBsAuthConfigValue(this.stateMap.bsAuthConfig)
  }

  @computed get bsAuthConfigForSubmit() {
    return bsAuthConfigForSubmit(
      this.bsAuthConfig,
      this.isQiniuPrivate
    )
  }

  @Loadings.handle(LoadingType.SubmitBsAuthConfig)
  submitBsAuthConfig() {
    return this.domainApis.updateBsAuth(this.name, this.bsAuthConfigForSubmit).then(
      () => this.markDirty()
    )
  }

  @computed get ipACLConfigForSubmit() {
    return getIpAclConfigValue(this.stateMap.ipACLConfig)
  }

  @Loadings.handle(LoadingType.SubmitIpAclConfig)
  submitIpACLConfig() {
    return this.domainApis.updateIpACL(this.name, this.ipACLConfigForSubmit).then(
      () => this.markDirty()
    )
  }

  @computed get canSslize() {
    if (!this.domainDetail) return false
    if (shouldForbidSslize(this.domainDetail, this.userInfoStore)) return false
    return true
  }

  @computed get canUnsslize() {
    if (!this.domainDetail || !this.certInfo) return false
    if (shouldForbidUnsslize(this.domainDetail, this.userInfoStore, this.certInfo)) return false
    return true
  }

  // 只有以下情况可以修改域名协议
  // 1、http 升级到 https
  // 2、证书已过期的域名，可以降级到 http
  @computed get canSwitchProtocol() {
    return this.canSslize || this.canUnsslize
  }

  // 是否 HTTP 不变（原来是 HTTP，现在的输入还是 HTTP）
  @computed get stillHttp() {
    return (
      this.domainDetail.protocol === Protocol.Http
      && this.httpsConfig.protocol === Protocol.Http
    )
  }

  @Loadings.handle(LoadingType.SubmitHttpsConfig)
  updateHttpsConfig() {
    const domain = this.domainDetail
    const httpsConf = transformHttpsConfigForSubmit(this.httpsConfig, domain)

    let req
    if (this.domainDetail.protocol === Protocol.Https
      && this.httpsConfig.protocol === Protocol.Http) {
      req = this.domainApis.downgradeHttps(this.name)
    } else {
      req = (
        domain.protocol === Protocol.Http
        ? this.domainApis.upgradeHttps(this.name, httpsConf!)
        : this.domainApis.updateHttpsConf(this.name, httpsConf!)
      )
    }

    return req.then(() => this.markDirty())
  }

  @computed get imageSlimConfig() {
    return getImageSlimConfigValue(this.stateMap.imageSlimConfig)
  }

  @Loadings.handle(LoadingType.SubmitImageSlimConfig)
  submitImageSlimConfig() {
    const { enableImageSlim, prefixImageSlims, regexpImageSlims } = this.imageSlimConfig
    return this.domainApis.updateExternal(this.name, {
      ...this.domainDetail.external,
      imageSlim: {
        enableImageSlim,
        prefixImageSlims: splitImageSlims(prefixImageSlims),
        regexpImageSlims: splitImageSlims(regexpImageSlims)
      }
    }).then(
      () => this.markDirty()
    )
  }

  @computed get fopConfig() {
    return getFopConfigValue(this.stateMap.fopConfig)
  }

  @Loadings.handle(LoadingType.SubmitFopConfig)
  submitFopConfig() {
    return this.domainApis.updateExternal(this.name, {
      ...this.domainDetail.external,
      enableFop: this.fopConfig.enableFop
    }).then(
      () => this.markDirty()
    )
  }

  shouldDisableSubmit(type: LoadingType): boolean {
    return this.loadings.isLoading(type)
  }

  @Loadings.handle(LoadingType.EnableDomain)
  enableDomain() {
    return this.domainApis.toggleDomain('online', this.name).then(
      () => this.markDirty()
    )
  }

  @Loadings.handle(LoadingType.DisableDomain)
  disableDomain() {
    return this.domainApis.toggleDomain('offline', this.name).then(
      () => this.markDirty()
    )
  }

  @Loadings.handle(LoadingType.RemoveDomain)
  removeDomain() {
    return this.domainApis.deleteDomain(this.name).then(
      () => this.markDirty()
    )
  }

  getSubmitResponseHeaderConfigReq(): IRespHeaderOptions {
    return getRespHeaderConfigValue(this.stateMap.responseHeaderControlConfig)
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.SubmitRespHeaderConfig)
  submitResponseHeaderConfig() {
    const options = this.getSubmitResponseHeaderConfigReq()
    return this.domainApis.respHeader(this.domainDetail.name, options).then(
      () => this.markDirty()
    )
  }

  @action.bound
  resetInputs(type: ConfigType) {
    this.stateMap[type] = createStateByType(
      type,
      this.domainApis,
      this.domainDetail,
      () => this.isQiniuPrivate,
      this.abilityConfig
    ) as any
  }

  init() {
    super.init()

    Promise.all([
      this.refreshPandomains()
    ]).then(
      () => this.markDirty(false)
    )

    this.addDisposer(reaction(
      () => this.domainDetail,
      domain => {
        if (domain) {
          this.stateMap = createStateMap(this.domainApis, domain, () => this.isQiniuPrivate, this.abilityConfig)
        }
      },
      { fireImmediately: true }
    ))

    // domain 信息变化时，对应地更新 cnamed 信息
    this.addDisposer(reaction(
      () => this.domainDetail,
      domain => {
        // 重置 cnamed 信息
        this.updateCnamed(undefined)
        // 若当前 domain type 为 normal，通过接口检查 cname 状态
        if (domain && domain.type === DomainType.Normal) {
          this.checkCnamed()
        }
      },
      { fireImmediately: true }
    ))

    // 当在 portal 环境或者域名为自己创建时，若有 https 证书，获取其信息
    if (this.domainDetail.oemMail === this.userStore.email || isQiniu) {
      this.addDisposer(reaction(
        () => (
          this.domainDetail
          && this.domainDetail.protocol === Protocol.Https
          && this.domainDetail.https.certId
        ),
        certId => certId && this.fetchCertInfo(certId),
        { fireImmediately: true }
      ))
    }

    this.addDisposer(autorun(
      () => {
        if (this.stateMap) {
          this.addDisposer(() => {
            (Object.keys(this.stateMap) as ConfigType[]).forEach(k => (
              this.stateMap[k].dispose()
            ))
          })
        }
      }
    ))
  }
}

function hasMorePandomainList(pandomainList: any[]) {
  return !!(pandomainList && pandomainList.length >= pageSizeForPandomains)
}
