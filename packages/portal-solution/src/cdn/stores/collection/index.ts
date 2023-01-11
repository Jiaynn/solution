/**
 * @desc CollectionStore
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import { computed, observable, action, reaction } from 'mobx'

import Store from 'qn-fe-core/store'

import { nonEmptyArray } from 'cdn/utils'
import { IPaginationInfo } from './pagination'
import { SelectedStore } from './selected'

export type RecordId = string // TODO: 支持数字

export type IRecord<T> = T & { id: RecordId }

export interface IProps<T> {
  dataSource: Array<IRecord<T>>
  filters?: { // TODO
    [field: string]: (value: T) => boolean
  }
  sorter?: (value: T) => boolean // TODO
  pagination?: IPaginationInfo // TODO
}

export class CollectionStore<T> extends Store {
  constructor(protected getProps: () => IProps<T>) {
    super()
    this.init()
  }

  private selectedStore = new SelectedStore() // 选中的记录的 ids

  // 数据集
  @observable.shallow private recordMap = observable.map<RecordId, IRecord<T>>({}, { deep: false })

  @observable.ref private ids: RecordId[] = []

  @computed get list(): T[] {
    // TODO: sort? filter? pagination?
    return nonEmptyArray(this.ids.map(id => this.recordMap.get(id)))
  }

  @computed get rowSelection() {
    return {
      selectedRowKeys: this.selectedStore.list,
      onChange: this.selectedStore.update
    }
  }

  get(id: RecordId) {
    return this.recordMap.get(id)
  }

  @action.bound update(list: Array<IRecord<T>> = []) {
    this.recordMap.clear()

    list.forEach(record => this.recordMap.set(record.id, record))

    this.ids = list.map(record => record.id)

    this.selectedStore.filter(this.ids)
  }

  init() {
    this.addDisposer(reaction(
      () => this.getProps().dataSource,
      list => this.update(list),
      { fireImmediately: true }
    ))
  }
}
