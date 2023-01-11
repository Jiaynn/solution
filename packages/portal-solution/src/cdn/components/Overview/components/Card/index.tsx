/**
 * @file 概览页子模块卡片
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'

import './style.less'

export interface IProps {
  title?: React.ReactNode
  extra?: React.ReactNode
  className?: string
}

export default observer(function Card(props: React.PropsWithChildren<IProps>) {
  const { title, extra, className, children } = props

  return (
    <div className={classNames('comp-overview-card', className)}>
      {(title || extra) && (
        <div className="card-header">
          {title && <div className="card-title">{title}</div>}
          {extra && <div className="card-title-extra">{extra}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  )
})
