/**
 * @file component Layout
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { ContentLayout, PrivatizedLayout } from 'portal-base/common/components/Layout'
import { privatizedRegisterPermission } from 'portal-base/common/utils/permission'
import { usePrivatizedNavbarPropsFromApi } from 'portal-base/common/components/Navbar'

import { signInRequiredPermission } from 'kodo/utils/sign-in'

import { SignInStore } from 'kodo/stores/sign-in'

import Breadcrumb from 'kodo/components/common/Layout/common/Breadcrumb'

export default privatizedRegisterPermission(signInRequiredPermission)(
  observer(
    function Layout(props: React.PropsWithChildren<{}>) {
      const navbarProps = usePrivatizedNavbarPropsFromApi()
      const signInStore = useInjection(SignInStore)
      const onSignOut = () => signInStore.gotoSignOut()

      return (
        <PrivatizedLayout navbarProps={{ ...navbarProps, onSignOut }}>
          <ContentLayout header={<Breadcrumb />} >
            {props.children}
          </ContentLayout>
        </PrivatizedLayout>
      )
    }
  )
)
