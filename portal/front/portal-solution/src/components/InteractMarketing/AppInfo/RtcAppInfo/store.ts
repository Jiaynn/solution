import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { injectProps } from 'qn-fe-core/local-store'

import autobind from 'autobind-decorator'

import { RtcAppInfoProps } from '.'
import { InteractMarketingApis } from 'apis/interactMarketing'

@injectable()
export default class RtcAppInfoStore extends Store {
  constructor(
    private apis: InteractMarketingApis,
    private toasterStore: ToasterStore,
    @injectProps() private props: RtcAppInfoProps
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }
  loadings = Loadings.collectFrom(this, { usable: 'usable' })
  @computed get loadingUsable() {
    return this.loadings.isLoading('usable')
  }

  @observable usable = true
  @action.bound updateUsable(value: boolean) {
    this.usable = value
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('usable')
  async fetchUsable() {
    const data = await this.apis.getRtcAppList({
      page_num: 1,
      page_size: 1000
    })
    const exist = !!data?.list.map(v => v.name).includes(this.props.rtcApp)
    this.updateUsable(exist)
  }

  init() {
    this.fetchUsable()
  }
}
