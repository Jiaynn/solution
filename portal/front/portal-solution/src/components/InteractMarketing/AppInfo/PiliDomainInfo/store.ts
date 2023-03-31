import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'

import Store from 'qn-fe-core/store'

import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'

import { Loadings } from 'portal-base/common/loading'

import { ToasterStore } from 'portal-base/common/toaster'

import { InteractMarketingApis } from 'apis/interactMarketing'
import { PiliDomainInfoProps } from '.'
import { PiliDomainType } from 'apis/_types/interactMarketingType'

const LoadingType = {
  HasGaba: 'hasGaba',
  Usable: 'usable'
} as const

@injectable()
export default class PiliDomainInfoStore extends Store {
  constructor(
    private toaster: ToasterStore,
    private apis: InteractMarketingApis,
    @injectProps() private props: PiliDomainInfoProps
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toaster)
  }

  loadings = Loadings.collectFrom(this, LoadingType)
  @computed get loadingHasGaba() {
    return this.loadings.isLoading(LoadingType.HasGaba)
  }
  @computed get loadingUsable() {
    return this.loadings.isLoading(LoadingType.Usable)
  }

  @observable domain = this.props.domain
  @observable hub = this.props.hub

  /**
   * 是否失效
   */
  @observable usable = true
  @action.bound updateUsable(value: boolean) {
    this.usable = value
  }

  /**
   * 域名类型
   */
  @observable type = this.props.type
  @action.bound updateType(value: PiliDomainType) {
    this.type = value
  }

  /**
   * 是否备案
   */
  @observable hasGaba = true
  @action.bound updateHasGaba(value: boolean) {
    this.hasGaba = value
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.HasGaba)
  async fetchHasGaba() {
    const data = await this.apis.getDomainStatus(this.domain)
    this.updateHasGaba(!!data?.hasGaba)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.Usable)
  async fetchUsable() {
    const data = await this.apis.getPiliDomain(this.hub)
    const domainExist = !!data.domains
      .filter(value => value.type === this.type)
      .map(value => value.domain)
      .includes(this.domain)

    this.updateUsable(domainExist)
  }

  async init() {
    await this.fetchHasGaba()
    await this.fetchUsable()
  }
}
