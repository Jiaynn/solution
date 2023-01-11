/**
 * @file Charge Type Input Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Radio from 'react-icecream/lib/radio'
import Form, { FormItemProps } from 'react-icecream/lib/form'
import { bindFormItem, bindRadioGroup } from 'portal-base/common/form'

import { ChargeType, chargeTypeValues, chargeTypeTextMap } from 'cdn/constants/oem'

export type Value = ChargeType
export type State = FieldState<Value>

export function createState(value?: Value): State {
  return new FieldState(value || ChargeType.Traffic)
}

export function getValue(state: State): Value {
  return state.value
}

export interface IChargeTypeInputProps {
  state: State
}

export const ChargeTypeInput = observer(function _ChargeTypeInput(props: IChargeTypeInputProps) {
  const options = chargeTypeValues.map(type => (
    <Radio key={type} value={type}>
      {chargeTypeTextMap[type]}
    </Radio>
  ))

  return (
    <Radio.Group
      {...bindRadioGroup(props.state)}
    >
      {options}
    </Radio.Group>
  )
})

export interface IProps extends FormItemProps {
  state: State
}

const ChargeTypeFormItem = observer(function _ChargeTypeFormItem(props: IProps) {
  const { state, ...restProps } = props

  return (
    <Form.Item
      label="计费类型"
      colon={false}
      {...bindFormItem(state)}
      {...restProps}
    >
      <ChargeTypeInput state={state} />
    </Form.Item>
  )
})

export default ChargeTypeFormItem
