/**
 * @file implementation of Promise.allSettled
 * @author zhangheng <zhangheng01@qiniu.com>
 */

export type SettledValue<T> = {
  status: 'fulfilled'
  value: T
} | {
  status: 'rejected'
  reason: any
}

export function isIterable(obj: any): obj is { [Symbol.iterator]: (...args: any[]) => any } {
  // checks for null and undefined
  if (obj == null) {
    return false
  }

  return typeof obj[Symbol.iterator] === 'function'
}

/* eslint-disable max-len */
export function promiseAllSettled<T1, T2, T3, T4, T5>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>]): Promise<[SettledValue<T1>, SettledValue<T2>, SettledValue<T3>, SettledValue<T4>, SettledValue<T5>]>
export function promiseAllSettled<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): Promise<[SettledValue<T1>, SettledValue<T2>, SettledValue<T3>, SettledValue<T4>]>
export function promiseAllSettled<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): Promise<[SettledValue<T1>, SettledValue<T2>, SettledValue<T3>]>
export function promiseAllSettled<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Promise<[SettledValue<T1>, SettledValue<T2>]>
export function promiseAllSettled<T>(values: [T | PromiseLike<T>]): Promise<[SettledValue<T>]>
export function promiseAllSettled<T>(values: Array<T | PromiseLike<T>>): Promise<Array<SettledValue<T>>>
export function promiseAllSettled(values: any[]): Promise<Array<SettledValue<any>>> {
  if (!isIterable(values)) {
    throw new Error('values is not iterable')
  }

  let processCount = 0
  const result: Array<SettledValue<any>> = []
  const resolveWhenFinished = resolve => {
    ++processCount
    if (processCount === values.length) {
      resolve(result)
    }
  }

  return new Promise(resolve => {
    if (values.length === 0) {
      resolve(result)
    }

    values.forEach((item, index) => {

      const promiseLikeItem = item instanceof Promise ? item : Promise.resolve(item)

      promiseLikeItem.then(
        data => {
          result[index] = { status: 'fulfilled', value: data }
          resolveWhenFinished(resolve)
        },
        err => {
          result[index] = { status: 'rejected', reason: err }
          resolveWhenFinished(resolve)
        }
      )
    })
  })
}
