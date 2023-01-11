/*
 * @file native dom constants
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// copy from kodo-web

export type NativeValue = string | string[] | number

export interface ITargetLike<T> {
  value?: T
}

export interface IEventLike<T> {
  target: ITargetLike<T> | any
}

export type IEventTargetBase<T> = ITargetLike<T> & EventTarget // + & HTMLElement ..?
export type IEventTarget<T extends NativeValue> = IEventTargetBase<T>

export interface IChangeEventBase<T> {
  target: IEventTargetBase<T>
}
export type IChangeEvent<T extends NativeValue> = IChangeEventBase<T>
