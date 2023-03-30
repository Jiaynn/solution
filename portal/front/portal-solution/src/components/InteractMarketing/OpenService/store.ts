import { action, makeObservable, observable } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'
import autobind from 'autobind-decorator'

import { ImageSolutionApis } from 'apis/image'

@injectable()
export default class OpenServiceStore extends Store {
  constructor(
    private toasterStore: ToasterStore,
    private apis: ImageSolutionApis
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }

  @observable isOpenSolution = false
  @action.bound
  updateIsOpenSolution(value: boolean) {
    this.isOpenSolution = value
  }

  @autobind
  @ToasterStore.handle()
  async fetchOpenSolution() {
    this.updateLoading(true)
    const res = await this.apis.openSolution({
      solution_code: 'interact_marketing',
      mode: 0
    })
    this.updateIsOpenSolution(res)
    this.updateLoading(false)
  }

  @autobind
  @ToasterStore.handle()
  async fetchIsOpenSolution() {
    this.updateLoading(true)
    const res = await this.apis.isOpenSolution({
      solution_code: 'interact_marketing'
    })
    if (res) {
      this.updateIsOpenSolution(res.status || false)
    }
    this.updateLoading(false)
  }

  @observable loading = true
  @action.bound
  updateLoading(value: boolean) {
    this.loading = value
  }

  init(): void | Promise<void> {
    this.fetchIsOpenSolution()
  }
}
