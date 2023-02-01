import { observable, action, makeObservable } from 'mobx'
import { FieldState } from 'formstate-x'

import Store from 'qn-fe-core/store'

import { IVideoSlimTaskListReq } from 'cdn/apis/video-slim'

export class QueryStore extends Store {
  constructor() {
    super()
    makeObservable(this)
    this.addDisposer(this.urlState.dispose)
  }

  // 模糊搜索的 URL
  @observable.ref urlState = new FieldState('')

  @action.bound
  reset() {
    this.urlState.reset()
    this.applyParams()
  }

  @observable.ref appliedParams!: Pick<IVideoSlimTaskListReq, 'searchKeyword'>

  @action.bound applyParams() {
    this.appliedParams = {
      searchKeyword: this.urlState.$
    }
  }
}
