/**
 * @file PasswordRule store
 * @author yinxulai <me@yinxulai.cn>
 */

import { injectable } from 'qn-fe-core/di'
import { observable, runInAction, makeObservable } from 'mobx'
import Store from 'qn-fe-core/store'
import autobind from 'autobind-decorator'

import { AuthApis, IPasswordRule } from 'portal-base/user/account'

import { ConfigStore } from 'kodo/stores/config'

import { App } from 'kodo/constants/app'

@injectable()
export class PasswordRuleStore extends Store {
  constructor(
    private configStore: ConfigStore,
    private authApis: AuthApis
  ) {
    super()
    makeObservable(this)
  }

  @observable.ref rule: IPasswordRule

  @autobind
  async fetchRule() {
    let rule: IPasswordRule | null = null
    const globalConfig = this.configStore.getFull(App.Platform)

    // TODO: 修复这个类型
    if (globalConfig.user.security.password.rule as any === 'from-api') {
      rule = await this.authApis.getPasswordRule()
    }

    if (typeof globalConfig.user.security.password.rule === 'object') {
      rule = globalConfig.user.security.password.rule
    }

    if (rule != null) {
      runInAction(() => {
        this.rule = rule!
      })
      return
    }

    throw new Error('无效的密码规则配置。')
  }
}
