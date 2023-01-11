/**
 * @desc store for collection
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import { computed, observable, action, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'

import Store from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'

import { PaginationStore } from 'cdn/stores/collection/pagination'

import { CollectionStore } from 'cdn/stores/collection'

import { TaskState } from 'cdn/constants/video-slim'
import { RFC3339Format } from 'cdn/constants/datetime'

import VideoSlimApis, { IVideoSlimTask, IVideoSlimTaskListReq } from 'cdn/apis/video-slim'
import { IVideoSlimOptions } from 'cdn/apis/statistics'

import { QueryStore } from './query'

export interface IProps extends IVideoSlimOptions {}

export interface IRecord extends IVideoSlimTask {}

export type RecordId = string

export const videoSlimUsageSpecificOptions = {
  states: [TaskState.SlimSuccess, TaskState.Enabled, TaskState.Enabling, TaskState.Stopping, TaskState.Deleted],
  deletedAndLastStateSlimSuccess: true
}

enum Loading {
  GetTaskList = 'GetTaskList'
}

export class TasksStore extends Store {
  constructor(
    protected getProps: () => IProps,
    private videoSlimApis: VideoSlimApis
  ) {
    super()
    makeObservable(this)
    this.addDisposer(this.queryStore.dispose)
    this.addDisposer(this.paginationStore.dispose)
    this.addDisposer(this.collectionStore.dispose)
  }

  loadings = new Loadings()

  queryStore = new QueryStore()

  paginationStore = new PaginationStore({ pageSize: 20 })

  collectionStore = new CollectionStore<IVideoSlimTask>(() => ({
    dataSource: this.list || []
  }))

  @computed get tasks() {
    return this.collectionStore.list
  }

  @computed get isLoading() {
    return this.loadings.isLoading(Loading.GetTaskList)
  }

  @observable.ref private list!: IRecord[]

  @action updateList(list: IRecord[], total: number) {
    this.list = list
    this.paginationStore.updateTotal(total)
  }

  @action resetParams() {
    this.queryStore.reset()
    this.paginationStore.reset()
  }

  getQueryParams(params: Pick<IVideoSlimTaskListReq, 'domains' | 'rangeGTE' | 'rangeLT'>): IVideoSlimTaskListReq {
    return {
      ...params,
      ...this.queryStore.appliedParams,
      pageIndex: this.paginationStore.current,
      pageSize: this.paginationStore.pageSize,
      ...videoSlimUsageSpecificOptions
    }
  }

  @autobind
  fetchList() {
    const params = this.getQueryParams({
      domains: this.getProps().domains,
      rangeGTE: this.getProps().startDate.format(RFC3339Format),
      rangeLT: this.getProps().endDate.format(RFC3339Format)
    })

    const req = this.videoSlimApis.getVideoSlimTaskList(params).then(
      res => this.updateList(res.list, res.total)
    )
    return this.loadings.promise(Loading.GetTaskList, req)
  }
}
