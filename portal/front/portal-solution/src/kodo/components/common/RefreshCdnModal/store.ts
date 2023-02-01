import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import { action, makeObservable, observable } from 'mobx'

@injectable()
export class RefreshCdnStore extends Store {
  constructor() {
    super()

    makeObservable(this)
  }

  @observable.ref urls: string[] = []
  @observable.ref visible = false

  private openCallback: ((urls: string[]) => void) | null = null

  @action.bound open(urls: string[]) {
    return new Promise<string[]>(resolve => {
      this.openCallback = resolve
      this.visible = true
      this.urls = urls
    })
  }

  @action.bound close(urls: string[]) {
    this.openCallback?.(urls)
    this.visible = false
    this.urls = []
  }
}
