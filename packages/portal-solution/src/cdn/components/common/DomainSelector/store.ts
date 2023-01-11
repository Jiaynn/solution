/**
 * @file Domain Selector store
 * @author linchen <gakiclin@gmail.com>
 */

import autobind from 'autobind-decorator'
import { observable, action, computed, reaction, comparer } from 'mobx'
import { FormState, FieldState } from 'formstate-x'
import { differenceBy, intersectionBy, isEmpty } from 'lodash'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { IamPermissionStore } from 'portal-base/user/iam'

import { shouldForbidDomainTags } from 'cdn/transforms/domain'

import DomainStore from 'cdn/stores/domain'

import IamInfo from 'cdn/constants/iam-info'
import { MAX_DOMAIN_COUNT } from 'cdn/constants/domain'

import { IDomain, IQueryParams } from 'cdn/apis/domain'

import * as protocolFilterInput from './ProtocolFilter'
import * as domainListInput from './DomainList'

import { IProps } from '.'

export type State = FormState<{
  domainFilter: FieldState<string>
  protocolFilter: protocolFilterInput.State
  domains: domainListInput.State
  fullSelector: FieldState<boolean>
  tags: FieldState<string[]>
}>

export function createState(
  isFullDomainChecked = true,
  domains: IDomain[] = [],
  tags: string[] = []
): State {
  return new FormState({
    domainFilter: new FieldState('', 500),
    protocolFilter: protocolFilterInput.createState(),
    domains: domainListInput.createState(domains),
    fullSelector: new FieldState(isFullDomainChecked),
    tags: new FieldState(tags)
  })
}

export function getValue(state: State) {
  return {
    tags: state.$.tags.value,
    domains: domainListInput.getValue(state.$.domains),
    fullSelector: state.$.fullSelector.value
  } as const
}

enum LoadingType {
  SearchDomains = 'searchDomains',
  SearchDomainByTags = 'searchDomainByTags'
}

