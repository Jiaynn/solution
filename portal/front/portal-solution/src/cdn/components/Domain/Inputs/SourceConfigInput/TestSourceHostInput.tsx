/**
 * @file Test Source Host Input
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Input from 'react-icecream/lib/input'
import { bindTextInput } from 'portal-base/common/form'

import { textPattern, textRequired } from 'cdn/transforms/form'

import { hostname } from 'cdn/constants/pattern'

import TipIcon from 'cdn/components/TipIcon'
import Error from '../common/Error'

import './style.less'

export type Value = string

export type State = FieldState<string>

export function createState(host?: string): State {
  return new FieldState(host || '').validators(
    v => textRequired(v, '测试回源 HOST 不能为空'),
    v => textPattern(hostname)(v, '请正确填写测试回源 HOST')
  )
}

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  state: State
}

export default observer(function TestSourceHostInput({ state }: Props) {
  return (
    <div className="line domain-test-source-host-input-wrapper">
      <div className="line">
        <span className="sub-input-label">
          测试回源 HOST&nbsp;
          <TipIcon tip="由于您选择泛域名作为加速域名，因此回源 HOST 将跟随具体访问域名。例如：加速域名为 *.a.com，具体访问域名为 b.a.com，则回源 HOST 为 b.a.com。此处为了进行源站可用性测试，可填写一个具体的域名作为回源 HOST 进行测试。" />
        </span>
        <div className="text-input-wrapper">
          <Input placeholder="请输入测试回源 HOST" {...bindTextInput(state)} />
        </div>
        <div className="input-tip">
          <Error error={state.error} />
        </div>
      </div>
    </div>
  )
})
