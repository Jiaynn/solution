/**
 * @file Pagination Store
 * @author linchen <gakiclin@gmail.com>
 */

import { computed, observable, action, makeObservable } from 'mobx'
import { PaginationConfig } from 'react-icecream/lib/table'

export default class PaginationStore {
  @observable total = 0
  @observable pageNo = 1
  @observable pageSize = 0

  initPageSize = 0

  constructor(pageSize: number) {
    this.pageSize = pageSize
    this.initPageSize = pageSize
    makeObservable(this)
  }

  @action.bound updatePageNo(pageNo: number) {
    this.pageNo = pageNo
  }

  @action.bound updatePageSize(pageSize: number) {
    this.pageSize = pageSize
  }

  @action.bound updateTotal(total: number) {
    this.total = total || 0
  }

  @action.bound reset() {
    this.total = 0
    this.pageNo = 1
    this.pageSize = this.initPageSize
  }

  @action.bound handleChange(pageNo: number) {
    this.pageNo = pageNo
  }

  @action.bound handleSizeChange(pageNo: number, pageSize: number) {
    this.pageNo = pageNo
    this.pageSize = pageSize
  }

  @computed get config(): PaginationConfig {
    return {
      total: this.total,
      pageSize: this.pageSize,
      current: this.pageNo,
      showSizeChanger: true,
      showQuickJumper: true,
      onShowSizeChange: this.handleSizeChange,
      onChange: this.handleChange
    }
  }
}
