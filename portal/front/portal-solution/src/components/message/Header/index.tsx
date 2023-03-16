import React from 'react'
import classNames from 'classnames'

import logoPNG from './logo.png'

import './style.less'

const prefixCls = 'message-header'

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
        <div className={`${prefixCls}-text-title`}>统一消息触达解决方案</div>
        <div
          className={`${prefixCls}-text-content`}
        >七牛云统一消息触达解决方案提供了包括短信、5G消息、微信、钉钉、客户端APP等多种消息触达客户通道，支持预设消息内容与变量，规范消息格式；
          提供推送统计报表、消息历史报表、用户触达分析，整合各通道的推送统计结果，从渠道、通道、用户多维度分析转换率，以进行针对性促活。
        </div>
      </div>
    </div>
  )
}
