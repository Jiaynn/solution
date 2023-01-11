/**
 * @file component InternalLayout
 * @description 默认 私有云/OEM 环境下所使用的 Layout
 * @author yinxulai <me@yinxulai.me>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { ContentLayout, PrivatizedLayout } from 'portal-base/common/components/Layout'
import { IPrivatizedNavbarProps, usePrivatizedNavbarPropsFromApi } from 'portal-base/common/components/Navbar'

import Breadcrumb from '../common/Breadcrumb'
import Sidebar, { IProps as ISidebarProps } from '../common/Sidebar'
import { SignInStore } from 'kodo/stores/sign-in'

export interface IProps {
  productTitle: React.ReactNode
  sidebarOptions: ISidebarProps['itemOptions']
}

interface DiDeps {
  navbarProps: IPrivatizedNavbarProps
}

@observer
class InternalLayoutImp extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get sidebarView() {
    return (
      <Sidebar
        title={this.props.productTitle}
        itemOptions={this.props.sidebarOptions}
      />
    )
  }

  render() {
    return (
      <PrivatizedLayout navbarProps={this.props.navbarProps}>
        <ContentLayout sidebar={this.sidebarView} header={<Breadcrumb />} >
          {this.props.children}
        </ContentLayout>
      </PrivatizedLayout>
    )
  }
}

export function InternalLayout(props: React.PropsWithChildren<IProps>) {
  const navbarProps = usePrivatizedNavbarPropsFromApi()
  const signInStore = useInjection(SignInStore)
  const onSignOut = () => signInStore.gotoSignOut()

  return (<InternalLayoutImp {...props} navbarProps={{ ...navbarProps, onSignOut }} />)
}
