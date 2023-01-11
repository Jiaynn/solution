/**
 * @file bucket route TODO: 区分公有云、私有化
 * @author yinxulai <me@yinxulai.com>
 */

import * as qs from 'query-string'
import { InjectFunc } from 'qn-fe-core/di'
import { withQueryParams as formatURL } from 'qn-fe-core/utils'

import { KodoIamStore } from 'kodo/stores/iam'
import { ConfigStore } from 'kodo/stores/config'

import { App } from 'kodo/constants/app'

export enum TabKey {
  Key = 'key',
  OpLog = 'oplog',
  Profile = 'profile',
  Security = 'security'
}

export interface IUserOptions {
  page: TabKey
}

export function getUserMainPath(inject: InjectFunc) {
  const iamStore = inject(KodoIamStore)
  const configStore = inject(ConfigStore)

  const globalConfig = configStore.getFull(App.Platform)
  const urlQueue: Array<[string, boolean]> = [
    [getUserPath(inject, { page: TabKey.Profile }), globalConfig.user.profile.enable && !iamStore.isIamUser],
    [getUserPath(inject, { page: TabKey.Key }), globalConfig.user.key.enable],
    [getUserPath(inject, { page: TabKey.Security }), globalConfig.user.security.enable && !iamStore.isIamUser],
    [getUserPath(inject, { page: TabKey.OpLog }), globalConfig.user.oplog.enable && !iamStore.isIamUser]
  ]

  // 自动根据顺序选择开启的 url
  return urlQueue.map(([path, enable]) => enable && path).filter(Boolean)[0]
}

export function getUserPath(inject: InjectFunc, options: IUserOptions): string {
  const configStore = inject(ConfigStore)

  const { page, ...params } = options
  const globalConfig = configStore.getFull(App.Platform)
  const query = Object.keys(params).length ? '?' + qs.stringify(params) : ''
  return `${globalConfig.site.rootPath}/user/${page}${query}`
}

export function getSsoSignInBackPath(inject: InjectFunc, redirect?: string) {
  const configStore = inject(ConfigStore)
  return formatURL(`${window.location.origin}${configStore.rootPath}/sso-signin-back`, {
    redirect_url: redirect || window.location.href
  })
}

export function getPublicSecurityRecoveryPath() {
  return '/user/security/totp/recovery'
}
