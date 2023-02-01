/**
 * @file 告警项选择输入，即监控项中的每一行，由多个输入组件组合而成
 * @author gaopeng <gaopeng01@qiniu.com>
 */

import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { FormState } from 'formstate-x'
import { CloseIcon } from 'react-icecream-2/icons'

import { transformAlarmTypeUnitForDisplay, bps2Mbps, mbps2Bps, byte2Gbyte, gbyte2Byte } from 'cdn/transforms/alarm'

import { AlarmType, ThresholdType } from 'cdn/constants/alarm'

import { MetricsItem, ThresholdItem } from 'cdn/apis/alarm/rule'

import RuleInput, * as ruleInput from './RuleInput'
import ThresholdInput, * as thresholdInput from './ThresholdInput'
import DataPointNumInput, * as dataPointNumInput from './DataPointNumInput'

export type Value = MetricsItem

export type State = FormState<{
  rule: ruleInput.State
  threshold: thresholdInput.State
  dataPointNum: dataPointNumInput.State
}>

export const defaultAlarmItemValue: Value = packageAlarmItem(
  ruleInput.defaultValue,
  thresholdInput.defaultValue,
  dataPointNumInput.defaultValue
)

export function createState(value: Value = defaultAlarmItemValue): State {
  const threshold = forThresholdInput(value.threshold, value.alarmType)
  const ruleState = ruleInput.createState({
    alarmType: value.alarmType,
    alarmSubType: value.alarmSubType
  })
  const dataPointNumState = dataPointNumInput.createState(value.dataPointNum)
  return new FormState({
    rule: ruleState,
    threshold: thresholdInput.createState(threshold, ruleState.$.alarmType),
    dataPointNum: dataPointNumState
  })
}

export function getValue(state: State): Value {
  const rule = ruleInput.getValue(state.$.rule)
  const threshold = fromThresholdInput(thresholdInput.getValue(state.$.threshold)!, rule.alarmType!)!
  const dataPointNum = dataPointNumInput.getValue(state.$.dataPointNum)
  return packageAlarmItem(
    rule,
    threshold,
    dataPointNum
  )
}

export interface Props {
  state: State
  onDelete(): void
  deletable: boolean
  disabled?: boolean
}

@observer
export default class AlarmItemInput extends React.Component<Props> {

  constructor(props: Props) {
    super(props)
    makeObservable(this)
  }

  @computed
  get thresholdUnit(): string {
    const alarmType = this.props.state.$.rule.$.alarmType.value!
    const threshold = this.props.state.$.threshold.$.thresholdType.value!
    return transformAlarmTypeUnitForDisplay(alarmType, threshold)
  }

  @computed
  get operationView() {
    const { onDelete } = this.props
    return (
      <div className="opreations-wrapper">
        <CloseIcon className="delete-btn" onClick={onDelete} />
      </div>
    )
  }

  render() {
    const { state, deletable, disabled } = this.props
    const wrapperClassName = classnames(
      'alarm-item-input-wrapper', { error: state.hasError }
    )
    return (
      <div className={wrapperClassName}>
        <RuleInput disabled={disabled} state={state.$.rule} />
        <ThresholdInput disabled={disabled} state={state.$.threshold} unit={this.thresholdUnit} />
        <DataPointNumInput disabled={disabled} state={state.$.dataPointNum} />
        {deletable && this.operationView}
      </div>
    )
  }
}

function packageAlarmItem(rule: ruleInput.Value,
  threshold: thresholdInput.Value,
  dataPointNum: dataPointNumInput.Value): MetricsItem {
  return {
    alarmType: rule.alarmType!,
    alarmSubType: rule.alarmSubType!,
    dataPointNum,
    threshold
  }
}

function forThresholdInput(threshold: ThresholdItem, alarmType: AlarmType): ThresholdItem {
  if (threshold == null
    || (alarmType !== AlarmType.Bandwidth && alarmType !== AlarmType.Traffic)
    || threshold.thresholdType === ThresholdType.RingDrop
    || threshold.thresholdType === ThresholdType.RingRise
    || threshold.thresholdType === ThresholdType.RingSwing) {
    return {
      ...threshold,
      thresholdVal: threshold.thresholdVal! * 100
    }
  }

  if (alarmType === AlarmType.Bandwidth) {
    return {
      ...threshold,
      thresholdVal: bps2Mbps(threshold.thresholdVal)
    }
  }

  // Traffic
  return {
    ...threshold,
    thresholdVal: byte2Gbyte(threshold.thresholdVal)
  }
}

function fromThresholdInput(threshold: ThresholdItem, alarmType: string): ThresholdItem {
  if (threshold == null
    || (alarmType !== AlarmType.Bandwidth && alarmType !== AlarmType.Traffic)
    || threshold.thresholdType === ThresholdType.RingDrop
    || threshold.thresholdType === ThresholdType.RingRise
    || threshold.thresholdType === ThresholdType.RingSwing) {
    return {
      ...threshold,
      thresholdVal: threshold.thresholdVal! * 0.01 // 用户输入 1（%） 传给后端的值为实际代表的值 0.01
    }
  }

  if (alarmType === AlarmType.Bandwidth) {
    return {
      ...threshold,
      thresholdVal: mbps2Bps(threshold.thresholdVal)
    }
  }

  // Traffic
  return {
    ...threshold,
    thresholdVal: gbyte2Byte(threshold.thresholdVal)
  }
}
