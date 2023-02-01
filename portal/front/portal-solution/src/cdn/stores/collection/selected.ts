/*
 * @file SelectedStore of CollectionStore
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// copy from kodo-web

import { action, observable, computed } from 'mobx'
import Store from 'qn-fe-core/store'

// import { ObservableShallowSet } from 'cdn/utils/set'
import { RecordId } from '.'

export class SelectedStore extends Store {
  // FIXME 暂时先用 shallow map 代替 ObservableShallowSet
  @observable.ref selectedIdSet = observable.map<RecordId, RecordId>(
    {},
    { deep: false }
  )

  @computed get list() {
    return [...this.selectedIdSet.values()]
  }

  @action.bound
  update(selectedRecordIds?: RecordId[]) {
    this.selectedIdSet = observable.map(
      (selectedRecordIds || []).map(v => [v, v] as [RecordId, RecordId]),
      { deep: false }
    )
  }

  @action.bound
  filter(availableRecordIds: RecordId[]): boolean {
    const selectedIdSet = this.selectedIdSet
    if (!selectedIdSet.size) {
      return false
    }

    let deleted = false
    const availableIdSet = observable.map(
      availableRecordIds.map(v => [v, v] as [RecordId, RecordId]),
      { deep: false }
    )
    selectedIdSet.forEach(id => {
      if (!availableIdSet.has(id)) {
        selectedIdSet.delete(id)
        deleted = true
      }
    })
    return deleted
  }

  // TODO
  // TODO: icecream 没有暴露 TableProps 以及 TableRowSelection 的定义
  // @computed get rowSelection(): TableRowSelection<IRecord> {
  //   return {
  //     selectedRowIds: this.selectedRowIds,
  //     onChange: this.handleSelectedRowIdsChange
  //   }
  // }
  //
  // handleRowClick
  // handleRowSelect
  // handleSelectedRowIdsChange
}
