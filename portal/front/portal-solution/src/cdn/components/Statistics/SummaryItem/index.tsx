/*
 * @file 统计项展示组件
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'

import { humanizeTimeStamp } from 'cdn/transforms/datetime'

import SplitedDisplay from 'cdn/components/common/SplitedDisplay'

import './style.less'

export interface IProps {
  title: React.ReactNode
  value: string | null
  time?: number
  isLoading?: boolean
}

export default observer(function SummaryItem(props: IProps) {
  const { title, value, time, isLoading } = props

  const valueContent = (isLoading || value == null) ? '--' : <SplitedDisplay value={value} />
  const timeContent = time != null ? <div className="summary-item-time">{humanizeTimeStamp(time, 'YYYY-MM-DD HH:mm')}</div> : null

  return (
    <div className="comp-statistics-summary-item">
      <div className="summary-item-title">{title}</div>
      <div className="summary-item-value">{valueContent}</div>
      {timeContent}
    </div>
  )
})
