/**
 * @file formstate-x relative validators
 * @author nighca <nighca@live.cn>
 */

import mustache from 'mustache'
import { every } from 'lodash'

import {
  FieldsObject,
  ComposibleValidatable,
  ValidatorResponse,
  ValidationResponse,
  ValueOf
} from 'formstate-x'

import { isPromise } from 'cdn/utils'

import { isFieldState } from 'cdn/utils/form/formstate-x'

const isAsyncResult: (result: ValidatorResponse) => result is Promise<ValidationResponse> = isPromise

function renderErrTpl(errTpl: string | undefined, err: ValidationResponse): ValidationResponse {
  if (isEmpty(err)) {
    return null
  }
  return (
    errTpl != null
    ? mustache.render(errTpl, { err })
    : err
  )
}

export type Validator<T> = (value: T, errTpl?: string) => ValidatorResponse

export function isEmpty(error: ValidationResponse): boolean {
  if (error == null) { return true }
  if (typeof error === 'object') { return every(error, isEmpty) }
  return false
}

export function createValidator<T>(validate: Validator<T>): Validator<T> {
  // TODO: 优化，如果传入的已经是一个通过 createValidator 创建出来的方法，则直接 return 之，不再包一层
  return function validator(value: T, errTpl?: string) {
    const result = validate(value)
    return (
      isAsyncResult(result)
      ? result.then(res => renderErrTpl(errTpl, res))
      : renderErrTpl(errTpl, result)
    )
  }
}

function notError(error: ValidationResponse): ValidationResponse {
  return error ? null : 'not'
}

export function not<T>(validator: Validator<T>): Validator<T> {
  return createValidator((value: T) => {
    const result = validator(value)
    if (isPromise(result)) {
      return result.then(notError)
    }
    return notError(result)
  })
}

// 对异步结果做 or
function asyncResultsOr(
  asyncResults: Array<Promise<ValidationResponse>>
): ValidatorResponse {
  if (asyncResults.length === 0) {
    return null
  }
  return new Promise(resolve => {
    // 任一通过，则通过
    asyncResults.forEach(asyncResult => asyncResult.then(result => {
      if (isEmpty(result)) {
        resolve(null)
      }
    }))
    // 所有都不通过，则不通过
    return Promise.all(asyncResults).then(results => {
      if (every(results, result => !isEmpty(result))) {
        resolve(results[0])
      }
    })
  })
}

// 对异步结果做 and
function asyncResultsAnd(asyncResults: Array<Promise<ValidationResponse>>): ValidatorResponse {
  if (asyncResults.length === 0) {
    return null
  }
  return new Promise(resolve => {
    // 任一不通过，则不通过
    asyncResults.forEach(asyncResult => asyncResult.then(result => {
      if (!isEmpty(result)) {
        resolve(result)
      }
    }))
    // 所有都通过，则通过
    return Promise.all(asyncResults).then(results => {
      if (every(results, isEmpty)) {
        resolve(null)
      }
    })
  })
}

export function and<T>(...validators: Array<Validator<T>>): Validator<T> {
  if (validators.length === 0) {
    return () => null
  }

  if (validators.length === 1) {
    return validators[0]
  }

  return createValidator((value: T): ValidatorResponse => {
    const asyncResults: Array<Promise<ValidationResponse>> = []

    for (const validator of validators) {
      const result = validator(value)

      if (isAsyncResult(result)) {
        asyncResults.push(result)
        continue
      }

      // 任一不通过，则不通过
      if (!isEmpty(result)) {
        return result
      }
    }

    return asyncResultsAnd(asyncResults)
  })
}

export function or<T>(...validators: Array<Validator<T>>): Validator<T> {
  if (validators.length === 0) {
    return () => null
  }

  if (validators.length === 1) {
    return validators[0]
  }

  return createValidator((value: T): ValidatorResponse => {
    const syncResults: ValidationResponse[] = []
    const asyncResults: Array<Promise<ValidationResponse>> = []

    for (const validator of validators) {
      const result = validator(value)

      if (isAsyncResult(result)) {
        asyncResults.push(result)
        continue
      }

      // 任一通过，则通过
      if (isEmpty(result)) {
        return result
      }

      syncResults.push(result)
    }

    const asyncResult = asyncResultsOr(asyncResults)

    if (isAsyncResult(asyncResult)) {
      return asyncResult.then(
        results => (isEmpty(results) ? null : syncResults.concat(results)[0])
      )
    }

    return syncResults[0]
  })
}

export type ValidatorError = string

function isSyncResult(result: ValidatorResponse): result is ValidatorError {
  return !isAsyncResult(result)
}

