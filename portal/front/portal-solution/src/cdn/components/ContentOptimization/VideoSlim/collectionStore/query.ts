
import { computed, observable, action, makeObservable } from 'mobx'
import { FieldState } from 'formstate-x'

import Store from 'qn-fe-core/store'

import { TaskState } from 'cdn/constants/video-slim'

import { IVideoSlimTaskListReq } from 'cdn/apis/video-slim'

export interface IProps {
  domains: string[]
  pageIndex: number
  pageSize: number
}

interface IFilterOptions {
  state?: TaskState[]
  [filterProps: string]: any
}

export class QueryStore extends Store {
  constructor(protected getProps: () => IProps) {
    super()
    makeObservable(this)
    this.addDisposer(this.urlState.dispose)
  }

  // 模糊搜索的 URL
  @observable.ref urlState = new FieldState('')

  // 列表过滤条件
  @observable.ref filterOptions: IFilterOptions = {
    state: undefined // 瘦身状态
  }

  @action updateFilterOptions(options: IFilterOptions) {
    this.filterOptions = options
  }

  @action.bound
  reset() {
    this.urlState.reset()
    this.applyParams()
    this.updateFilterOptions({})
  }

  @observable.ref appliedParams!: Pick<IVideoSlimTaskListReq, 'searchKeyword'>

  @action.bound applyParams() {
    this.appliedParams = {
      searchKeyword: this.urlState.$
    }
  }

  @computed get queryParams(): IVideoSlimTaskListReq {
    return {
      domains: this.getProps().domains,
      pageIndex: this.getProps().pageIndex,
      pageSize: this.getProps().pageSize,
      states: this.filterOptions.state,
      ...this.appliedParams
    }
  }
}
