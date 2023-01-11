/**
 * @file typescript utils
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import { keyBy } from 'lodash'

import { ValueOf } from 'kodo/types/ts'

export function keysOf<T extends object>(target: T): Array<keyof T> {
  return Object.keys(target) as any
}

export function valuesOf<T extends object>(target: T): Array<ValueOf<T>> {
  return Object.values(target) as any
}

// ts 3.2+ support:
//   generic object rest variables and parameters
//   generic spread expressions in object literals
export function spread<T, U = T>(target: T, source?: U): T & U {
  return { ...target as any, ...(source as any || {}) }
}

// TODO: shoule be <T, U extends Partial<T>> ..?
// TODO: differences between spread, assign and merge
export function assign<T, U>(target: T, source: U): T & U
export function assign<T, S1, S2>(target: T, s1: S1, s2: S2): T & S1 & S2
export function assign<T, S1, S2, S3>(target: T, s1: S1, s2: S2, s3: S3): T & S1 & S2 & S3
export function assign<T, S1, S2, S3, S4>(target: T, s1: S1, s2: S2, s3: S3, s4: S4): T & S1 & S2 & S3 & S4
export function assign(target: any, ...sources: any[]): any
export function assign(target: any, ...sources: any[]) {
  return Object.assign(target, ...sources)
}

export function unionArrayFrom<T extends string>(keys: T[]): Array<keyof { [K in T]: K }> {
  return keys
}

export function enumByKeys<T extends string>(keys: T[]): { [K in T]: K } {
  return keyBy(keys) as any
}

export function enumByKey<T extends object>(target: T) {
  return enumByKeys(keysOf(target).map(String))
}

// ts 的设计导致的 enum 遍历缺陷、请在确保理解 enum 设计的情况下使用, TODO: 性能优化：多次遍
export function keysOfEnum<T extends object>(target: T, validationDisabled = false): Array<keyof T> {
  const keys = keysOf(target)
  const values = valuesOf(target)

  if (!validationDisabled) {
    values.forEach(value => {
      if (value == null || typeof value === 'number' && !Number.isFinite(value)) {
        // eslint-disable-next-line no-console
        console.warn(`Some values of enum may be overwritten incorrectly by special value "${value}".`)
      }
    })
  }

  const fakeKeys = values.filter(value => typeof value !== 'string').map(String)
  // TODO: 性能优化：两层遍历
  const realKeys = keys.filter(key => !fakeKeys.includes(key.toString()))

  if (!validationDisabled) {
    // TODO: 性能优化：多次遍历
    const realValues = realKeys.map(key => target[key])
    if ([...new Set(realValues)].length !== realValues.length) {
      // eslint-disable-next-line no-console
      console.warn('Values of enum are not unique.')
    }
  }

  return realKeys
}

// ts 的设计导致的 enum 遍历缺陷、请在确保理解 enum 设计的情况下使用
export function valuesOfEnum<T extends object>(target: T, validationDisabled = false): Array<T[keyof T]> {
  return keysOfEnum(target, validationDisabled).map(key => target[key])
}
