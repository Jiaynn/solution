/**
 * @file 登出页面
 * @author yinxulai
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { RouterStore } from 'portal-base/common/router'
import { GaeaApiException } from 'portal-base/user/gaea-client'
import { UserInfoStore } from 'portal-base/user/account'
import { InfoFilledIcon } from 'react-icecream-2/icons'

import { SignInStore } from 'kodo/stores/sign-in'
import { ConfigStore } from 'kodo/stores/config'

import { App } from 'kodo/constants/app'

import { GuestLayout } from 'kodo/components/common/Layout/GuestLayout'

import { SignInApis } from 'kodo/apis/sign-in'

import styles from './styles.m.less'

export default observer(function SignOut() {

  const toasterStore = useInjection(Toaster)
  const signInApis = useInjection(SignInApis)
  const routerStore = useInjection(RouterStore)
  const signInStore = useInjection(SignInStore)
  const configStore = useInjection(ConfigStore)
  const userInfoStore = useInjection(UserInfoStore)
  const platformConfig = configStore.getBase(App.Platform)

  const handleSignOut = React.useCallback(async () => {
    if (platformConfig.signIn.type === 'local') {
      try {
        await userInfoStore.signOut()
      } catch (error) {
        if (!(error instanceof GaeaApiException) || (error.code as number) !== 401) {
          throw error
        }
      }
    }

    if (platformConfig.signIn.type === 'external-sso') {
      const ssoInfo = await signInApis.getExternalSsoInfo()
      if (ssoInfo.signout_url) {
        window.location.replace(ssoInfo.signout_url)
      }

      return
    }

    // 跳去登录页面
    signInStore.gotoSignIn(routerStore.query)
  }, [platformConfig.signIn.type, routerStore.query, signInApis, signInStore, userInfoStore])

  React.useEffect(() => {
    // 这个延迟的目的是避免在 BootProvider 的 init(async) 阶段调用 SignOut 导致
    // 一些 init 中发送的请求发生错误的问题
    const id = setTimeout(() => toasterStore.promise(handleSignOut()), 1000)
    return () => clearTimeout(id)
  }, [handleSignOut, toasterStore])

  return (
    <GuestLayout>
      <div className={styles.content}>
        <InfoFilledIcon width={40} height={40} className={styles.icon} />
        <span>退出登录成功，正在前往登录页面。</span>
      </div>
    </GuestLayout>
  )
})
