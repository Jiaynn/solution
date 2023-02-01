/*
 * @file component Contact Form of SSLOverview
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FormState, FieldState } from 'formstate-x'

import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import Switch from 'react-icecream/lib/switch'
import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'

import { bindFormItem, bindTextInput, bindSwitch } from 'portal-base/common/form'

import { IBaseContact } from '../../../../apis/ssl'
import NameInput, { createState as createNameState, defaultName } from '../../../common/NameInput'
import {
  notEmpty, emailValid, mobilephoneValid
} from '../../../../utils/validate'

import './style.less'

export type IValue = IBaseContact

export type IState = FormState<{
  remarkName: FieldState<string>
  name: ReturnType<typeof createNameState>
  position: FieldState<string>
  phone: FieldState<string>
  email: FieldState<string>
  isDefault: FieldState<boolean>
}>

const defaultContact: IBaseContact = {
  remarkName: '',
  position: '',
  phone: '',
  email: '',
  isDefault: false,
  ...defaultName
}

export function createState(value?: IValue, getNeedRemarkName?: () => boolean): IState {
  value = {
    ...defaultContact,
    ...value
  }
  return new FormState({
    remarkName: new FieldState(value.remarkName)
      .validators(notEmpty)
      .disableValidationWhen(() => (getNeedRemarkName ? !getNeedRemarkName() : false)),
    name: createNameState({ firstName: value.firstName, lastName: value.lastName }),
    position: new FieldState(value.position).validators(notEmpty),
    phone: new FieldState(value.phone).validators(notEmpty, mobilephoneValid),
    email: new FieldState(value.email).validators(notEmpty, emailValid),
    isDefault: new FieldState(value.isDefault)
  })
}

export function getValue(state: IState): IValue {
  const { name, ...otherValue } = state.value
  return {
    ...name,
    ...otherValue
  }
}

export interface IContactFormProps {
  state: IState
  needRemarkName?: boolean
}

export default observer(function _ContactForm(props: IContactFormProps) {
  const { state, needRemarkName = true } = props
  return (
    <Form layout="horizontal">
      <Form.Item {...bindFormItem(state.$.remarkName)}
        required={needRemarkName}
        label={
          <span>
            备注名称
            <Tooltip title="备注名称用于区分要保存的不同联系人信息。若不保存，则无需输入备注名称。"><Icon className="tip-icon" type="info-circle" /></Tooltip>
          </span>
        }
      >
        <Input {...bindTextInput(state.$.remarkName)} disabled={!needRemarkName} placeholder="请输入备注名称" />
      </Form.Item>
      <Form.Item {...bindFormItem(state.$.name)} required label="姓/名">
        <NameInput state={state.$.name} />
      </Form.Item>
      <Form.Item {...bindFormItem(state.$.position)} required label="职位">
        <Input {...bindTextInput(state.$.position)} placeholder="请输入职位" />
      </Form.Item>
      <Form.Item {...bindFormItem(state.$.phone)} required label="手机号">
        <Input {...bindTextInput(state.$.phone)} placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item {...bindFormItem(state.$.email)} required label="邮箱">
        <Input {...bindTextInput(state.$.email)} placeholder="请输入邮箱" />
      </Form.Item>
      <Form.Item required label="设置为默认" labelAlign="left" labelCol={{ span: 6 }} wrapperCol={{ span: 8 }}>
        <Switch {...bindSwitch(state.$.isDefault)} />
      </Form.Item>
    </Form>
  )
})
