import { action, computed, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { injectProps } from 'qn-fe-core/local-store'

import autobind from 'autobind-decorator'

import { KodoBucketInfoProps } from '.'
import { InteractMarketingApis } from 'apis/interactMarketing'

@injectable()
export default class KodoBucketInfoStore extends Store {
  constructor(
    private apis: InteractMarketingApis,
    private toasterStore: ToasterStore,
    @injectProps() private props: KodoBucketInfoProps
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
    const data = await this.apis.getPiliHubList({
      page_num: 1,
      page_size: 1000
    })
    const hubExist = !!data?.list.map(v => v.name).includes(this.props.bucket)
    this.updateUsable(hubExist)
  }

  init() {
    this.fetchUsable()
  }
}
