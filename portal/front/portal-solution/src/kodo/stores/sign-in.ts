/**
 * @description 封装了登录/登出跳转行为，是实际业务与登录登出实现的抽象接口层
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'

import { App } from 'kodo/constants/app'
import { ConfigStore } from './config'

export interface SignInUrlOptions {
  email?: string // 部分登录类型支持自动填充账号
  redirect?: string // 登录/登出 最终跳转回来的地址
}

@injectable()
export class SignInStore {

  constructor(private configStore: ConfigStore) { }

  getSignInUrl(options: SignInUrlOptions = {}) {
    const { email, redirect = window.location.href } = options

    const app = this.configStore.isApp(App.Platform)
      ? App.Platform
      : this.configStore.product

    // TODO: 在全局通过注入/覆盖 commonEntryMap 来使用 signInUrl
    const globalConfig = this.configStore.getBase(app)
    return formatURL(globalConfig.signIn.signInUrl, {
      email, redirect
    })
  }

  gotoSignIn(options: SignInUrlOptions = {}) {
    window.location.replace(this.getSignInUrl(options))
  }

  gotoSignOut(options: SignInUrlOptions = {}) {
    const { email, redirect = window.location.href } = options

    const app = this.configStore.isApp(App.Platform)
      ? App.Platform
      : this.configStore.product

    const globalConfig = this.configStore.getBase(app)
    // TODO: 在全局通过注入/覆盖 commonEntryMap 来使用 signOutUrl
    const signOutUrl = formatURL(globalConfig.signIn.signOutUrl, {
      email, redirect
    })

    if (signOutUrl) return window.location.replace(signOutUrl)
    throw new Error('Invalid sso signout url configure')
  }
}
