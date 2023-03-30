import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'

import Store from 'qn-fe-core/store'

import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'

import { ToasterStore } from 'portal-base/common/toaster'

import { Loadings } from 'portal-base/common/loading'

import { InteractMarketingApis } from 'apis/interactMarketing'
import { KodoDomainInfoProps } from '.'

const LoadingType = {
  HasGaba: 'hasGaba',
  Usable: 'usable'
} as const

@injectable()
export default class KodoDomainInfoStore extends Store {
  constructor(
    private toaster: ToasterStore,
    private apis: InteractMarketingApis,
    @injectProps() private props: KodoDomainInfoProps
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

  /**
   * 是否备案
   */
  @observable hasGaba = true
  @action.bound updatehasGaba(value: boolean) {
    this.hasGaba = value
  }

  /**
   * 是否失效
   */
  @observable usable = true
  @action.bound updateUsable(value: boolean) {
    this.usable = value
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.HasGaba)
  async fetchHasGaba() {
    const data = await this.apis.getDomainStatus(this.props.domain)
    this.updatehasGaba(!!data?.hasGaba)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.Usable)
  async fetchUsable() {
    const data = await this.apis.getKodoDomain(this.props.bucket)
    const domainExist = !!data.includes(this.props.domain)
    this.updateUsable(domainExist)
  }

  init() {
    this.fetchHasGaba()
    this.fetchUsable()
  }
}
