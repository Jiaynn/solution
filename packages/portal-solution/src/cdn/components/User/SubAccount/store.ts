/**
 * @file 子账户管理页面
 * @author zhuhao <zhuhao@qiniu.com>
 */

import { action, computed, observable, reaction } from 'mobx'
import { debounce } from 'lodash'
import autobind from 'autobind-decorator'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { RouterStore } from 'portal-base/common/router'
import { UserInfoStore } from 'portal-base/user/account'
import { SubAccountsApis as BaseSubAccountApis } from 'portal-base/user/sub-accounts'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { proxyLoginKey, proxyLoginEmailHashKey } from 'cdn/constants/oem'

import SubAccountApis, { ISubAccount, ISubAccountsResp, ISubAccountsOptions } from 'cdn/apis/oem/sub-account'
import Routes from 'cdn/constants/routes'

import { createState } from './SearchBar'

const messages = {
  unfreezeSuccess: {
    cn: '启用账号成功',
    en: 'User enabled successfully.'
  },
  freezeSuccess: {
    cn: '禁用账号成功',
    en: 'User disabled successfully.'
  },
  resetSuccess: {
    cn: '重置子账号密码成功',
    en: 'User password reset succeeded.'
  },
  emulateSuccess: {
    cn: '模拟登陆成功',
    en: 'Simulated Login succeeded'
  }
}

enum LoadingType {
  FetchSubAccounts = 'fetchSubAccounts',
  LoadMoreSubAccounts = 'loadMoreSubAccounts',
  FreezeSubAccounts = 'freezeSubAccounts',
  UnfreezeSubAccounts = 'unfreezeSubAccounts',
  ResetPassword = 'resetPassword',
  ProxySubAccounts = 'proxySubAccounts'
}

@injectable()
export default class LocalStore extends Store {
  searchState = createState()

  loadings = Loadings.collectFrom(this, ...Object.values(LoadingType))

  @observable.ref subAccounts: ISubAccount[] = []
  @observable.shallow options: ISubAccountsOptions = { limit: 10, marker: '' }

  constructor(
    private routerStore: RouterStore,
    private userInfoStore: UserInfoStore,
    private subAccountApis: SubAccountApis,
    private baseSubAccountApis: BaseSubAccountApis,
    private routes: Routes
  ) {
    super()
  }

  @computed
  get isLoadingSubAccounts(): boolean {
    return !this.loadings.isAllFinished()
  }

  @computed
  get hasNoMoreSubAccounts() {
    return !this.options.marker
  }

  @action.bound
  updateSubAccounts(resp: ISubAccountsResp) {
    this.subAccounts = resp.infos || []
    this.options.marker = resp.marker
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.FetchSubAccounts)
  fetchSubAccounts() {
    const options: ISubAccountsOptions = { ...this.options, marker: '', name: this.searchState.value }
    return this.subAccountApis.getSubAccounts(options).then(this.updateSubAccounts)
  }

  @action.bound
  updateLoadMoreSubAccounts(resp: ISubAccountsResp) {
    this.subAccounts = this.subAccounts.concat(resp.infos || [])
    this.options.marker = resp.marker
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.LoadMoreSubAccounts)
  loadMoreSubAccounts() {
    return this.subAccountApis.getSubAccounts(this.options).then(this.updateLoadMoreSubAccounts)
  }

  @ToasterStore.handle(messages.unfreezeSuccess)
  @Loadings.handle(LoadingType.UnfreezeSubAccounts)
  unfreezeSubAccount(uid: number) {
    return this.subAccountApis.unfreezeSubAccount({ uid }).then(() => {
      this.fetchSubAccounts()
    })
  }

  @ToasterStore.handle(messages.freezeSuccess)
  @Loadings.handle(LoadingType.FreezeSubAccounts)
  freezeSubAccount(uid: number) {
    return this.subAccountApis.freezeSubAccount({ uid }).then(() => {
      this.fetchSubAccounts()
    })
  }

  @ToasterStore.handle(messages.resetSuccess)
  @Loadings.handle(LoadingType.ResetPassword)
  resetPassword(email: string) {
    return this.baseSubAccountApis.resetPassword([email])
  }

  @ToasterStore.handle(messages.emulateSuccess)
  @Loadings.handle(LoadingType.ProxySubAccounts)
  proxySubAccount(email: string) {
    return this.baseSubAccountApis.proxyLogin(email).then(() => this.userInfoStore.fetch().then(() => {
      localStorage.setItem(proxyLoginKey, String(true))
      localStorage.setItem(proxyLoginEmailHashKey, this.userInfoStore.email_hash ?? '')
      if (this.userInfoStore.isFreezed) {
        this.routerStore.push(this.routes.userFreeze)
      } else {
        this.routerStore.push(this.routes.userOverview)
      }
    }))
  }

  init() {
    this.fetchSubAccounts()

    this.addDisposer(this.searchState.dispose)

    this.addDisposer(reaction(
      () => this.searchState.value,
      debounce(() => {
        this.fetchSubAccounts()
      }, 600)
    ))
  }
}