export function listOf<T>(validator: Validator<T>): Validator<T[]> {
  return createValidator((valueList: T[]): ValidatorResponse => {
    const syncResults: ValidatorResponse[] = []
    const asyncResults: ValidatorResponse[] = []

    valueList.forEach(value => {
      const result = validator(value)
      if (isSyncResult(result)) {
        syncResults.push(result)
      } else {
        asyncResults.push(result)
      }
    })

    if (asyncResults.length === 0) {
      return syncResults[0]
    }

    return Promise.all([
      ...syncResults,
      ...asyncResults
    ]).then(
      results => results.filter(it => it != null)
    ).then(results => results[0])
  })
}

/**
 * @description 该函数取 _value 值，即：取出的值主要用于绑定界面输入组件
 */
export function getStateValue<State extends ComposibleValidatable<unknown, unknown>>(state: State): ValueOf<State> {
  if (isFieldState(state)) {
    // eslint-disable-next-line dot-notation
    return state['_value']
  }

  // eslint-disable-next-line dot-notation
  if ((state as any)['mode'] === 'array') {
    // eslint-disable-next-line dot-notation
    return (state as any)['fields'].map(
      (field: any) => getStateValue(field)
    ) as ValueOf<State>
  }
  const fields = state.$ as unknown as FieldsObject
  return Object.keys(fields).reduce(
    (value, key) => ({
      ...value,
      [key]: getStateValue(fields[key])
    }),
    {}
  ) as ValueOf<State>
}

/**
 * @description 该函数取所有 fieldState 的 error 值，即：
 * 对于：const state = FormState<{ foo: FieldState, bar: FieldState }>
 * 取出的值：{ foo: ValidatorError, bar: ValidatorError }
 * 对于：const state = FormState<FieldState[]>
 * 取出的值：ValidatorError[]
 */
export function getStateErrors<T, V>(state: ComposibleValidatable<T, V>): ErrorOfMap<T> | ValidationResponse {
  if (isFieldState(state)) {
    return state.error
  }

  // eslint-disable-next-line dot-notation
  if ((state as any)['mode'] === 'array') {
    // eslint-disable-next-line dot-notation
    return (state as any)['fields'].map(
      (field: any) => getStateErrors(field)
    ) as ErrorOfMap<T>
  }
  const fields = state.$ as unknown as FieldsObject
  return Object.keys(fields).reduce(
    (value, key) => ({
      ...value,
      [key]: getStateErrors(fields[key])
    }),
    {}
  ) as ErrorOfMap<T>
}

export interface IValidatorErrorList {
  [index: number]: ValidatorError
}

export interface IValidatorErrorMap {
  [key: string]: ValidatorError
}

export type ErrorOfMap<T> = { [P in keyof Partial<T>]?: T[P] extends object ? ErrorOfMap<T[P]> : ValidatorError }

export const truthy = createValidator((v: any) => (v ? null : '要求正性'))
export const textRequired = createValidator((v: string) => (v ? null : '必填项'))
export const textEmpty = createValidator((v: string) => (!v ? null : '要求为空'))
export const textPattern = (pattern: RegExp) => createValidator((v: string) => (pattern.test(v) ? null : '格式不正确'))
export const textBlank = createValidator((v: string) => textPattern(/^\s*$/)(v, '要求为空'))
export const textNotBlank = createValidator((v: string) => textPattern(/[^\s]+/)(v, '不可为空'))
export const textInteger = createValidator((v: string) => textPattern(/^\d+$/)(v, '请输入整数'))
export const textPositiveInteger = createValidator((v: string) => textPattern(/^\+?[1-9]\d*$/)(v, '正整数'))
export const numberMin = (min: number) => createValidator((v: number) => (v >= min ? null : `要求至少为 ${min}`))
export const numberMax = (max: number) => createValidator((v: number) => (v <= max ? null : `要求至多为 ${max}`))
export const numberNotNaN = createValidator((v: number) => (!Number.isNaN(v) ? null : '请输入数字'))
export const lengthMin = <T>(min: number) => createValidator((v: T[]) => (v.length >= min ? null : `要求至少包含 ${min} 项`))
export const lengthMax = <T>(max: number) => createValidator((v: T[]) => (v.length <= max ? null : `要求至多包含 ${max} 项`))
export const sameWith = <T>(target: T) => createValidator((v: T) => (v === target ? null : `要求与 ${target} 一致`))
export const notSameWith = <T>(target: T) => createValidator((v: T) => (v !== target ? null : `要求与 ${target} 不同`))
