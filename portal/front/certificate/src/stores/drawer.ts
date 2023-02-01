/*
 * @file Drawer Store
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { observable, computed, action, when, makeObservable } from 'mobx'
import { makeCancelled } from 'qn-fe-core/exception'
import Store from 'qn-fe-core/store'

export enum DrawerStatus {
  None = -1,
  Started = 0,
  Submitted = 1,
  Cancelled = 2
}

export interface IDrawerState {
  status: DrawerStatus
  isModify: boolean
}

export const defaultDrawer = {
  status: DrawerStatus.None,
  isModify: false
}

export default class DrawerStore<E = unknown, R = unknown> extends Store {
  constructor() {
    super()
    makeObservable(this)
    this.init()
  }

  @observable.shallow drawerState: IDrawerState = defaultDrawer
  @observable.ref extra?: E
  @observable.ref result?: R

  @action updateExtra(extra: E) {
    this.extra = extra
  }

  @action updateResult(result: R) {
    this.result = result
  }

  @computed get visible() {
    return this.drawerState.status === DrawerStatus.Started
  }

  @action open(isModify?: boolean, extra?: E): Promise<R> {
    this.drawerState.status = DrawerStatus.Started
    this.drawerState.isModify = isModify || false
    this.extra = extra

    return new Promise((resolve, reject) => this.addDisposer(
      when(
        () => this.drawerState.status > DrawerStatus.Started,
        () => (this.drawerState.status === DrawerStatus.Submitted ? resolve(this.result!) : reject(makeCancelled()))
      )
    ))
  }

  @action cancel() {
    this.drawerState.status = DrawerStatus.Cancelled
  }

  @action submit(result?: R) {
    this.result = result
    this.drawerState.status = DrawerStatus.Submitted
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}
}
