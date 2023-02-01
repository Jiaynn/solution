/**
 * @file component PublicLayout
 * @description 默认公有云环境下所使用的 Layout
 * @author yinxulai <me@yinxulai.me>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { InjectFunc, Inject } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import BasePublicLayout, { ContentLayout } from 'portal-base/common/components/Layout'

// 行为和 base 略有不同
import Breadcrumb from '../common/Breadcrumb'
import Sidebar, { IProps as ISidebarProps } from '../common/Sidebar'

export interface IProps {
  productTitle: React.ReactNode
  sidebarOptions: ISidebarProps['itemOptions']
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class PublicLayoutImp extends React.Component<React.PropsWithChildren<IProps> & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
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
      <BasePublicLayout>
        <ContentLayout header={<Breadcrumb />} sidebar={this.sidebarView}>
          {this.props.children}
        </ContentLayout>
      </BasePublicLayout>
    )
  }
}

export function PublicLayout(props: React.PropsWithChildren<IProps>) {
  return (
    <Inject render={({ inject }) => (
      <PublicLayoutImp {...props} inject={inject} />
    )} />
  )
}