@injectable()
export default class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  @observable.ref private domains: IDomain[] = []
  @observable total = 0
  @observable.ref domainsForSelect: IDomain[] = []

  constructor(
    @injectProps() public props: IProps,
    private domainStore: DomainStore,
    private toasterStore: Toaster,
    private userInfo: UserInfo,
    private iamPermissionStore: IamPermissionStore,
    private iamInfo: IamInfo
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @computed get selectedDomains() {
    return domainListInput.getValue(this.props.state.$.domains)
  }

  @computed get selectedDomainNames() {
    return this.selectedDomains.map(it => it.name)
  }

  @action.bound updateTotal(total: number) {
    this.total = total
  }

  @computed.struct get queryParams(): IQueryParams {
    const params: IQueryParams = {
      size: MAX_DOMAIN_COUNT,
      all: true
    }

    if (this.props.state.$.domainFilter.value) {
      params.name = this.props.state.$.domainFilter.value
    }

    if (this.props.state.$.tags.value.length) {
      params.tagList = this.props.state.$.tags.value
    }

    return {
      ...params,
      ...this.props.queryParams
    }
  }

  @computed get isFullDomainChecked() {
    return this.props.state.value.fullSelector
  }

  @computed get selectedTags() {
    return this.props.state.value.tags || []
  }

  @computed get selectedProtocols() {
    return protocolFilterInput.getValue(this.props.state.$.protocolFilter)
  }

  @computed get shouldShowTags() {
    return this.props.withTags && !shouldForbidDomainTags(this.userInfo, this.iamPermissionStore, this.iamInfo)
  }

  @action.bound updateDomainsForSelect(domains: IDomain[]) {
    this.domainsForSelect = domains
  }

  @action.bound updateDomains(domains: IDomain[], queryParams: IQueryParams) {
    // 当按照关键字查询的时候（queryParams.name 不为空），只有出现在查询结果内的选中的域名才能显示。
    // 反之显示选中的域名 + 查询的结果域名的并集。
    const shouldFilterSelectedDomains = !isEmpty(queryParams.name)
    const selectedDomains = shouldFilterSelectedDomains
      ? intersectionBy(this.selectedDomains, domains, 'name')
      : this.selectedDomains
    this.domains = selectedDomains.concat(differenceBy(domains, selectedDomains, 'name'))
  }

  @action.bound updateDomainsByTags(domains: IDomain[], selectAll = true) {
    const selectedDomains = selectAll ? domains : intersectionBy(this.selectedDomains, domains, 'name')
    this.props.state.$.domains.set(selectedDomains)
    this.domains = domains
  }

  @action.bound resetSelectedDomains(domains: IDomain[]) {
    const selectedDomains = domains.filter(it => this.selectedDomainNames.includes(it.name))
    this.props.state.$.domains.set(selectedDomains)
  }

  @action.bound reorderDomains() {
    this.updateDomains(this.domains, this.queryParams)
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.SearchDomains)
  searchDomains() {
    const params = this.queryParams
    return this.domainStore.searchDomains(params).then(resp => {
      const { total, domains } = resp

      // FIXME: 认为不带 name、tagList 的搜索结果中的 total 为当前状态的 total
      // 视频瘦身页面才会传 queryParams 参数，用以增加过滤条件，不包含 name、tagList 属性
      if (isEmpty(params.name) && isEmpty(params.tagList)) {
        this.updateTotal(total)

        // 带额外 queryParams 参数时（当前只有视频瘦身页面），重置选中的域名
        if (this.props.queryParams) {
          this.resetSelectedDomains(domains)
        }
      }

      this.updateDomains(domains, params)
    })
  }

  @autobind
  @Toaster.handle()
  searchDomainByTags(selectAll = true) {
    return this.domainStore.searchDomains(this.queryParams).then(({ domains }) => {
      this.updateDomainsByTags(domains, selectAll)
    })
  }

  init() {
    // 切换协议、查询的域名结果变化的时候，重排域名列表
    this.addDisposer(reaction(
      () => [this.domains, this.selectedProtocols],
      _ => {
        const validDomains = intersectionBy(this.selectedDomains, this.domains, 'name')
        const selectedDomains = validDomains.filter(it => (
          this.selectedProtocols.indexOf(it.protocol) > -1
        ))
        const domains = this.domains.filter(it => (
          this.selectedProtocols.indexOf(it.protocol) > -1
        ))
        const targetDomains = selectedDomains.concat(differenceBy(domains, validDomains, 'name'))
        this.updateDomainsForSelect(targetDomains)
      }
    ))

    // 选中全量域名，清空当前选中的域名以及其他筛选条件，同时查询一次域名列表
    this.addDisposer(reaction(
      () => this.isFullDomainChecked,
      checked => {
        if (checked) {
          this.props.state.$.tags.set([])
          this.props.state.$.protocolFilter.reset()
          this.props.state.$.domainFilter.set('')
          this.props.state.$.domains.set([])
          this.searchDomains()
        }
      }
    ))

    // tags 变化分三种情况：
    // 1、用户选择导致 tags 的变化且数量大于 1：根据 tags 查询域名，并自动选中 tags 对应的全部域名
    // 2、props.state 重新创建而导致的 tags 变化：根据 tags 查询域名，根据查询结果过滤已经选中的域名
    // 3、清空 tags：有可能是用户清空或者选中全量域名而导致的清空，或者重新创建 props.state 导致的空
    // 如果是用户手动清空的情况下，这时候无脑清空当前选中的域名，并重新查询域名列表，方便用户二次选择
    this.addDisposer(reaction(
      () => this.props.state.$.tags.value,
      tags => {
        if (tags.length > 0) {
          this.props.state.$.protocolFilter.reset()
          this.props.state.$.domainFilter.set('')
          this.props.state.$.fullSelector.set(false)
          if (this.props.state.$.tags.dirty) {
            this.searchDomainByTags()
          } else {
            this.searchDomainByTags(false)
          }
        } else {
          if (this.props.state.$.tags.dirty) {
            this.resetSelectedDomains([])
          }
          this.searchDomains()
        }
      },
      {
        equals: comparer.structural
      }
    ))

    this.addDisposer(reaction(
      () => [this.props.queryParams, this.props.state.$.domainFilter.value],
      () => {
        this.searchDomains()
      },
      {
        fireImmediately: true,
        equals: comparer.structural
      }
    ))

    this.addDisposer(reaction(
      () => this.selectedDomainNames,
      domains => {
        if (domains.length > 0) {
          this.props.state.$.fullSelector.set(false)
        }
      }
    ))
  }
}
