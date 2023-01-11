/**
 * @desc store for collection
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

// TODO: 改成用 stores/collection 里的方式
import { computed, observable, action, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'

import Store from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'

import { nonEmptyArray } from 'cdn/utils'

import VideoSlimApis, { IVideoSlimTask } from 'cdn/apis/video-slim'
import { QueryStore } from './query'
import { PaginationStore } from './pagination'
import SelectedStore from './selected'

export interface IProps {
  domains: string[]
}

export interface IRecord extends IVideoSlimTask {}

export type RecordId = string

enum Loading {
  GetTaskList = 'GetTaskList'
}

export class CollectionStore extends Store {
  constructor(private videoSlimApis: VideoSlimApis, protected getProps: () => IProps) {
    super()
    makeObservable(this)
    this.addDisposer(this.queryStore.dispose)
  }

  loadings = new Loadings()

  queryStore = new QueryStore(() => ({
    domains: this.getProps().domains,
    pageIndex: this.paginationStore.current,
    pageSize: this.paginationStore.pageSize
  }))

  paginationStore = new PaginationStore()

  selectedStore = new SelectedStore() // 选中的任务的 ids

  // 视频瘦身任务
  @observable.shallow private recordMap = observable.map<RecordId, IRecord>({}, { deep: false })

  @observable.ref private ids: RecordId[] = []

  @computed get list(): IRecord[] { // 视频瘦身任务列表
    return nonEmptyArray(this.ids.map(id => this.recordMap.get(id)))
  }

  @computed get isLoading() {
    return this.loadings.isLoading(Loading.GetTaskList)
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

  @action update(list: IRecord[]) {
    this.recordMap.clear()

    list.forEach(record => this.recordMap.set(record.id, record))

    this.ids = list.map(record => record.id)

    this.selectedStore.filter(this.ids)
  }

  @autobind
  fetchList() {
    const req = this.videoSlimApis.getVideoSlimTaskList(this.queryStore.queryParams).then(
      res => {
        this.paginationStore.updateTotal(res.total)
        this.update(res.list)
      }
    )
    return this.loadings.promise(Loading.GetTaskList, req)
  }
}
