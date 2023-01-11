/**
 * @file Unit Price Input Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Input from 'react-icecream/lib/input'
import Form, { FormItemProps } from 'react-icecream/lib/form'
import { bindFormItem, bindTextInput } from 'portal-base/common/form'

import { transformCentToYuan, transformYuanToCent } from 'cdn/transforms/financial'

import { chargeUnitTextMap, ChargeType } from 'cdn/constants/oem'

export type Value = number
export type State = FieldState<string>

export function createState(value?: number) {
  return new FieldState(value ? String(transformCentToYuan(value)) : '')
    .validators(v => (!v || Number(v) <= 0) && '请输入合法的单价')
}

export function getValue(state: State): Value {
  return transformYuanToCent(parseFloat(state.value))
}

export interface IInputProps {
  state: State
  chargeType: ChargeType
}

const UnitPriceInput = observer(function _UnitPriceInput(props: IInputProps) {
  return (
    <Input
      placeholder="请输入单价"
      addonAfter={chargeUnitTextMap[props.chargeType]}
      {...bindTextInput(props.state)}
    />
  )
})

export interface IProps extends FormItemProps {
  state: State
  chargeType: ChargeType
}

const UnitPriceFormItem = observer(function _UnitPriceFormItem(props: IProps) {
  const { state, chargeType, ...restProps } = props

  return (
    <Form.Item
      label="计费单价"
      colon={false}
      extra="计费单价精确到分"
      {...bindFormItem(state)}
      {...restProps}
    >
      <div>
        <UnitPriceInput chargeType={chargeType} state={state} />
      </div>
    </Form.Item>
  )
})

export default UnitPriceFormItem
