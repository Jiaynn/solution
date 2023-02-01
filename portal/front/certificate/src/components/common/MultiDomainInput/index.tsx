/*
 * @file component MultiDomainInput
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { runInAction } from 'mobx'
import { uniq, trim } from 'lodash'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'

import Input from 'react-icecream/lib/input'
import Button from 'react-icecream/lib/button'
import Icon from 'react-icecream/lib/icon'
import { bindTextInput } from 'portal-base/common/form'

import { SSLDomainType } from '../../../constants/ssl'
import { standardDomainRegx, wildcardDomainRegx } from '../../../constants/domain'
import { validate } from '../../../utils/validate'

function createDomainState(value: string) {
  return new FieldState(value)
}

type DomainState = ReturnType<typeof createDomainState>

export type Value = string[]

export type IState = FormState<DomainState[]>

export function createState(value?: Value): IState {
  value = value || []
  const formstate = new FormState<DomainState[]>([])
  value.forEach(domain => {
    formstate.$.push(createDomainState(domain))
  })
  formstate.validators(domainsNotEmpty, domainsNotDuplicate)
  return formstate
}

export interface IMultiDomainInputProps {
  limit?: number
  bindedDomains?: string[]
  state: IState
}

export default observer(function _MultiDomainInput({ limit, bindedDomains, state }: IMultiDomainInputProps) {
  const bindedDomainsView = (bindedDomains || []).map(domain => (
    <Input
      key={domain}
      value={domain}
      disabled
    />
  ))
  const displayedBindedDomains: string[] = []
  const domainInputsView = state.$
    .filter(domainState => {
      if (!bindedDomains) {
        return true
      }
      const bindedDomainsIdx = bindedDomains.indexOf(domainState.value)
      if (bindedDomainsIdx >= 0 && displayedBindedDomains.indexOf(domainState.value) < 0) {
        displayedBindedDomains.push(domainState.value)
        return false
      }
      return true
    })
    .map((domain, idx) => (
      <Input
        key={idx}
        {...bindTextInput(domain)}
        placeholder="请输入域名"
        addonAfter={
          <Icon type="minus"
            onClick={() => {
              runInAction(() => state.$.splice(idx, 1))
            }}
          />
        }
      />
    ))
  const addButtonView = (!limit || state.$.length < limit) && (
    <Button icon="plus"
      onClick={() => {
        runInAction(() => state.$.push(createDomainState('')))
      }}
    />
  )
  return (
    <>
      {bindedDomainsView}
      {domainInputsView}
      {addButtonView}
    </>
  )
})

export function domainsNotEmpty(domains: string[]) {
  return validate(
    !domains || domains.length === 0 || domains.some(name => trim(name) === ''),
    '域名不能为空'
  )
}

export function domainsNotDuplicate(domains: string[]) {
  const uniqedDomains = uniq(domains || [])
  return validate(domains && uniqedDomains.length < domains.length, '您填写了重复的域名，请修改后重试')
}

export function domainsValidate(type: string, domains: string[]) {
  const normalDomains = (domains || []).filter(domain => standardDomainRegx.test(domain))
  const wildcardDomains = (domains || []).filter(domain => wildcardDomainRegx.test(domain))
  // 多域名证书校验
  if (type === SSLDomainType.Multiple) {
    if (normalDomains.length !== domains.length
      || wildcardDomains.length > 0) {
      return '域名格式不正确'
    }
  }
  return null
}

export function cannotContainCommonName(dnsNames: string[], commonName: string) {
  if (trim(commonName) === '') {
    return null
  }

  const hittedDomains = (dnsNames || []).some(name => name === commonName)
  return validate(hittedDomains, '多域名中的域名不能和通用域名一样')
}
