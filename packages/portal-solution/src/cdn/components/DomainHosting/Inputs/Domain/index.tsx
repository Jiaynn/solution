/**
 * @file 域名托管 - 域名输入组件
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { FieldState } from 'formstate-x'
import { observer } from 'mobx-react'
import Input from 'react-icecream/lib/input'
import { bindTextInput } from 'portal-base/common/form'

import { validateHostingDomain } from 'cdn/transforms/domain-hosting'

import DomainApis from 'cdn/apis/domain'

import './style.less'

export type State = FieldState<string>
export type Value = string

function checkDomainIcp(domainApis: DomainApis, domainName: string) {
  return domainApis.getDomainIcp(domainName).then(
    data => (data && data.regno ? null : '域名未备案'),
    (_: unknown) => '检测域名备案失败'
  )
}

export function createState(domainApis: DomainApis, domain?: Value): State {
  return new FieldState(domain ?? '').validators(
    v => !v && '请输入域名',
    v => validateHostingDomain(v),
    v => checkDomainIcp(domainApis, v)
  )
}

export interface IProps {
  state: State
}

export default observer(function DomainInput({ state }: IProps) {
  return (
    <Input placeholder="请输入已经备案的二级域名" {...bindTextInput(state)} />
  )
})
