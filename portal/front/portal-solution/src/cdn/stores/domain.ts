/**
 * @file domain store
 * @author nighca <nighca@live.cn>
 */

import { observable, action, runInAction, computed } from 'mobx'
import { Loadings } from 'portal-base/common/loading'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { SourceType } from 'cdn/constants/domain'

import DomainApis, { IDomain, IDomainDetail, IQueryParams } from 'cdn/apis/domain'

import BucketStore from './bucket'

enum LoadingType {
  SearchDomains = 'searchDomains',
  FetchDomainTotal = 'fetchDomainTotal',
  FetchWildcardDomains = 'fetchWildcardDomains'
}

@injectable()
export default class DomainStore extends Store {

  loadings = Loadings.collectFrom(this, LoadingType)

  // domain & domainDetail 来自不同的接口，字段不太一样
  // TODO: 同步维护，即，set domainDetailMap 时也应该更新 domainMap
  // TODO: 另外需要考虑泛子域名在这里边的定位（目前是默认忽略泛子域名的）
  @observable total = 0
  protected domainMap = observable.map<string, IDomain>({}, { deep: false })
  protected domainDetailMap = observable.map<string, IDomainDetail>({}, { deep: false })

  constructor(
    private bucketStore: BucketStore,
    private domainApis: DomainApis
  ) {
    super()
  }

  @computed get isLoadingTotal() {
    return this.loadings.isLoading(LoadingType.FetchDomainTotal)
  }

  @action updateTotal(total: number) {
    this.total = total
  }

  getDomain(name: string) {
    return this.domainMap.get(name) || null
  }

  @action setDomain(domain: IDomain) {
    this.domainMap.set(domain.name, domain)
  }

  getDomainDetail(name: string) {
    return this.domainDetailMap.get(name) || null
  }

  @action setDomainDetail(domainDetail: IDomainDetail) {
    this.domainDetailMap.set(domainDetail.name, domainDetail)
  }

  fetchDomainDetail(name: string) {
    const req = this.domainApis.getDomainDetail(name).then(
      domainDetail => this.setDomainDetail(domainDetail)
    )
    return this.loadings.promise(getDomainDetailLoadingKey(name), req)
  }

  isLoadingDomainDetail(name: string) {
    return this.loadings.isLoading(getDomainDetailLoadingKey(name))
  }

  @observable.ref wildcardDomains: IDomain[] = []

  @action updateWildcardDomains(domains: IDomain[]) {
    this.wildcardDomains = domains || []
  }

  @Loadings.handle(LoadingType.FetchWildcardDomains)
  fetchWildcardDomains() {
    return this.domainApis.getWildcardDomains().then(
      domains => this.updateWildcardDomains(domains)
    )
  }

  // 判断给定的 domain 是不是使用了七牛私有 bucket 作为源站
  // domainDetail.qiniuPrivate 不靠谱
  isQiniuPrivate(name: string) {
    const domain = this.getDomainDetail(name)
    if (
      !domain
      || domain.source.sourceType !== SourceType.QiniuBucket
      || !domain.source.sourceQiniuBucket
    ) {
      return false
    }
    return this.bucketStore.isBucketPrivate(domain.source.sourceQiniuBucket)
  }

  // 判断给定的 domain 是不是使用了七牛 bucket 作为源站，且 bucket 已不存在
  isBucketMissing(name: string) {
    const domain = this.getDomainDetail(name)
    return (
      domain
      && domain.source.sourceType === SourceType.QiniuBucket
      && !this.bucketStore.hasBucket(domain.source.sourceQiniuBucket)
    )
  }

  @Loadings.handle(LoadingType.FetchDomainTotal)
  fetchTotal(all = true) {
    return this.domainApis.searchDomains({ size: 1, all }).then(
      result => this.updateTotal(result.total)
    )
  }

  @Loadings.handle(LoadingType.SearchDomains)
  searchDomains(params: IQueryParams) {
    return this.domainApis.searchDomains(params).then(result => {
      runInAction(() => {
        result.domains.forEach(
          domain => this.setDomain(domain)
        )
      })
      return result
    })
  }
}

function getDomainDetailLoadingKey(name: string) {
  return `domain.detail.${name}`
}
