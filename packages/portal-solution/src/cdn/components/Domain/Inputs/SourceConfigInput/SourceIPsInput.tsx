/**
 * @file Source IPs Input
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { uniq } from 'lodash'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Input from 'react-icecream/lib/input'
import { bindTextArea } from 'portal-base/common/form'

import { textPattern, textRequired } from 'cdn/transforms/form'

import { ip } from 'cdn/constants/pattern'
import Error from '../common/Error'

export type State = FieldState<string>

export type Value = string[]

const textIPPattern = textPattern(ip)

// 允许空行 & 首尾空格
function ipLineValidate(line: string) {
  line = line.trim()
  return line ? textIPPattern(line) : null
}

export function createState(val: string[]): State {
  const state = new FieldState((val || []).join('\n'))

  return state.validators(
    v => textRequired(v, '请输入 IP'),
    () => {
      const ipList = getValue(state)
      const target = ipList.find(
        v => ipLineValidate(v) != null
      )
      return target != null ? '请正确填写 IP 地址' : null
    },
    () => {
      const ipList = getValue(state)
      return uniq(ipList).length !== ipList.length ? 'IP 地址重复' : null
    }

  )
}

export function getValue(state: State): Value {
  return state.value.split('\n')
}

export interface Props {
  state: State
}

export default observer(function DomainSourceIPsInput({ state }: Props) {
  return (
    <div className="line domain-source-ips-input-wrapper">
      <div className="line">
        <div className="text-input-wrapper">
          <Input.TextArea
            className="ips-input"
            placeholder="请输入 IP 地址，多个请换行"
            autosize={{ minRows: 5, maxRows: 10 }}
            {...bindTextArea(state)}
          />
        </div>
        <Error error={state.error} />
      </div>
    </div>
  )
})
