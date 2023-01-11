/**
 * @desc component for full screen layout
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React, { PropsWithChildren } from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import IcecreamLayout from 'react-icecream/lib/layout'
import { RouterStore } from 'portal-base/common/router'
import registerPermission from 'portal-base/common/utils/permission'
import { signInRequired } from 'portal-base/user/account'

import Breadcrumb from 'cdn/components/common/Breadcrumb'

// FIXME: 新版本的 portal-base 没有导出该文件
import LogoSvg from './logo.svg'

import './style.less'

const IcecreamHeader = IcecreamLayout.Header
const IcecreamContent = IcecreamLayout.Content

const FullScreenLayout = observer(function _FullScreenLayout({ children }: PropsWithChildren<{}>) {
  const routerStore = useInjection(RouterStore)

  return (
    <IcecreamLayout className="comp-layout-full-screen">
      <IcecreamHeader className="layout-full-screen-header">
        <div className="logo-wrapper">
          <LogoSvg className="logo-img" onClick={() => routerStore.push('/create')} />
        </div>
        <div className="breadcrumb-wrapper">
          <Breadcrumb />
        </div>
      </IcecreamHeader>
      <IcecreamContent className="layout-full-screen-content">
        {children}
      </IcecreamContent>
    </IcecreamLayout>
  )
})

export default registerPermission(signInRequired)(FullScreenLayout)
