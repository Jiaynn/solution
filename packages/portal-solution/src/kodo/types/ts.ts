/**
 * @file typescript utils
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

export type Nullable<T> = { [P in keyof T]: T[P] | null }

// https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

export type AnyFunction = (this: any, ...args: any[]) => any

export type ArrayCompareFn<T> = (a: T, b: T) => number

export type ValueOf<T extends object> = T[keyof T]

export type Diff<T, U> = T extends U ? never : T
export type Filter<T, U> = T extends U ? T : never

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
export type MutableRequired<T> = { -readonly [P in keyof T]-?: T[P] }
export type ReadonlyPartial<T> = { +readonly [P in keyof T]+?: T[P] }

export type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>
export type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>

export type DistributiveByKey<T> = { [K in keyof T]: T[K] extends T[K] ? { [P in K]: T[P] } : never }[keyof T]

export type Unpacked<T> = (
  T extends Array<infer U> ? U :
  T extends (...args: any[]) => infer U ? U :
  T extends Promise<infer U> ? U :
  T
)

export type TypeName<T> = (
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object'
)
