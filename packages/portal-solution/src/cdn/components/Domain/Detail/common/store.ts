import { observable, computed, reaction, action, makeObservable } from 'mobx'
import Store from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'
import { UserInfoStore } from 'portal-base/user/account'

import DomainStore from 'cdn/stores/domain'

import DomainApis from 'cdn/apis/domain'

export interface IBaseDomainDetailProps {
  name: string
}

export default class BaseStateStore extends Store {

  loadings = new Loadings()

  constructor(
    private getProps: () => IBaseDomainDetailProps,
    protected domainApis: DomainApis,
    protected domainStore: DomainStore,
    protected userInfoStore: UserInfoStore
  ) {
    super()
    makeObservable(this)
  }

  @computed get name() {
    return this.getProps().name
  }

  @computed get isLoadingDomainDetail() {
    return this.domainStore.isLoadingDomainDetail(this.name)
  }

  @computed get domainDetail() {
    return this.domainStore.getDomainDetail(this.name)!
  }

  fetchDomainDetail() {
    return this.domainStore.fetchDomainDetail(this.name)
  }

  @computed get isBucketMissing() {
    return this.domainStore.isBucketMissing(this.name)!
  }

  @computed get isQiniuPrivate() {
    return this.domainStore.isQiniuPrivate(this.name)
  }

  @observable dirty = false

  @action markDirty(dirty = true) {
    this.dirty = dirty
  }

  @observable hasIcp = true

  @action updateDomainHasIcp(hasIcp: boolean) {
    this.hasIcp = hasIcp
  }

  fetchDomainIcpCheck() {
    return this.domainApis.getHasIcpCheck().then(hasIcpCheck => {
      if (hasIcpCheck) {
        return this.domainApis.checkDomainIcp(this.name).then(
          hasIcp => this.updateDomainHasIcp(!hasIcp)
        )
      }
    })
  }

  refresh() {
    return Promise.all([
      this.fetchDomainDetail()
    ]).then(() => {
      this.markDirty(false)
    })
  }

  init() {
    this.addDisposer(reaction(
      () => this.dirty,
      dirty => {
        if (dirty) {
          this.refresh()
        }
      }
    ))

    if (!this.userInfoStore.isOverseasUser) { // 海外用户的域名不需要检查备案
      this.addDisposer(reaction(
        () => this.name,
        _ => {
          this.fetchDomainIcpCheck()
        },
        { fireImmediately: true }
      ))
    }
  }
}
