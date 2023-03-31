import { action, computed, makeObservable, observable, reaction } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'
import autobind from 'autobind-decorator'

import { Loadings } from 'portal-base/common/loading'

import { InteractMarketingApis } from 'apis/interactMarketing'
import AppConfigStore from 'store/interactMarketing/appConfig'

@injectable()
export default class ImRadioListStore extends Store {
  constructor(
    private toasterStore: ToasterStore,
    private apis: InteractMarketingApis,
    private appConfigStore: AppConfigStore
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, 'im')
  @computed get loading() {
    return this.loadings.isLoading('im')
  }

  @observable.ref im: string[] = []
  @action.bound updateIm(list: string[]) {
    this.im = list
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle('im')
  async fetchIM() {
    if (this.appConfigStore.config.RTCApp === '') {
      return
    }

    const imAppId = await this.apis.getImAppId(
      this.appConfigStore.config.RTCApp
    )

    this.updateIm(imAppId ? [imAppId] : [])

    if (!imAppId) {
      this.appConfigStore.updateConfig({ IMServer: '' })
      return
    } 

    if (imAppId !== this.appConfigStore.config.IMServer) {
      this.appConfigStore.updateConfig({ IMServer: imAppId })
    }
  }

  init() {
    this.addDisposer(
      reaction(
        () => this.appConfigStore.config.RTCApp,
        () => {
          this.fetchIM()
        }
      )
    )
    this.fetchIM()
  }
}
