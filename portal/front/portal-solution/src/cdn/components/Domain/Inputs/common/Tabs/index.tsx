/*
 * @file common tabs
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import classNames from 'classnames'
import IcecreamTabs, { TabsProps as IIcecreamTabsProps } from 'react-icecream/lib/tabs'

import './style.less'

export interface ITabsProps extends IIcecreamTabsProps {}

export default class Tabs extends React.Component<ITabsProps, {}> {
  static TabPane = IcecreamTabs.TabPane
  render() {
    const props = this.props
    const className = classNames('domain-inputs-common-Tabs', props.className)
    return <IcecreamTabs {...this.props} className={className} />
  }
}
