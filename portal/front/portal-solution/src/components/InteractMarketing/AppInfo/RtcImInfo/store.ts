import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'

import Store from 'qn-fe-core/store'

import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'

import { ToasterStore } from 'portal-base/common/toaster'

import { Loadings } from 'portal-base/common/loading'

import { InteractMarketingApis } from 'apis/interactMarketing'
import { RtcImInfoProps } from '.'

const LoadingType = {
  Usable: 'usable'
} as const

@injectable()
export default class RtcImInfoStore extends Store {
  constructor(
    private toaster: ToasterStore,
    private apis: InteractMarketingApis,
    @injectProps() private props: RtcImInfoProps
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toaster)
  }

  loadings = Loadings.collectFrom(this, LoadingType)
  @computed get loadingUsable() {
    return this.loadings.isLoading(LoadingType.Usable)
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
  @Loadings.handle(LoadingType.Usable)
  async fetchUsable() {
    const im = await this.apis.getImAppId(this.props.rtcApp)
    if (this.props.im === im) {
      this.updateUsable(true)
    } else {
      this.updateUsable(false)
    }
  }

  init() {
    this.fetchUsable()
  }
}
