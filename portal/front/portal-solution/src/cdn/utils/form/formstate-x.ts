/**
 * @file formstate-x utils
 * @author linchen <gakiclin@gmail.com>
 */

import { action } from 'mobx'
import { FieldsObject, FieldState, FormState, ComposibleValidatable as Validatable, ValueOf } from 'formstate-x'

// FIXME: 等待升级 formstate-x 3.0 使用内置的 ArrayFormState
export class ArrayFormState<Field extends Validatable<any, Value>, Value = ValueOf<Field>>
  extends FormState<Field[], Value[]> {

  private createFieldItem: (val: Value) => Field

  @action onChange(value: Value[]) {
    let i = 0
    // items exists in both value & child states => do state change
    for (; i < value.length && i < this.$.length; i++) {
      handleStateChange(this.$[i], value[i] as ValueOf<Field>)
    }
    // items only exists in child states => truncate
    if (i < this.$.length) {
      const legacyStates = this.$.splice(i, this.$.length - 1)
      legacyStates.forEach(
        field => field.dispose()
      )
    }
    // items exists in value but not in child states => add
    if (i < value.length) {
      const states = value.slice(i).map(it => this.createFieldItem(it))
      this.$.splice(i, 0, ...states)
    }
  }

  constructor(values: Value[], createFieldItem: (val: Value) => Field) {
    super(values.map(createFieldItem))
    this.createFieldItem = createFieldItem
  }
}

export function handleStateChange<S extends Validatable<any>>(state: S, val: ValueOf<S>) {
  if (isFieldState(state)) {
    state.onChange(val)
    return
  }

  if (isArrayFormState(state)) {
    state.onChange(val as any)
    return
  }

  Object.keys(state.$).forEach(key => {
    handleStateChange(state.$[key], val[key as keyof ValueOf<S>])
  })
}

export function findObjectStateErrorField<T extends FormState<FieldsObject>>(state: T): keyof T['$'] | undefined {
  return Object.keys(state.$).find(key => state.$[key].hasError)
}

export function isFieldState(state: Validatable<unknown>): state is FieldState<any> {
  return state instanceof FieldState
}

export function isArrayFormState(state: Validatable<unknown>): state is ArrayFormState<any, any> {
  return state instanceof ArrayFormState
}

export function isFormState(state: Validatable<unknown>): state is FormState<any> {
  return state instanceof FormState
}
