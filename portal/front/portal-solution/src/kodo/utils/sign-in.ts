/**
 * @file sign in required utils
 * @author yinxulai <me@yinxulai.com>
 */

import { when } from 'mobx'
import { InjectFunc } from 'qn-fe-core/di'
import { UserInfoStore } from 'portal-base/user/account'

import { SignInStore } from 'kodo/stores/sign-in'

// 提供给 registerPermission 消费，用于检查用户的登录状态并跳转登录
// https://github.com/qbox/portal-base/blob/2e37c868aff4d1fbb40ce35450510b7616a09fe5/common/enhancers/permission.tsx#L111
export async function signInRequiredPermission(inject: InjectFunc) {
  const signInStore = inject(SignInStore)
  const userInfoStore = inject(UserInfoStore)

  await when(() => userInfoStore.inited)

  if (userInfoStore.isGuest) {
    throw { redirect: signInStore.getSignInUrl() }
  }
}
