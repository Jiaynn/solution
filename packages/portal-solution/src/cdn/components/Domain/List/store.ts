/**
 * @file domain list store
 * @author linchen <gakiclin@gmail.com>
 */

import autobind from 'autobind-decorator'
import { computed, action, autorun, observable } from 'mobx'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { RouterStore } from 'portal-base/common/router'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { IamPermissionStore } from 'portal-base/user/iam'
import { I18nStore } from 'portal-base/common/i18n'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { humanizeToggleType, shouldForbidDomainTags } from 'cdn/transforms/domain'

import IamInfo from 'cdn/constants/iam-info'
import { DomainType, cnameCheckPrefix, refreshDelay, Protocol } from 'cdn/constants/domain'

import TagApis, { DomainTagInfo } from 'cdn/apis/tag'
import DomainApis, { TOnOffLine, ICheckCnamedResult, BatchCertResponse, CertInfo, BatchCertOptions } from 'cdn/apis/domain'
import Routes from 'cdn/constants/routes'

import { PwdConfirmStore } from '../PwdConfirm'
import * as messages from './messages'

import { IProps } from '.'

enum LoadingType {
  DeleteDomain = 'deleteDomain',
  ToggleDomain = 'toggleDomain',
  UnFreezeDomain = 'unFreezeDomain',
  GetCnameState = 'getCnameState',
  GetTags = 'getTags',
  GetCerts = 'getCerts'
}

@injectable()
export default class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  pwdConfirmStore = new PwdConfirmStore()

  domainCnameStateMap = observable.map<string, boolean>()

  domainTagsMap = observable.map<string, string[]>()

  domainCertsMap = observable.map<string, CertInfo>()

  constructor(
    @injectProps() protected props: IProps,
    private routerStore: RouterStore,
    private toasterStore: Toaster,
    private userInfo: UserInfo,
    private iamPermissionStore: IamPermissionStore,
    private tagApis: TagApis,
    private domainApis: DomainApis,
    private routes: Routes,
    private iamInfo: IamInfo,
    private i18n: I18nStore
  ) {
    super()
  }

  @computed get isLoadingCnameState() {
    return this.loadings.isLoading(LoadingType.GetCnameState)
  }

  @computed get isLoadingTags() {
    return this.loadings.isLoading(LoadingType.GetTags)
  }

  @computed get isLoadingCerts() {
    return this.loadings.isLoading(LoadingType.GetCerts)
  }

  @autobind
  redirectCreateDomain() {
    this.routerStore.push(this.routes.domainCreate())
  }

  @autobind
  redirectStatistic(name: string) {
    this.routerStore.push(this.routes.statisticsFlow(name))
  }

  @autobind
  redirectConfig(name: string) {
    this.routerStore.push(this.routes.domainDetail(name))
  }

  @autobind
  @Toaster.handle(messages.removeSuccess)
  @Loadings.handle(LoadingType.DeleteDomain)
  deleteDomain(name: string) {
    return this.domainApis.deleteDomain(name).then(() => {
      setTimeout(() => {
        this.props.onUpdate()
      }, refreshDelay)
    })
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.ToggleDomain)
  toggleDomain(type: TOnOffLine, name: string) {
    const typeDesc = this.i18n.t(humanizeToggleType(type))
    return this.domainApis.toggleDomain(type, name).then(() => {
      this.toasterStore.success(this.i18n.t(messages.toggleSuccess, typeDesc))
      setTimeout(() => {
        this.props.onUpdate()
      }, refreshDelay)
    })
  }

  @autobind
  @Toaster.handle(messages.unfreezeSuccess)
  @Loadings.handle(LoadingType.UnFreezeDomain)
  unfreezeDomain(name: string) {
    return this.domainApis.unfreezeDomain(name, {
      notifyUser: true
    }).then(() => {
      setTimeout(() => {
        this.props.onUpdate()
      }, refreshDelay)
    })
  }

  @computed get domains() {
    return this.props.domainList || []
  }

  @computed get filteredDomainsForCname() {
    return this.domains
      .filter(it => it.type === DomainType.Normal || it.type === DomainType.Wildcard)
      .map(it => ({
        type: it.type,
        cname: it.cname,
        // 泛域名通过拼接一个特殊的泛子域名来检测泛域名 cname 配置是否生效
        domain: it.type === DomainType.Wildcard ? (cnameCheckPrefix + it.name) : it.name
      }))
  }

  @computed get domainNames() {
    return this.domains.map(it => it.name)
  }

  @computed get httpsDomainNames() {
    return this.domains.filter(it => it.protocol === Protocol.Https).map(it => it.name)
  }

  @action.bound updateCnameState(resp: ICheckCnamedResult[]) {
    (resp || []).forEach(it => (
      this.domainCnameStateMap.set(it.domain.replace(cnameCheckPrefix, ''), it.cnamed)
    ))
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.GetCnameState)
  getCnameState() {
    return this.domainApis.batchCheckCnamed({ params: this.filteredDomainsForCname }).then(this.updateCnameState)
  }

  @action.bound updateTags(tagInfo: DomainTagInfo[]) {
    tagInfo.forEach(it => (
      this.domainTagsMap.set(it.domain, it.tagList || [])
    ))
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.GetTags)
  getTags() {
    return this.tagApis.batchGetDomainTags(this.domainNames).then(this.updateTags)
  }

  @autobind
  @Toaster.handle()
  getDomainIcp(domain: string) {
    return this.domainApis.getDomainIcp(domain)
  }

  @action.bound updateCerts(resp: BatchCertResponse) {
    (resp.list || []).forEach(it => (
      this.domainCertsMap.set(it.domain, it)
    ))
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.GetCerts)
  getCertInfoByDomains(domains: BatchCertOptions) {
    return this.domainApis.batchCertInfoByDomains(domains).then(this.updateCerts)
  }

  init() {
    this.addDisposer(this.pwdConfirmStore.dispose)
    this.addDisposer(autorun(() => {
      if (this.filteredDomainsForCname.length) {
        this.getCnameState()
      }
      if (this.domainNames.length && !shouldForbidDomainTags(
        this.userInfo, this.iamPermissionStore, this.iamInfo
      )) {
        this.getTags()
      }
      const domains = this.httpsDomainNames
      if (domains.length) {
        this.getCertInfoByDomains({ domains })
      }
    }))
  }
}
