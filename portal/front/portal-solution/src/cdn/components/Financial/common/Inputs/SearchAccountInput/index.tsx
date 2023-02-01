/**
 * @file Search Account Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Input from 'react-icecream/lib/input'
import Icon from 'react-icecream/lib/icon'
import { bindTextInput } from 'portal-base/common/form'

import './style.less'

export type Value = string
export type State = FieldState<string>

export function createState(value?: Value) {
  return new FieldState(value ?? '')
}

export function getValue(state: State) {
  return state.value
}

export interface IProps {
  state: State
}

export default observer(function _SearchAccountInput(props: IProps) {
  return (
    <div className="comp-search-account-input">
      <Input
        type="text"
        name="search-account"
        placeholder="请输入用户名或邮箱搜索"
        prefix={<Icon type="search" />}
        {...bindTextInput(props.state)}
      />
    </div>
  )
})
