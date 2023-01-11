/**
 * @file component OemLayout
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React, { ReactNode, useCallback } from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { UserInfoStore } from 'portal-base/user/account'
import { SubAccountsApis } from 'portal-base/user/sub-accounts'
import { ToasterStore } from 'portal-base/common/toaster'
import {
  PrivatizedLayout as OEMLayout,
  PrivatizedLayoutProps as OEMLayoutProps
} from 'portal-base/common/components/Layout'
import {
  UserPlaneLinkItemProfile,
  UserPlaneLinkItemSecurity,
  UserPlaneLinkItemSubAccount
} from 'portal-base/common/components/Navbar'
import { Product } from 'portal-base/common/product'

import { oemConfig } from 'cdn/constants/env'
import { proxyLoginKey } from 'cdn/constants/oem'

import Loading from './Loading'
import SubSidebar from './SubSidebar/oem'
import Content from './Content'

import './style.less'

export interface Props {
  children: ReactNode
}

export default observer(function OemLayout(props: Props) {
  const userInfoStore = useInjection(UserInfoStore)

  const loading = (!userInfoStore.isLoaded || userInfoStore.isGuest)
    ? <Loading />
    : null

  const linkItems = [
    // eslint-disable-next-line
    <UserPlaneLinkItemProfile />,
    // eslint-disable-next-line
    <UserPlaneLinkItemSecurity />
  ]

  if (!userInfoStore.isOem) {
    linkItems.push(<UserPlaneLinkItemSubAccount />)
  }

  const toasterStore = useInjection(ToasterStore)
  const subAccountsApis = useInjection(SubAccountsApis)
  const handleOemSignOut = useCallback(() => {
    if (window.localStorage.getItem(proxyLoginKey)) {
      return toasterStore.promise(
        subAccountsApis.stopLogin().then(() => {
          window.localStorage.removeItem(proxyLoginKey)
          window.location.reload()
        })
      )
    }
    return userInfoStore.signOutAndGoSignIn()
  }, [userInfoStore, subAccountsApis, toasterStore])

  const layoutProps: OEMLayoutProps = {
    navbarProps: {
      products: [Product.Cdn],
      linkItems,
      logoSrc: oemConfig.logo,
      onSignOut: handleOemSignOut
    }
  }

  const main = (
    <OEMLayout {...layoutProps}>
      <Content sidebar={<SubSidebar />}>{props.children}</Content>
    </OEMLayout>
  )

  return (
    <>
      {loading}
      {main}
    </>
  )
})
