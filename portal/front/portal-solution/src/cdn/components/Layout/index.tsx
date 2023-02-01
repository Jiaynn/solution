/**
 * @file component Layout
 * @author nighca <nighca@live.cn>
 */

import React, { ReactNode } from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { UserInfoStore } from 'portal-base/user/account'
import QiniuLayout from 'portal-base/common/components/Layout'

import Loading from './Loading'
import SubSidebar from './SubSidebar'
import Content from './Content'

import './style.less'

export interface Props {
  children: ReactNode
}

export default observer(function Layout(props: Props) {
  const userInfoStore = useInjection(UserInfoStore)

  const loading = (!userInfoStore.isLoaded || userInfoStore.isGuest)
    ? <Loading />
    : null

  const main = (
    <QiniuLayout>
      <Content sidebar={<SubSidebar />}>{props.children}</Content>
    </QiniuLayout>
  )

  return (
    <>
      {loading}
      {main}
    </>
  )
})
