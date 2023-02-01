/**
 * @file hello store
 * @author nighca <nighca@live.cn>
 */

import { action, observable, computed } from 'mobx'

import Store, { observeInjectable } from 'qn-fe-core/store'

import { humanize } from 'transforms/hello'
import HelloApis from 'apis/hello'

@observeInjectable()
export default class HelloStore extends Store {

  constructor(
    private helloApis: HelloApis
  ) {
    super()
  }

  @observable target = 'anonymous'

  @computed get text() {
    return `${humanize('hello')}，${this.target}`
  }

  @action updateTarget(target: string) {
    this.target = target
  }

  getTarget() {
    return this.helloApis.getTargetForHello().then(
      target => this.updateTarget(target)
    )
  }

}
