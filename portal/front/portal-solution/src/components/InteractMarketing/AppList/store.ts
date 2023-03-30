import { action, makeObservable, observable, runInAction } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { ToasterStore } from 'portal-base/common/toaster'

import autobind from 'autobind-decorator'

import { AppListResult, AppListQuery } from 'apis/_types/interfactMarketingType'
import { InteractMarketingApis } from 'apis/interactMarketing'
import { ImageSolutionApis } from 'apis/image'

@injectable()
export default class AppListStore extends Store {
  constructor(
    private toasterStore: ToasterStore,
    private solutionApis: ImageSolutionApis,
    private apis: InteractMarketingApis
  ) {
    super()
    makeObservable(this)
    ToasterStore.bindTo(this, this.toasterStore)
  }

  // ********** current app id **********
  @observable curId = ''
  @action.bound updateCurId(value: string) {
    this.curId = value
  }

  // ********** app list **********
  @observable.deep data: AppListResult = {
    page_total: 0,
    total_count: 0,
    end_page: true,
    list: []
  }

  @observable.deep query: AppListQuery = {
    pageNum: 1,
    pageSize: 10
  }

  @action.bound updateData(data: AppListResult) {
    this.data = data
  }

  @action.bound updateQuery(query: AppListQuery) {
    this.query = query
  }

  @action.bound resetQuery() {
    this.query = {
      pageNum: 1,
      pageSize: this.query.pageSize
    }
  }

  @autobind
  @ToasterStore.handle()
  async search() {
    this.updateLoading(true)
    const normalQuery = JSON.parse(JSON.stringify(this.query))

    const data = await this.apis.getAppList(normalQuery)
    if (data) {
      runInAction(() => {
        this.updateData(data)
      })
    }
    this.updateLoading(false)

    return data
  }

  /**
   * 当重置搜索条件时调用
   * @param pageSize 当前请求数据量
   * @returns
   */
  @autobind
  @ToasterStore.handle()
  async resetData() {
    this.updateLoading(true)
    this.resetQuery()
    await this.search()
    this.updateLoading(false)
  }

  // ********** 开通服务 **********
  @observable loading = true
  @action.bound updateLoading(value: boolean) {
    this.loading = value
  }

  @observable isOpenSolution = false
  @action.bound updateIsOpenSolution(value: boolean) {
    this.isOpenSolution = value
  }

  @autobind
  @ToasterStore.handle()
  async fetchOpenSolution() {
    this.updateLoading(true)
    await this.solutionApis.openSolution({
      solution_code: 'interact_marketing',
      mode: 0
    })
    this.updateLoading(false)
  }

  @autobind
  @ToasterStore.handle()
  async fetchIsOpenSolution() {
    this.updateLoading(true)
    const res = await this.solutionApis.isOpenSolution({
      solution_code: 'interact_marketing'
    })
    if (res) {
      this.updateIsOpenSolution(res.status || false)
    }
    this.updateLoading(false)
  }

  init(): void | Promise<void> {
    this.search()
  }
}
