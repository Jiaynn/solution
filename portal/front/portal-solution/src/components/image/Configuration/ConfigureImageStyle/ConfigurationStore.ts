import { makeAutoObservable } from 'mobx'
import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'

@injectable()
export class ConfigurationStore extends Store {
  isFirstVisit = false;
  constructor() {
    super()
    makeAutoObservable(this)
  }
  setIsFirstVisit(value: boolean) {
    this.isFirstVisit = value
  }
}
