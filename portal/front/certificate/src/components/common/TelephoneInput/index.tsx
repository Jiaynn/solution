/*
 * @file component TelephoneInput used to display landed field
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FormState, FieldState } from 'formstate-x'

import Input from 'react-icecream/lib/input'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import { bindTextInput } from 'portal-base/common/form'

import { notEmpty, areaCodeValid, telephoneValid } from '../../../utils/validate'

export interface ITelephoneValue {
  areaCode: string
  phoneNumber: string
}

export const defaultTelephone = {
  areaCode: '',
  phoneNumber: ''
}

export function createState(value?: ITelephoneValue) {
  value = {
    ...defaultTelephone,
    ...value
  }
  return new FormState({
    areaCode: new FieldState(value.areaCode),
    phoneNumber: new FieldState(value.phoneNumber)
  }).validators(
    telephoneValue => notEmpty(telephoneValue.areaCode) || notEmpty(telephoneValue.phoneNumber)
    || areaCodeValid(telephoneValue.areaCode) || telephoneValid(telephoneValue.phoneNumber)
  )
}

export interface ITelephoneInputProps {
  state: ReturnType<typeof createState>
}

export default observer(function _TelephoneInput({ state }: ITelephoneInputProps) {
  return (
    <Row type="flex" justify="space-between" align="middle" gutter={20}>
      <Col span={8}>
        <Input {...bindTextInput(state.$.areaCode)} placeholder="请输入区号" />
      </Col>
      <Col span={16}>
        <Input {...bindTextInput(state.$.phoneNumber)} placeholder="请输入电话号码" />
      </Col>
    </Row>
  )
})
