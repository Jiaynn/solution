/**
 * @file Source Domain Input
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Input from 'react-icecream/lib/input'
import { bindTextInput } from 'portal-base/common/form'

import { textRequired, textPattern } from 'cdn/transforms/form'

import { hostname } from 'cdn/constants/pattern'

import { IDomainDetail } from 'cdn/apis/domain'

import Error from '../common/Error'

export type State = FieldState<string>

export type Value = string

export function createState(
  domain: string,
  getDomains: () => IDomainDetail[]
): State {
  return new FieldState(domain).validators(
    textRequired,
    v => textPattern(hostname)(v, '请正确填写域名'),
    v => {
      const target = getDomains().find(it => it.name === v)
      return target != null ? '源站域名不能与加速域名相同' : null
    }
  )
}

export function getValue(state: State): Value {
  return state.value.trim()
}

export interface Props {
  state: State
}

export default observer(function SourceDomainInput(props: Props) {
  return (
    <div className="line domain-source-domain-input-wrapper">
      <div className="line">
        <div className="text-input-wrapper">
          <Input placeholder="请输入源站域名" {...bindTextInput(props.state)} />
          <Error error={props.state.error} />
        </div>
      </div>
    </div>
  )
})
