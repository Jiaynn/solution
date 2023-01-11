/*
 * @file AddDomain Domain Form component
 * @author zhu hao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FormState } from 'formstate-x'

import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import { bindFormItem } from 'portal-base/common/form'

import MultiDomainInput, {
  domainsValidate, cannotContainCommonName,
  createState as createDomainState, Value as DomainValue } from '../common/MultiDomainInput'
import { IOrderDetail } from '../../apis/ssl'
import { SSLDomainType } from '../../constants/ssl'
import { isMultiDomain } from '../../transforms/complete'

export type IValue = DomainValue

export type IState = FormState<{
  dnsNames: ReturnType<typeof createDomainState>
}>

export function createState(value?: IValue, order?: IOrderDetail): IState {
  const form = new FormState({
    dnsNames: createDomainState(value || [])
  })
  if (order) {
    const { product_type, common_name } = order
    form.$.dnsNames.validators(
      dnsNamesValue => cannotContainCommonName(dnsNamesValue, common_name)
      || domainsValidate(product_type, dnsNamesValue)
    )
  }
  return form
}

export interface IDomainFormProps {
  state: IState
  domain: string
  type?: SSLDomainType
  bindedDomains: string[]
}

export default observer(function _DomainForm(props: IDomainFormProps) {
  const { state, domain, type, bindedDomains } = props
  return (
    <Form layout="horizontal" style={{ width: '592px' }}>
      <Form.Item
        label="域名（通用名称）"
        required
      >
        <Input value={domain} disabled />
      </Form.Item>
      {
        isMultiDomain(type) && (
          <Form.Item
            {...bindFormItem(state.$.dnsNames)}
            label="多域名（DNS Names）"
            required
          >
            <MultiDomainInput state={state.$.dnsNames} bindedDomains={bindedDomains} />
          </Form.Item>
        )
      }
    </Form>
  )
})
