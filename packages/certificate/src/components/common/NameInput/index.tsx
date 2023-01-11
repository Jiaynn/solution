/*
 * @file component NameInput
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FormState, FieldState } from 'formstate-x'

import Input from 'react-icecream/lib/input'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'

import { bindTextInput } from 'portal-base/common/form'

import { notEmpty } from '../../../utils/validate'

export interface INameValue {
  firstName: string
  lastName: string
}

export const defaultName: INameValue = {
  firstName: '',
  lastName: ''
}

export function createState(value?: INameValue) {
  value = {
    ...defaultName,
    ...value
  }
  return new FormState({
    firstName: new FieldState(value.firstName),
    lastName: new FieldState(value.lastName)
  }).validators(
    nameValue => notEmpty(nameValue.firstName) || notEmpty(nameValue.lastName)
  )
}

export interface INameInputProps {
  state: ReturnType<typeof createState>
}

export default observer(function _NameInput(props: INameInputProps) {
  const { state } = props
  return (
    <Row type="flex" justify="space-between" align="middle" gutter={20}>
      <Col span={12}>
        <Input {...bindTextInput(state.$.lastName)} placeholder="请输入姓" />
      </Col>
      <Col span={12}>
        <Input {...bindTextInput(state.$.firstName)} placeholder="请输入名" />
      </Col>
    </Row>
  )
})
