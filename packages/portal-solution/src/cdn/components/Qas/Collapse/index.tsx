/**
 * @file 折叠面板
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'

import Icon from 'react-icecream/lib/icon'
import IcecreamCollapse, { CollapseProps, CollapsePanelProps } from 'react-icecream/lib/collapse'

import CollapseStore from './store'

import './style.less'

export { default as CollapseStore } from './store'

interface IPanelHeaderProps {
  title: string
  collapsed: boolean
}

export const PanelHeader = observer((props: IPanelHeaderProps) => (
  <div className="qas-prime-panel-header">
    <span className="panel-header-title">{props.title}</span>
    <span className="panel-header-collapse">
      {
        props.collapsed
        ? (<>收起<Icon type="down" /></>)
        : (<>展开<Icon type="right" /></>)
      }
    </span>
  </div>
))

export interface IPanelProps extends Omit<CollapsePanelProps, 'header'> {
  title: string
  panelKey?: string
  store: CollapseStore
}

@observer
export class Panel extends React.Component<IPanelProps> {
  renderHeader() {
    return (
      <PanelHeader
        title={this.props.title}
        collapsed={this.props.panelKey != null && this.props.store.isPanelCollapsed(this.props.panelKey)}
      />
    )
  }

  render() {
    // eslint-disable-next-line
    const { className, store, ...defaultProps } = this.props
    return (
      <IcecreamCollapse.Panel
        {...defaultProps}
        className={classNames('qas-prime-collapse-panel', className)}
        header={this.renderHeader()}
      />
    )
  }
}

export default observer(function Collapse({ className, ...defaultProps }: React.PropsWithChildren<CollapseProps>) {
  return (
    <IcecreamCollapse
      {...defaultProps}
      bordered={false}
      className={classNames('qas-prime-collapse', className)}
      expandIcon={() => null}
    />
  )
})
