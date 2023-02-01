/*
 * @file component Contact Form of SSLOverview
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FormState, FieldState, bindInput } from 'formstate-x'

import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import Switch from 'react-icecream/lib/switch'
import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'

import { bindFormItem, bindTextInput, bindSwitch } from 'portal-base/common/form'

import AreaSelect, { IAreaValue, defaultArea } from '../../../common/AreaSelect'
import TelephoneInput, { defaultTelephone, createState as createTelephoneState } from '../../../common/TelephoneInput'
import { IBaseCompany } from '../../../../apis/ssl'
import { areaValue2Props, areaValue2Api } from '../../../../transforms/complete'
import {
  notEmpty, inputValid, mustContainChinese, postCodeValid
} from '../../../../utils/validate'

import './style.less'

export type IValue = IBaseCompany

export type IState = FormState<{
  name: FieldState<string>
  remarkName: FieldState<string>
  division: FieldState<string>
  area: FieldState<IAreaValue>
  address: FieldState<string>
  postCode: FieldState<string>
  phone: ReturnType<typeof createTelephoneState>
  isDefault: FieldState<boolean>
}>

const defaultCompany: IBaseCompany = {
  phone: '-',
  name: '',
  remarkName: '',
  division: '',
  address: '',
  postCode: '',
  isDefault: false,
  ...areaValue2Api(defaultArea),
  ...defaultTelephone
}

export function createState(value?: IValue, getNeedRemarkName?: () => boolean): IState {
  value = {
    ...defaultCompany,
    ...value
  }
  const [areaCode, phoneNumber] = value.phone.split('-')
  return new FormState({
    name: new FieldState(value.name).validators(notEmpty, inputValid, nameValue => mustContainChinese(nameValue, '公司名称')),
    remarkName: new FieldState(value.remarkName)
      .validators(notEmpty, inputValid)
      .disableValidationWhen(() => (getNeedRemarkName ? !getNeedRemarkName() : false)),
    division: new FieldState(value.division).validators(notEmpty, inputValid),
    area: new FieldState(areaValue2Props(value)).validators(
      (areaValue: any) => notEmpty(areaValue || areaValue.country || areaValue.province || areaValue.city)
    ),
    address: new FieldState(value.address).validators(notEmpty, inputValid),
    postCode: new FieldState(value.postCode).validators(notEmpty, postCodeValid),
    phone: createTelephoneState({ areaCode, phoneNumber }),
    isDefault: new FieldState(value.isDefault)
  })
}

export function getValue(state: IState): IValue {
  const { area, phone, ...otherValue } = state.value
  return {
    ...otherValue,
    ...areaValue2Api(area),
    phone: `${phone.areaCode}-${phone.phoneNumber}`
  }
}

export interface ICompanyFormProps {
  state: IState
  needRemarkName?: boolean
}

export default observer(function _CompanyForm(props: ICompanyFormProps) {
  const { state, needRemarkName = true } = props
  return (
    <Form layout="horizontal">
      <Form.Item {...bindFormItem(state.$.remarkName)}
        required={needRemarkName}
        label={
          <span>
            备注名称
            <Tooltip title="备注名称用于区分要保存的不同公司信息。若不保存，则无需输入备注名称。"><Icon className="tip-icon" type="info-circle" /></Tooltip>
          </span>
        }
      >
        <Input {...bindTextInput(state.$.remarkName)} disabled={!needRemarkName} placeholder="请输入备注名称" />
      </Form.Item>
      <Form.Item {...bindFormItem(state.$.name)} required label="公司名称">
        <Input {...bindTextInput(state.$.name)} placeholder="请输入公司名称" />
      </Form.Item>
      <Form.Item {...bindFormItem(state.$.division)} required label="部门">
        <Input {...bindTextInput(state.$.division)} placeholder="请输入部门" />
      </Form.Item>
      <Form.Item {...bindFormItem(state.$.phone)} required label="座机电话">
        <TelephoneInput state={state.$.phone} />
      </Form.Item>
      <Form.Item {...bindFormItem(state.$.area)} required label="国家/省份/城市">
        <AreaSelect {...bindInput(state.$.area)} />
      </Form.Item>
      <Form.Item {...bindFormItem(state.$.address)} required label="地址">
        <Input {...bindTextInput(state.$.address)} placeholder="请输入地址" />
      </Form.Item>
      <Form.Item {...bindFormItem(state.$.postCode)} required label="邮编">
        <Input {...bindTextInput(state.$.postCode)} placeholder="请输入邮编" />
      </Form.Item>
      <Form.Item required label="设置为默认" labelAlign="left" labelCol={{ span: 6 }} wrapperCol={{ span: 8 }}>
        <Switch {...bindSwitch(state.$.isDefault)} />
      </Form.Item>
    </Form>
  )
})
