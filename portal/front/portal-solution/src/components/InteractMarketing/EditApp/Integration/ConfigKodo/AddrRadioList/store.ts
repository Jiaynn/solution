import { action, computed, makeObservable, observable, reaction } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import autobind from 'autobind-decorator'

import { InteractMarketingApis } from 'apis/interactMarketing'
import AppConfigStore, {
  calcConfigValue
} from 'store/interactMarketing/appConfig'

@injectable()
export default class AddrRadioListStore extends Store {
  constructor(
    private appConfigStore: AppConfigStore,
    private apis: InteractMarketingApis,
    private toasterStore: ToasterStore
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, 'addr')
  @computed get loadingAddr() {
    return this.loadings.isLoading('addr')
  }

  @observable bucketDomains: string[] = []
  @action.bound updateBucketDomains(value: string[]) {
    this.bucketDomains = value
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('addr')
  async fetchAddr() {
    const bucket = this.appConfigStore.config.bucket
    if (!bucket || bucket === '') {
      return
    }
    const addrList = await this.apis.getKodoDomain(bucket ?? '')
    const addr = this.appConfigStore.config.addr
    const [newAddr, newAddrList] = calcConfigValue(addr ?? '', addrList)
    this.appConfigStore.updateConfig({ addr: newAddr })
    this.updateBucketDomains(newAddrList)
  }

  init() {
    this.addDisposer(
      reaction(
        () => this.appConfigStore.config.bucket,
        () => {
          this.fetchAddr()
        }
      )
    )

    this.fetchAddr()
  }
}
