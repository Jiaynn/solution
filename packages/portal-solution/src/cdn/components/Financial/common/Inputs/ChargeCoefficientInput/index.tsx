/**
 * @file Charge Coefficient Input Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Form, { FormItemProps } from 'react-icecream/lib/form'
import InputNumber from 'react-icecream/lib/input-number'
import { bindFormItem, bindInputNumber } from 'portal-base/common/form'

import { transformCoefficientForSave, transformCoefficientForEdit } from 'cdn/transforms/financial'

import { defaultChargeCoefficient } from 'cdn/constants/oem'

export type Value = number
export type State = FieldState<number>

export function createState(arg?: Value): State {
  const value = !arg
    ? defaultChargeCoefficient
    : transformCoefficientForEdit(arg)
  return new FieldState(value)
}

export function getValue(state: State) {
  return transformCoefficientForSave(state.value)
}

export interface IInputProps {
  state: State
}

const ChargeCoefficientInput = observer(function _ChargeCoefficientInput(props: IInputProps) {
  return (
    <InputNumber
      style={{ width: '100%' }}
      min={0.01}
      step={0.01}
      placeholder="请输入计费系数"
      {...bindInputNumber(props.state)}
    />
  )
})

export interface IProps extends FormItemProps {
  state: State
}

const ChargeCoefficientFormItem = observer(function _ChargeCoefficientFormItem(props: IProps) {
  const { state, ...restProps } = props

  return (
    <Form.Item
      label="计费系数"
      colon={false}
      extra="计费系数只保留两位小数"
      {...bindFormItem(state)}
      {...restProps}
    >
      <ChargeCoefficientInput state={state} />
    </Form.Item>
  )
})

export default ChargeCoefficientFormItem
