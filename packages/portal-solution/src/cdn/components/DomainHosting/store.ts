/**
 * @file 域名托管 store
 * @author linchen <linchen@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { observable, computed, action } from 'mobx'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { ModalStore } from 'cdn/stores/modal'

import { DomainStatus } from 'cdn/constants/domain-hosting'

import DomainHostingApis, { IDomainInfo, IGetDomainListResp } from 'cdn/apis/oem/domain-hosting'
import { IExtraProps as IDomainModalExtraProps, IValue as IDomainModalValue } from './Modal/index'

enum LoadingType {
  GetDomainList = 'GetDomainList',
  CreateDomain = 'CreateDomain',
  UpdateDomain = 'UpdateDomain',
  CheckDomainStatus = 'CheckDomainStatus'
}

@injectable()
export default class LocalStore extends Store {
  loading = Loadings.collectFrom(this, LoadingType)
  domainModalStore = new ModalStore<IDomainModalExtraProps, IDomainModalValue>()

  @observable.shallow domainList: IDomainInfo[] = []

  constructor(
    private domainHostingApis: DomainHostingApis
  ) {
    super()
  }

  @computed get isLoading() {
    return this.loading.isLoading(LoadingType.GetDomainList)
  }

  @computed get domainExists() {
    return this.domainList && this.domainList.length > 0
  }

  @computed get domainStatus() {
    return this.domainExists ? this.domainList[0].status : DomainStatus.Invalid
  }

  @action.bound updateDomainList(resp: IGetDomainListResp) {
    this.domainList = resp.records
  }

  @action.bound handleUpdateDomainDone(item: IDomainInfo) {
    const index = this.domainList.findIndex(it => it.id === item.id)
    if (index !== -1) {
      this.domainList.splice(index, 1, item)
    }
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.CheckDomainStatus)
  checkDomain(domain: string) {
    return this.domainHostingApis.checkDomain(domain).then(this.getDomainList)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetDomainList)
  getDomainList() {
    return this.domainHostingApis.getDomainList().then(this.updateDomainList)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.CreateDomain)
  createDomain(domain: string) {
    return this.domainHostingApis.createDomain(domain).then(this.getDomainList)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.UpdateDomain)
  updateDomain(item: IDomainInfo) {
    return this.domainHostingApis.updateDomain(item).then(() => this.handleUpdateDomainDone(item))
  }
}
