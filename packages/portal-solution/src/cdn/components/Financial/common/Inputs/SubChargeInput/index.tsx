/**
 * @file SubChargeType Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Form, { FormItemProps } from 'react-icecream/lib/form'
import Select from 'react-icecream/lib/select'
import { bindSelect, bindFormItem } from 'portal-base/common/form'

import { SubChargeType, subChargeTypeValues, subChargeTypeTextMap } from 'cdn/constants/oem'

export type Value = SubChargeType
export type State = FieldState<Value>

export function createState(value?: Value): State {
  return new FieldState(value || SubChargeType.Month95)
}

export function getValue(state: State): Value {
  return state.value
}

export interface IInputProps {
  state: State
}

export const SubChargeTypeInput = observer(function _SubChargeTypeInput(props: IInputProps) {
  const selectOptions = subChargeTypeValues.map(type => (
    <Select.Option key={type} value={type}>
      {subChargeTypeTextMap[type]}
    </Select.Option>
  ))

  return (
    <Select
      {...bindSelect(props.state)}
    >
      {selectOptions}
    </Select>
  )
})

export interface IProps extends FormItemProps {
  state: State
}

const SubChargeTypeFormItem = observer(function _SubChargeTypeFormItem(props: IProps) {
  const { state, ...restProps } = props

  return (
    <Form.Item
      label=" "
      colon={false}
      {...bindFormItem(state)}
      {...restProps}
    >
      <SubChargeTypeInput state={state} />
    </Form.Item>
  )
})

export default SubChargeTypeFormItem
