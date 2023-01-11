/*
 * @file 用来方便地维护 Modal 状态的 store
 * @author nighca <nighca@live.cn>
 */

import { observable, action, when, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import Store from 'qn-fe-core/store'
import { makeCancelled } from 'qn-fe-core/exception'

const modalStatuses = {
  none: -1,
  started: 0,
  submitted: 1,
  cancelled: 2
}

export interface IModalProps<V = {}> {
  visible: boolean
  onCancel: () => void
  onSubmit: (value?: V) => void
}

export class ModalStore<T, V = {}> extends Store {
  @observable currentId = 0 // 标记被调用次数，避免多次调用的互相影响
  @observable.ref extraProps?: T
  @observable status = modalStatuses.none

  result: Map<number, V> = new Map()

  constructor() {
    super()
    makeObservable(this)
  }

  @action
  start(id: number, extraProps?: T) {
    this.currentId = id
    this.extraProps = extraProps
    this.status = modalStatuses.started
  }

  @action.bound
  cancel() {
    this.status = modalStatuses.cancelled
  }

  @action.bound
  submit(value?: V) {
    this.result.set(this.currentId, value!)
    this.status = modalStatuses.submitted
  }

  bind(): T & IModalProps {
    return {
      ...(this.extraProps as any),
      visible: this.status === modalStatuses.started,
      onCancel: this.cancel,
      onSubmit: this.submit
    }
  }

  @autobind
  open(extraProps?: T): Promise<V> {
    const id = this.currentId + 1

    this.start(id, extraProps)

    return new Promise((resolve, reject) => this.addDisposer(
      when(
        () => this.currentId === id && this.status > modalStatuses.started,
        () => (this.status === modalStatuses.cancelled
              ? reject(makeCancelled())
              : resolve(this.result.get(this.currentId)!))
      )
    ))
  }
}
