/**
 * @file Input for domain geoCover
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import Input from 'react-icecream/lib/input'
import { FieldState } from 'formstate-x'
import { bindTextInput } from 'portal-base/common/form'

import { textRequired } from 'cdn/transforms/form'
import Error from '../common/Error'

import './style.less'

export type State = FieldState<string>

export type Value = string

export function createState() {
  return new FieldState('').validators(
    v => textRequired(v, '请输入备案号')
  )
}

export interface Props {
  state: State
}

export default observer(function DomainRegisterNoInput({ state }: Props) {
  return (
    <div className="domain-register-no-input-wrapper">
      <div className="line">
        <div className="text-input-wrapper">
          <Input placeholder="请输入加速域名完整的 ICP 备案号" {...bindTextInput(state)} />
        </div>
        <Error error={state.error} />
      </div>
    </div>
  )
})
