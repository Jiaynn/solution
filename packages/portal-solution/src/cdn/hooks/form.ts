/**
 * @file form relative hooks
 * @author linchen <gakiclin@gmail.com>
 */

import { useMemo, useCallback } from 'react'
import { computed, runInAction } from 'mobx'
import { ComposibleValidatable as Validatable, ValueOf } from 'formstate-x'

import { handleStateChange } from 'cdn/utils/form/formstate-x'

import { getStateErrors, getStateValue } from 'cdn/transforms/form'

/**
 * @description 该 hook 适用于把组件的对外接口从 state 变成 value/error/onChange 的形式，而无需改变组件的内部实现
 * 支持自定义：onChange/getErrors/getValue
 */
export function useStateBinding<State extends Validatable<unknown, unknown>, V, E>(
  state: State,
  getErrors?: (err: unknown, state: State) => E,
  transformToInputValue?: (val: ValueOf<State>, state: State) => V,
  transformToStateValue?: (val: V) => ValueOf<State>
) {
  const value = useMemo(
    () => computed(() => {
      const v = getStateValue(state)
      return transformToInputValue ? transformToInputValue(v, state) : v
    }),
    [state, transformToInputValue]
  ).get()

  const error = useMemo(
    () => computed(() => {
      const e = getStateErrors(state)
      return getErrors ? getErrors(e, state) : e
    }),
    [state, getErrors]
  ).get()

  const handleChange = useCallback(
    (v: V) => {
      runInAction(() => {
        handleStateChange(
          state,
          (transformToStateValue ? transformToStateValue(v) : v) as ValueOf<State>
        )
      })
    },
    [state, transformToStateValue]
  )

  return {
    error: error as E,
    value: value as V,
    onChange: handleChange
  }
}
