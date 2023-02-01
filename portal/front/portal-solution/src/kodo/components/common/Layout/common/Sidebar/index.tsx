/**
 * @file sidebar component
 * @author yinxulai <me@yinxulai.me>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import SubSidebar, { LinkItem, ILinkItemProps } from 'portal-base/common/components/SubSidebar'

import styles from './style.m.less'

const baseProps = {
  relative: true,
  visible: true,
  showIcon: false,
  title: ''
}

// TODO: 直接把权限等待啥都通过 props 来控制
// 现在暂时做简单点
export interface ISidebarItemOptions {
  visible?: boolean
  showIcon?: boolean
}

function SidebarItem(props: ISidebarItemOptions & ILinkItemProps) {
  const {
    visible = true,
    showIcon = false,
    ...linkItemProps
  } = props

  if (visible === false) {
    return null
  }

  return <LinkItem {...linkItemProps} />
}

type ItemName = 'overview' | 'bucket' | 'transfer' | 'certificate' | 'dashboard' | 'streamPush'

export interface IProps {
  visible?: boolean
  title?: React.ReactNode
  itemOptions?: { [key in ItemName]?: ISidebarItemOptions }
}

@observer
export default class Sidebar extends React.Component<IProps> {

  @autobind
  getItemProps(name: ItemName) {
    const { itemOptions = {} } = this.props
    return { ...baseProps, ...itemOptions[name] }
  }

  render() {
    const { title } = this.props

    return (
      <SubSidebar title={title} className={styles.sidebar}>
        <SidebarItem {...this.getItemProps('overview')} to="/overview">概览</SidebarItem>
        <SidebarItem {...this.getItemProps('bucket')} to="/bucket">空间管理</SidebarItem>
        <SidebarItem {...this.getItemProps('transfer')} to="/transfer">跨区域同步</SidebarItem>
        <SidebarItem {...this.getItemProps('certificate')} to="/certificate">证书管理</SidebarItem>
        <SidebarItem {...this.getItemProps('dashboard')} to="/dashboard">统计分析</SidebarItem>
        <SidebarItem {...this.getItemProps('streamPush')} to="/stream-push">拉流转推</SidebarItem>
      </SubSidebar>
    )
  }
}
