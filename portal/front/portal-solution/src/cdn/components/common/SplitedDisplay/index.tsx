/**
 * @file component SplitedDisplay
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 * @description 将流量、带宽、请求数数据进行拆分显示，通常是数字需要跟单位样式不一致的情况，数据源如 “12.12 mb”，“58 次”
 */

import React from 'react'

import { splitMixedValue } from 'cdn/transforms/unit'

import './style.less'

export interface IProps {
  value: string
}

export default function SplitedDisplay(props: IProps) {
  const { value, unit } = splitMixedValue(props.value)

  return (
    <div className="comp-splited-display">
      <span className="splited-value">{value}</span>
      <span className="splited-unit">{unit}</span>
    </div>
  )
}
