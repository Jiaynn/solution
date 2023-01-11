/**
 * @file: component 证书年限提示
 * @author: liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'

import HelpLink from '../HelpLink'

import './style.less'

export interface ISSLYearTipsProps {
  year: number
  style?: React.CSSProperties
}

const SSLYearTips: React.FC<ISSLYearTipsProps> = ({ year, style }) => {
  if (year === 2) {
    return (
      <p className="comp-ssl-years-tips" style={style}>
        2 年续期证书由两张 1 年期证书组成，可以在第一张证书到期之前，自动续购新证书，同时新证书将自动部署至之前绑定的 CDN 加速域名。购买 2 年续期证书可以享受更低折扣，详情参见&nbsp;
        <HelpLink href="https://developer.qiniu.com/ssl/manual/7129/2-year-renewal-certificate">产品文档</HelpLink>
      </p>
    )
  }

  return null
}

export default SSLYearTips
