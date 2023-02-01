/**
 * @file formstate helper
 * @desc 已废弃，请使用 portal-base/common/utils/form
 * @author yinxulai <me@yinxulai.com>
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import { mapValues } from 'lodash/fp'
import { FieldState, FormState, ComposibleValidatable } from 'formstate'

import { ValueOf } from 'kodo/types/ts'

export * from './bind'

export interface IBoundProps<T, E> {
  value: T
  onChange(event: E): void
}

export type ValidateStatus = 'success' | 'warning' | 'error' | 'validating' | undefined

// TODO: 处理包含 array、map 等情况
export type ValidatableObject<T> = {
  [P in keyof T]: FieldState<T[P]>
}

// 注意：需要 warning 请自行处理
export function getValidateStatus<T>(state: FieldState<T>): ValidateStatus {
  if (state.validating) {
    return 'validating'
  }

  if (state.hasBeenValidated) {
    return state.hasError
      ? 'error'
      : 'success'
  }
}

export function bindFormItem<T>(state: FieldState<T>) {
  return {
    help: state.error,
    validateStatus: getValidateStatus(state)
  }
}

// 注意：若直接展开使用这个方法，那么每次都会生成新的 onChange 引用
// TODO: getValueFromEvent 添加一个缺省的实现
export function bindField<T, E>(state: FieldState<T>, getValueFromEvent: (event: E) => T): IBoundProps<T, E> {
  return {
    value: state.value,
    onChange: (event: E) => state.onChange(getValueFromEvent(event))
  }
}

// TODO: 添加完整 ValidatableMapOrArray 以及 formstate 的支持
export function getValuesFromFormState<T extends object>(
  formState: FormState<ValidatableObject<T>>,
  validated = false
): T {
  return mapValues<typeof formState.$, ValueOf<T>>(
    (fieldState: ValueOf<ValidatableObject<T>>) => (validated ? fieldState.$ : fieldState.value)
  )(formState.$) as any as T // TODO FIXME types
}

export function isFormStateDirty(
  state: ComposibleValidatable<any>
): boolean {
  if (state instanceof FieldState) {
    return !!state.dirty
  }
  if (state instanceof FormState) {
    return Object.entries(state.$).some(
      ([_, field]) => isFormStateDirty(field as ComposibleValidatable<any>)
    )
  }
  return false
}
