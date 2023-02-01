/**
 * @file Domain List Store
 * @author linchen <gakiclin@gmail.com>
 */

import { debounce } from 'lodash'
import autobind from 'autobind-decorator'
import { computed, observable, action, reaction, autorun } from 'mobx'
import { PaginationConfig } from 'react-icecream/lib/pagination'

import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { RouterStore } from 'portal-base/common/router'
import { QueryParams, withQueryParams as formatURL } from 'qn-fe-core/utils'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'

import { filterQuery } from 'cdn/transforms'

import { shouldForbidOEMSubAccountOperation } from 'cdn/transforms/domain'

import PaginationStore from 'cdn/stores/pagination'

import { OperatingState, Platform } from 'cdn/constants/domain'

import DomainApis, { IQueryParams, IDomain, IDomainSearchResult } from 'cdn/apis/domain'

import { IFilterOptions } from './List'
import { createState } from './Header'

import { IProps } from '.'

enum LoadingType {
  SearchDomains = 'searchDomains'
}

const defaultPageSize = 10
const defaultOptions: IFilterOptions = {
  type: [],
  platform: [],
  protocol: [],
  operatingState: []
}

@injectable()
export default class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  @observable.ref searchState = createState()
  @observable.ref domainList: IDomain[] = []
  @observable.ref selectedDomains: IDomain[] = []

  @observable.ref filterOptions = defaultOptions
  @observable.ref searchKey = ''

  paginationStore = new PaginationStore(defaultPageSize)

  constructor(
    @injectProps() protected props: IProps,
    private userInfoStore: UserInfo,
    private routerStore: RouterStore,
    private toasterStore: Toaster,
    private domainApis: DomainApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @computed get selectedDomainNames() {
    return this.selectedDomains.map(it => it.name)
  }

  @computed get batchUpdateVisible() {
    return !this.userInfoStore.isIamUser && !shouldForbidOEMSubAccountOperation(this.userInfoStore)
  }

  @computed get queryFilters(): Pick<IQueryParams, 'type' | 'platform' | 'protocol' | 'operatingState'> {
    return {
      type: this.filterOptions.type.length ? this.filterOptions.type[0] : undefined,
      platform: this.filterOptions.platform?.length ? this.filterOptions.platform[0] : undefined,
      protocol: this.filterOptions.protocol.length ? this.filterOptions.protocol[0] : undefined,
      operatingState: this.filterOptions.operatingState.length ? this.filterOptions.operatingState[0] : undefined
    }
  }

  @computed get queryParams(): IQueryParams {
    return {
      name: this.searchKey,
      tagList: this.searchState.$.tagList.value,
      from: this.paginationStore.pageSize * (this.paginationStore.pageNo - 1),
      size: this.paginationStore.pageSize,
      sortBy: 'createAt',
      asc: false,
      ...filterQuery(this.queryFilters)
    }
  }

  @computed get paginationConfig(): PaginationConfig {
    return this.paginationStore.config
  }

  @action.bound updateSearchKey(key: string) {
    this.searchKey = key
  }

  @action.bound updateSearchDomainsResp(resp: IDomainSearchResult) {
    this.paginationStore.updateTotal(resp && resp.total)
    this.domainList = resp ? resp.domains : []
  }

  @action.bound updateSelectedDomains(selectedDomainNames: string[]) {
    const selectedDomains = this.domainList.filter(it => selectedDomainNames.includes(it.name))
    this.selectedDomains = selectedDomains
  }

  @action.bound
  handleRefresh(selectedDomainNames: string[] = []) {
    this.updateSelectedDomains(selectedDomainNames)
    this.searchDomains()
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.SearchDomains)
  searchDomains() {
    return this.domainApis.searchDomains(this.queryParams).then(this.updateSearchDomainsResp)
  }

  @action.bound
  updateFilterOptions(filters: IFilterOptions) {
    this.filterOptions = filters
  }

  @action.bound
  resumeParamsFromUrl() {
    const {
      tagList,
      size,
      from,
      name,
      type,
      platform,
      protocol,
      operatingState
    } = this.routerStore.query

    if (typeof size === 'string' && !Number.isNaN(parseInt(size, 10))) {
      this.paginationStore.updatePageSize(parseInt(size, 10))
    }

    if (typeof from === 'string' && !Number.isNaN(parseInt(from, 10))) {
      this.paginationStore.updatePageNo(parseInt(from, 10) / this.paginationStore.pageSize + 1)
    }

    if (typeof name === 'string') {
      this.searchState.$.keyword.set(name)
      this.updateSearchKey(name)
    }

    if (tagList != null) {
      if (Array.isArray(tagList)) {
        this.searchState.$.tagList.set(tagList)
      } else {
        this.searchState.$.tagList.set([tagList])
      }
    }

    this.updateFilterOptions({
      type: typeof type === 'string' ? [type] : this.filterOptions.type,
      platform: typeof platform === 'string' ? [platform as Platform] : this.filterOptions.platform,
      protocol: typeof protocol === 'string' ? [protocol] : this.filterOptions.protocol,
      operatingState: typeof operatingState === 'string' ? [operatingState] as OperatingState[] : this.filterOptions.operatingState
    })
  }

  init() {
    this.resumeParamsFromUrl()

    this.addDisposer(autorun(() => (
      this.searchState && this.addDisposer(this.searchState.dispose)
    )))

    const pathname = this.routerStore.location!.pathname
    this.addDisposer(reaction(
      () => formatURL(
        pathname,
        filterQuery(this.queryParams as unknown as QueryParams)!
      ),
      url => this.routerStore.replace(url)
    ))

    this.addDisposer(reaction(
      () => this.queryParams,
      _ => this.handleRefresh(),
      { fireImmediately: true }
    ))

    this.addDisposer(reaction(
      () => this.searchState.$.keyword.value,
      debounce((keyword: string) => {
        this.updateSearchKey(keyword)
        this.paginationStore.reset()
      }, 600)
    ))
  }
}
