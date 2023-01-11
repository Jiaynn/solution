/**
 * @file Charge Radix Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Select from 'react-icecream/lib/select'
import Form, { FormItemProps } from 'react-icecream/lib/form'
import { bindSelect, bindFormItem } from 'portal-base/common/form'

import { ChargeRadix, chargeRadixValues } from 'cdn/constants/oem'

export type Value = ChargeRadix
export type State = FieldState<Value>

export function createState(value?: Value): State {
  return new FieldState(value || ChargeRadix.Radix1000)
}

export function getValue(state: State): Value {
  return state.value
}

export interface IInputProps {
  state: State
}

export const ChargeRadixInput = observer(function _ChargeRadixInput(props: IInputProps) {
  const selectOptions = chargeRadixValues.map(value => (
    <Select.Option key={value} value={value}>
      {value}
    </Select.Option>
  ))

  return (
    <Select
      placeholder="请选择计费进制"
      {...bindSelect(props.state)}
    >
      {selectOptions}
    </Select>
  )
})

export interface IProps extends FormItemProps {
  state: State
}

const ChargeRadixFormItem = observer(function _ChargeRadixFormItem(props: IProps) {
  const { state, ...restProps } = props

  return (
    <Form.Item
      label="计费进制"
      colon={false}
      {...bindFormItem(state)}
      {...restProps}
    >
      <ChargeRadixInput state={state} />
    </Form.Item>
  )
})

export default ChargeRadixFormItem
