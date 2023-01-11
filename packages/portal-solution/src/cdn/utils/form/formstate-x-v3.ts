/**
 * @file bindings for formstate-x v3（主要是跟 icecream v1 的）
 * @desc 在项目全部升级到 icecream v2 & formstate-x v3 后，可使用 react-icecrem-form 代替这里的内容
 */

import { IState, DebouncedState } from 'formstate-x-v3'
import { ChangeEvent } from 'react'
import type { RadioChangeEvent } from 'react-icecream/esm/radio'
import type { SelectValue } from 'react-icecream/esm/select'

function isDebouncedState<V>(state: IState<V>): state is DebouncedState<IState<V>, V> {
  return state instanceof DebouncedState
}

function bindBaseInput<V>(state: IState<V>) {
  const uiState = isDebouncedState(state) ? state.$ : state
  return {
    value: uiState.value,
    onChange(value: V) {
      uiState.onChange(value)
    }
  }
}

export function bindInput(state: IState<string>) {
  const { value, onChange } = bindBaseInput(state)
  return {
    value,
    onChange(e: ChangeEvent<HTMLInputElement>) {
      onChange(e.target.value)
    }
  }
}

export function bindSelect<V extends SelectValue>(state: IState<V>) {
  const { value, onChange } = bindBaseInput(state)
  return {
    value,
    onChange: onChange as (v: SelectValue) => void
  }
}

export function bindSwitch(state: IState<boolean>) {
  const { value, onChange } = bindBaseInput(state)
  return { checked: value, onChange }
}

export function bindRadioGroup<V>(state: IState<V>) {
  const { value, onChange } = bindBaseInput(state)
  return {
    value,
    onChange(e: RadioChangeEvent) {
      onChange(e.target.value)
    }
  }
}

export function bindTextArea(state: IState<string>) {
  const { value, onChange } = bindBaseInput(state)
  return {
    value,
    onChange(e: ChangeEvent<HTMLTextAreaElement>) {
      onChange(e.target.value)
    }
  }
}
