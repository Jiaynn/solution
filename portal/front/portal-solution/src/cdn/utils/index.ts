import { values } from 'lodash'
import { ReactNode } from 'react'
import { makeCancelled, UnknownException } from 'qn-fe-core/exception'

export function isPromise(obj: any): obj is Promise<any> {
  if (!obj) {
    return false
  }
  if (typeof obj === 'object' || typeof obj === 'function') {
    if (typeof obj.then === 'function') {
      return true
    }
  }
  return false
}

export interface IAntdStyleMethodOptions {
  title?: ReactNode
  content?: ReactNode
  onOk?: (...args: any[]) => void
  onCancel?: (...args: any[]) => void
}

export type AntdStyleMethod<T extends IAntdStyleMethodOptions> = (options: T) => void

export type PromiseStyleMethod<T, P> = (options: T) => Promise<P>

// 把 antd 中如 Modal.confirm 风格（onCancel, onOk）的接口转换成 promise 接口
export function antdToPromise<
  T extends IAntdStyleMethodOptions,
  M extends AntdStyleMethod<T>,
  P
>(method: M): PromiseStyleMethod<T, P> {
  return (options: T) => new Promise((resolve, reject) => {
    const onCancel = (...args: any[]) => {
      if (options.onCancel) {
        options.onCancel(...args)
      }
      reject(makeCancelled())
    }
    const onOk = (...args: any[]) => {
      if (options.onOk) {
        options.onOk(...args)
      }
      resolve(args[0])
    }
    method({
      ...(options as any),
      onCancel,
      onOk
    })
  })
}

function getLexicValue(char: string) {
  return char ? char.charCodeAt(0) : -1
}

export function lexicCompare(strA: string, strB: string) {
  for (let i = 0, len = Math.max(strA.length, strB.length); i < len; i++) {
    const vA = getLexicValue(strA.charAt(i))
    const vB = getLexicValue(strB.charAt(i))
    if (vA !== vB) {
      return vA - vB
    }
  }
  return 0
}

export function valuesOfEnum<T extends object>(target: T): Array<T[keyof T]> {
  const fakeKeys = values(target).filter(value => typeof value !== 'string').map(String)
  const realKeys = Object.keys(target).filter(key => fakeKeys.indexOf(key) === -1)

  return (realKeys as Array<keyof T>).map(key => target[key])
}

export function assertUnreachable(): never
export function assertUnreachable(v: never, message?: string): never
export function assertUnreachable(v?: never, message = "Didn't expect to get here") {
  throw new UnknownException(message + v)
}

/**
 * 过滤数组的 “空” 值，其中空值指的是：
 * - null
 * - undefined
 */
export function nonEmptyArray<T>(data: Array<T | undefined | null>): T[] {
  return data.filter((it): it is T => it != null)
}

export function booleanPredicate<T>(value: T): value is Exclude<T, false | null | undefined | '' | 0> {
  return Boolean(value)
}

export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw Error(msg)
  }
}
