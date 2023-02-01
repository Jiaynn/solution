/**
 * @file component LayoutBlock
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React, { CSSProperties, ReactNode } from 'react'
import classNames from 'classnames'

import './style.less'

export interface ILayoutBlock {
  title: ReactNode
  className?: string
  style?: CSSProperties
}

export default function LayoutBlock(props: React.PropsWithChildren<ILayoutBlock>) {
  const { title, className, style, children } = props
  return (
    <div className={classNames('comp-layout-block', className)} style={style}>
      <h3 className="layout-block-title">{title}</h3>
      <div className="layout-block-content">{children}</div>
    </div>
  )
}
