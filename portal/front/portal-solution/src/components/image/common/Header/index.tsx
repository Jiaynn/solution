import React from 'react'
import classNames from 'classnames'

import logoPNG from './logo.png'

import './style.less'

const prefixCls = 'comp-configuration-header'

export interface HeaderProps {
  className?: string
  style?: React.CSSProperties
}

export const Header: React.FC<HeaderProps> = props => {
  const { className, style } = props

  return (
    <div className={classNames(prefixCls, className)} style={style}>
      <img className={`${prefixCls}-img`} src={logoPNG} alt="logo" />
      <div className={`${prefixCls}-text`}>
        <div className={`${prefixCls}-text-title`}>图片存储分发处理解决方案</div>
        <div
          className={`${prefixCls}-text-content`}
        >针对有海量用户生成内容的场景。七牛云存储服务的高并发能力使您灵活应对大流量的业务场景。您可以对存储在云端的图片文件进行数据处理。
        </div>
      </div>
    </div>
  )
}
