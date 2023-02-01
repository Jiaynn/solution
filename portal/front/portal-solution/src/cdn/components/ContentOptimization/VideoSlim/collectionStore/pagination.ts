/**
 * @desc store for video-slim task list's pagination
 * @author yaojingtian <yaojingtian@qiniu.com>
 */
import { computed, observable, action, makeObservable } from 'mobx'

import Store from 'qn-fe-core/store'

export interface IPaginationInfo {
  current: number
  total: number
  pageSize: number
}

export const PAGE_SIZE = 10

const defaultPaginationInfo: IPaginationInfo = {
  current: 1,
  total: 0,
  pageSize: PAGE_SIZE
}

export class PaginationStore extends Store {
  constructor(protected initial?: Partial<IPaginationInfo>) {
    super()
    makeObservable(this)
  }

  @observable current: number = this.initial && this.initial.current || defaultPaginationInfo.current

  @observable total: number = this.initial && this.initial.total || defaultPaginationInfo.total

  pageSize: number = defaultPaginationInfo.pageSize

  @computed get info() {
    return {
      current: this.current,
      total: this.total,
      pageSize: this.pageSize
    }
  }

  @action updateCurrent(current: number) {
    this.current = current
  }

  @action updateTotal(total: number) {
    this.total = total
  }

  @action reset() {
    this.current = defaultPaginationInfo.current
    this.total = defaultPaginationInfo.total
  }
}
