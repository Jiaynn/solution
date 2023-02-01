/**
 * @file component EmptyBlock
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 * @description 用作无数据的展示
 */

import React from 'react'
import cx from 'classnames'

import SmileIcon from './Smile.svg'
import SadIcon from './Sad.svg'

import './style.less'

export interface IProps {
  className?: string
  children: React.ReactNode
  type?: 'sad' | 'smile'
}

export default function EmptyBlock({ className, children, type = 'smile' }: IProps) {
  const IconSvg = type === 'smile' ? SmileIcon : SadIcon

  return (
    <div className={cx('comp-empty-block', className)}>
      <IconSvg className="empty-svg" />
      <p className="empty-tips">{children}</p>
    </div>
  )
}
