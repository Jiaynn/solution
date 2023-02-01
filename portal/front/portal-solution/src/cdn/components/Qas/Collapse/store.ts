import { observable, action, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import Store from 'qn-fe-core/store'

export default class CollapseStore extends Store {
  @observable.ref collapseKeys: string[] = []

  constructor(initialKeys: string[]) {
    super()
    makeObservable(this)
    this.collapseKeys = initialKeys
  }

  @action.bound updateCollapseKeys(keys: string[]) {
    this.collapseKeys = keys
  }

  @autobind
  isPanelCollapsed(key: string) {
    return this.collapseKeys.indexOf(key) >= 0
  }
}
