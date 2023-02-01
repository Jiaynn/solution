/**
 * @file 阈值输入
 * @author zhouhang <zhouhang@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import {
  FormItem,
  InputGroup,
  InputGroupItem,
  NumberInput,
  Select,
  SelectOption as Option
} from 'react-icecream-2/form-x'

import { AlarmType, alarmTypeNameMap, ThresholdType, thresholdTypeOptions } from 'cdn/constants/alarm'

import { ThresholdItem } from 'cdn/apis/alarm/rule'

export type Value = ThresholdItem

export const defaultValue: Value = {
  thresholdType: ThresholdType.Above,
  thresholdVal: null
}

export type State = FormState<{
  thresholdType: FieldState<ThresholdType>
  thresholdVal: FieldState<number | null>
}>

export function getValue(state?: State): Value | undefined {
  if (!state) {
    return
  }

  return {
    thresholdType: state.$.thresholdType.value,
    thresholdVal: state.$.thresholdVal.value || null
  }
}

export function createState(value: Value = defaultValue, alarmTypeState: FieldState<AlarmType>) : State {
  const { thresholdType = ThresholdType.Above, thresholdVal } = value
  const typeState = new FieldState<ThresholdType>(thresholdType)
  const thresholdState = new FieldState(thresholdVal).validators(thresholdValue => {
    if (thresholdValue == null) {
      return '请输入阈值'
    }
    const isRing = [
      ThresholdType.RingSwing, ThresholdType.RingDrop, ThresholdType.RingRise
    ].includes(typeState.value)
    const isPercentUnit = ([
      AlarmType.TrafficHitRate, AlarmType.ReqHitRate, AlarmType.StatusCode
    ].includes(alarmTypeState.value!) || isRing)
    const unit = isPercentUnit ? '%' : ''
    const errorPrefix = alarmTypeState.value ? alarmTypeNameMap[alarmTypeState.value] : ''

    if (+thresholdValue <= 0) {
      return `${errorPrefix}阈值不能输入 0 或负数`
    }

    if (isPercentUnit) {
      if (!isRing && thresholdValue >= 100) {
        return `${errorPrefix}阈值不能输入超过 100${unit} 的数值`
      }
    }
  })

  return new FormState({
    thresholdType: typeState,
    thresholdVal: thresholdState
  })
}

export interface Props {
  state: State
  unit: string
  disabled?: boolean
}

export default observer(function ThresholdInput(props: Props) {
  const { state, disabled } = props
  const isRing = [
    ThresholdType.RingSwing, ThresholdType.RingDrop, ThresholdType.RingRise
  ].includes(state.$.thresholdType.value)
  const moreThan = isRing && '超过'

  return (
    <>
      <div className="threshold-input-wrapper">
        <FormItem>
          <Select
            className="threshold-input-wrapper-select"
            state={state.$.thresholdType}
            disabled={disabled}
          >
            {thresholdTypeOptions.map((type, index) => (
              <Option value={type.value} key={index}>{type.label}</Option>))}
          </Select>
        </FormItem>
        <div className="threshold-input-wrapper-value">
          <FormItem>
            <InputGroup style={{ width: '13em' }}>
              <NumberInput
                disabled={disabled}
                prefix={moreThan}
                digits={2}
                step={0.1}
                state={state.$.thresholdVal}
              />
              <InputGroupItem> {props.unit} </InputGroupItem>
            </InputGroup>
          </FormItem>
        </div>
      </div>
    </>
  )
})
