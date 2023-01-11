/**
 * @file bind helper
 * @desc 已废弃，请使用 portal-base/common/utils/form
 * @author yinxulai <me@yinxulai.com>
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import { RadioChangeEvent } from 'react-icecream/lib/radio'
import { CheckboxChangeEvent } from 'react-icecream/lib/checkbox'
import { FieldState } from 'formstate'

import { bindField } from './index'

// ========
// 通用组件绑定

export function bindPureValueField<T>(state: FieldState<T>) {
  return bindField<T, T>(state, value => value)
}

export function bindTargetValueField<T>(state: FieldState<T>) {
  return bindField<T, { target: { value: T } }>(state, event => event.target.value)
}

export function bindCurrentTargetValueField<T>(state: FieldState<T>) {
  return bindField<T, { currentTarget: { value: T } }>(state, event => event.currentTarget.value)
}

// ========
// TODO: 类型修复、接口统一

export function bindTextInputField(state: FieldState<string>) {
  return bindField<string, React.FormEvent<{ value: string }>>(state, event => event.currentTarget.value)
}

export type InputNumberValue = number | string | void
export function bindInputNumberField(state: FieldState<InputNumberValue>) {
  return bindPureValueField<number>(state as any)
}

export function bindRadioField<T>(state: FieldState<T>) {
  return bindField<T, RadioChangeEvent>(state, event => event.target.value)
}

export function bindCheckboxField(state: FieldState<boolean>) {
  const { value, onChange } = bindField<boolean, CheckboxChangeEvent>(state, event => event.target.checked)
  return { checked: value, onChange }
}

export function bindSwitchField(state: FieldState<boolean>) {
  const { value, onChange } = bindField<boolean, boolean>(state, checked => checked)
  return { checked: value, onChange }
}

// TODO: bindSelectField
