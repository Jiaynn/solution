/**
 * @file 统计项
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { isNil } from 'lodash'
import Col from 'react-icecream/lib/col'
import classNames from 'classnames'

import { humanizePercent100 } from 'cdn/transforms/unit'

import SplitedDisplay from 'cdn/components/common/SplitedDisplay'

import SimplifyCard from '../../SimplifyCard'
import UpSvg from '../../../images/up.svg'
import DownSvg from '../../../images/down.svg'

import './style.less'

export interface ISummaryCardProps {
  title: string
  loading: boolean
  value: string | null
  increase: number | null
  colSpan?: number
}

export interface ITrendProps {
  value: number
}

function Trend({ value }: ITrendProps) {
  const isIncrease = value > 0
  const TrendSvg = isIncrease ? UpSvg : DownSvg

  return (
    <div className={classNames('summary-trend', `trend-${isIncrease ? 'up' : 'down'}`)}>
      <TrendSvg className="trend-svg" />
      <span className="trend-value">
        {isIncrease && '+'}
        {humanizePercent100(value)}
      </span>
    </div>
  )
}

export default observer(function SummaryCard(props: ISummaryCardProps) {
  const { value, loading, title, increase, colSpan = 8 } = props
  const content = isNil(value) ? '--' : <SplitedDisplay value={value} />

  return (
    <Col span={colSpan} className="comp-overview-summary">
      <SimplifyCard
        loading={loading}
        style={{ height: 88 }}
      >
        <div className="summary-title">{title}</div>
        <div className="summary-value">{content}</div>
        {!isNil(increase) && <Trend value={increase} />}
      </SimplifyCard>
    </Col>
  )
})
