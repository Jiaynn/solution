/**
 * @file component 简化版卡片
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import Card from 'react-icecream/lib/card'

import './style.less'

export interface IProps {
  loading?: boolean
  style?: React.CSSProperties
}

export default function SimplifyCard(props: React.PropsWithChildren<IProps>) {
  return (
    <Card
      bordered={false}
      loading={props.loading}
      style={props.style}
      className="comp-overview-simplify-card"
    >
      {props.children}
    </Card>
  )
}
