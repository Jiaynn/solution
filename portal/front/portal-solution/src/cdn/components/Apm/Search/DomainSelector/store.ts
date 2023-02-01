
import { observable, computed, reaction, action, comparer } from 'mobx'
import autobind from 'autobind-decorator'

import { Loadings } from 'portal-base/common/loading'
import { ToasterStore } from 'portal-base/common/toaster'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import DomainStore from 'cdn/stores/domain'

import { MAX_DOMAIN_COUNT } from 'cdn/constants/domain'

import { IQueryParams, IDomain } from 'cdn/apis/domain'

export interface IDomainSelectorProps {
  value?: string
  onChange: (target?: string) => void
  lazy?: {}
}

export const protocolsOptions = [
  { label: 'http', value: 'http' },
  { label: 'https', value: 'https' },
  { label: '其它', value: 'other' }
]

@injectable()
export default class LocalStore extends Store {

  loadings = new Loadings('domains')

  constructor(
    @injectProps() private props: IDomainSelectorProps,
    private domainStore: DomainStore
  ) {
    super()
  }

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @observable.ref domains: IDomain[] = []
  @action.bound updateDomains(domains: IDomain[]) {
    this.domains = domains
  }

  @observable total = 0
  @action.bound updateTotal(total: number) {
    this.total = total
  }

  @observable domainFilter = ''

  @action.bound updateDomainFilter(value: string) {
    this.domainFilter = value
  }

  @observable selectedDomain?: string
  @observable.ref protocols: string[] = protocolsOptions.map(item => item.value)

  @computed get domainList() {
    return (this.domains || []).filter(
      domain => this.isDomainValid(domain)
    )
  }

  @computed get domainResultNames() {
    return this.domainList.map(domain => domain.name)
  }

  @computed get summary() {
    if (!this.selectedDomain) {
      return '选择域名'
    }
    return this.selectedDomain
  }

  @action.bound updateSelectedDomain(domain?: string) {
    this.selectedDomain = domain
  }

  handleVisibleChange(visible: boolean) {
    if (visible) {
      return
    }
    this.confirmDomains()
  }

  confirmDomains() {
    this.props.onChange(this.selectedDomain)
  }

  isProtocolValid(protocol: string): boolean {
    if (!this.protocols) {
      return false
    }
    if (protocol === 'http' || protocol === 'https') {
      return this.protocols.indexOf(protocol) !== -1
    }
    return this.protocols.indexOf('other') !== -1
  }

  @action.bound handleProtocolChange(checkedValue: string[]) {
    this.protocols = checkedValue
  }

  @autobind isDomainValid(domain: IDomain) {
    // apm 不支持 “动态加速” 域名和 “测试域名”
    return domain.platform !== 'dynamic' && domain.type !== 'test' && this.isProtocolValid(domain.protocol)
  }

  @action.bound reset() {
    this.selectedDomain = undefined
  }

  @computed get searchDomainsParams(): IQueryParams {
    const params: IQueryParams = {
      size: MAX_DOMAIN_COUNT,
      all: true
    }
    if (this.domainFilter) {
      params.name = this.domainFilter
    }
    return params
  }

  @ToasterStore.handle()
  searchDomains(params: IQueryParams) {
    const req = this.domainStore.searchDomains(params).then(
      result => {
        this.updateDomains(result.domains)

        // 认为不带 `name` 的搜索结果中的 total 为当前状态的 total
        if (!params.name) {
          this.updateTotal(result.total)
        }
      }
    )
    return this.loadings.promise('domain.search', req)
  }

  searchDomainsByName(name: string) {
    this.updateDomainFilter(name)
    return this.searchDomains(this.searchDomainsParams)
  }

  init() {
    this.addDisposer(reaction(
      () => this.props.value,
      domain => {
        this.updateSelectedDomain(domain)
      },
      { fireImmediately: true }
    ))

    this.addDisposer(reaction(
      () => this.searchDomainsParams,
      params => this.searchDomains(params),
      { fireImmediately: true, equals: comparer.structural }
    ))

    // domain 列表更新后对当前选项进行筛选
    this.addDisposer(reaction(
      () => this.domainList,
      domainList => {
        const { value, onChange } = this.props
        onChange(
          domainList.find(domain => domain.name === value) ? value : undefined
        )
      }
    ))
  }
}
