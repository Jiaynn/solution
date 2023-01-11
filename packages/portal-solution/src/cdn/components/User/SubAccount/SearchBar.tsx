/**
 * @file Search Account Component
 * @author hejinxin <hejinxin@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Input from 'react-icecream/lib/input'
import Icon from 'react-icecream/lib/icon'
import { bindTextInput } from 'portal-base/common/form'
import { useTranslation } from 'portal-base/common/i18n'

import './style.less'

const message = {
  cn: '请输入用户名搜索',
  en: 'Please enter a user name to search'
}

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
  const t = useTranslation()
  return (
    <div className="comp-search-account-input">
      <Input
        type="text"
        name="search-account"
        placeholder={t(message)}
        prefix={<Icon type="search" />}
        {...bindTextInput(props.state)}
      />
    </div>
  )
})
