import { makeObservable, observable } from 'mobx'
import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'

@injectable()
export class ConfigurationStore extends Store {
  @observable.ref isFirstVisit = false;

  constructor() {
    super()
    makeObservable(this)
  }

  setIsFirstVisit(value: boolean) {
    this.isFirstVisit = value
  }
}
