/**
 * @file 告警列表项
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import classnames from 'classnames'

import { transformAlarmTypeUnitForDisplay, bps2Mbps, byte2Gbyte } from 'cdn/transforms/alarm'

import { AlarmType, ThresholdType, alarmTypeNameMap, thresholdNameMap, dataPointNumTypeNameMap } from 'cdn/constants/alarm'

import { MetricsItem } from 'cdn/apis/alarm/rule'

import './style.less'

export interface Props {
  item: MetricsItem
  className?: string
}

function convertThresholdVal(type: AlarmType, thresholdType: ThresholdType, value: number) {
  if (thresholdType === ThresholdType.RingDrop
    || thresholdType === ThresholdType.RingSwing
    || thresholdType === ThresholdType.RingRise) {
    return value
  }
  switch (type) {
    case AlarmType.Bandwidth: {
      return bps2Mbps(value)
    }
    case AlarmType.Traffic: {
      return byte2Gbyte(value)
    }
    default: {
      return value
    }
  }
}

@observer
export default class RuleConfigMetricsItem extends React.Component<Props> {

  constructor(props: Props) {
    super(props)
    makeObservable(this)
  }

  @computed get thresholdValueView() {
    const { item } = this.props
    const { thresholdType } = this.props.item.threshold
    const unit = transformAlarmTypeUnitForDisplay(item.alarmType, item.threshold.thresholdType)
    const value = convertThresholdVal(item.alarmType, item.threshold.thresholdType, item.threshold.thresholdVal!)
    if (thresholdType === ThresholdType.RingRise
      || thresholdType === ThresholdType.RingDrop
      || thresholdType === ThresholdType.RingSwing) {
      return `超过 ${value! * 100}${unit}`
    }
    if (unit === '%') {
      return ` ${value! * 100}${unit}`
    }
    return ` ${value} ${unit}`
  }

  @computed get descView() {
    const { item } = this.props
    const alarmTypeDesc = item.alarmType !== AlarmType.StatusCode
      ? alarmTypeNameMap[item.alarmType]
      : `${alarmTypeNameMap[item.alarmType]}${item.alarmSubType}`
    return (
      <div className="alarm-field-input-desc">
        <span className="alarm-type">
          {alarmTypeDesc}:
        </span>
        <span className="alarm-field-input-value">
          {dataPointNumTypeNameMap[item.dataPointNum]}
          {thresholdNameMap[item.threshold.thresholdType]}
          {this.thresholdValueView}
        </span>
      </div>
    )
  }

  render() {
    const wrapperClassName = classnames(
      'alarm-field-input-wrapper', this.props.className
    )
    return (
      <div className={wrapperClassName}>
        {this.descView}
      </div>
    )
  }
}
