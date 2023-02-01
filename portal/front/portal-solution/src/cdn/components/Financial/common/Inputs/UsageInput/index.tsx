/**
 * @file Usage Input Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Input from 'react-icecream/lib/input'
import Form, { FormItemProps } from 'react-icecream/lib/form'
import { bindFormItem, bindTextInput } from 'portal-base/common/form'

import { transformUsageForEdit, transformUsageForSave } from 'cdn/transforms/financial'

import { chargeTypeUnitTextMap, ChargeType } from 'cdn/constants/oem'

export type Value = number
export type State = FieldState<string>

export function createState(chargeType: ChargeType, arg?: number) {
  let state: State
  if (arg == null) {
    state = new FieldState('')
  } else {
    state = new FieldState(transformUsageForEdit(arg, chargeType))
  }

  return state.validators(
    v => (v == null || v === '') && '请输入使用量'
  )
}

// 用户输入：流量：GB，带宽：Mpbs
// 转换：流量->bytes，带宽=>bps
export function getValue(state: State, chargeType: ChargeType): Value {
  const rawVal = parseFloat(state.value)
  return transformUsageForSave(rawVal, chargeType)
}

export interface IInputProps {
  state: State
  chargeType: ChargeType
}

const UsageInput = observer(function _UsageInput(props: IInputProps) {
  return (
    <Input
      placeholder="请输入用量"
      addonAfter={chargeTypeUnitTextMap[props.chargeType]}
      {...bindTextInput(props.state)}
    />
  )
})

export interface IProps extends FormItemProps {
  state: State
  chargeType: ChargeType
}

const UsageFormItem = observer(function _UsageFormItem(props: IProps) {
  const { state, chargeType, ...restProps } = props

  return (
    <Form.Item
      label="月使用量"
      colon={false}
      extra="使用量保留 4 位小数"
      {...bindFormItem(state)}
      {...restProps}
    >
      <UsageInput chargeType={chargeType} state={state} />
    </Form.Item>
  )
})

export default UsageFormItem
