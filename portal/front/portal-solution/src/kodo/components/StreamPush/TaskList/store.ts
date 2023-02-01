/**
 * @desc Stream push task list store
 * @author hovenjay <hovenjay@outlook.com>
 */

import autobind from 'autobind-decorator'
import { action, computed, observable, makeObservable } from 'mobx'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { LoadMore } from 'react-icecream/lib/table'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { valuesOf } from 'kodo/utils/ts'

import { pageSize, StreamPushTaskStatus } from 'kodo/constants/stream-push'

import {
  StreamPushApis, GetStreamPushTaskListOptions,
  StreamPushTask, StreamPushTaskBaseInfo, StreamPushTaskList
} from 'kodo/apis/stream-push'

enum Loading {
  FetchTaskList = 'FetchTaskList',
  CreateTask = 'CreateTask',
  DeleteTask = 'DeleteTask'
}

@injectable()
export default class TaskListStore extends Store {
  constructor(
    private toaster: Toaster,
    private streamPushApis: StreamPushApis
  ) {
    super()
    makeObservable(this)
    Toaster.bindTo(this, this.toaster)
  }

  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @observable isEnd = false

  @observable marker = ''

  @observable searchKeywords = ''

  @observable.ref taskList: StreamPushTask[] = []

  @observable.ref queryOptions: GetStreamPushTaskListOptions = { marker: this.marker, limit: pageSize }

  @computed
  get isTaskListLoading(): boolean {
    return this.loadings.isLoading(Loading.FetchTaskList)
  }

  @computed
  get isLoadingCreateTask(): boolean {
    return this.loadings.isLoading(Loading.CreateTask)
  }

  @computed
  get loadMoreProps(): LoadMore {
    return {
      loading: this.isTaskListLoading,
      hasMore: !this.isEnd,
      onLoad: this.loadMore
    }
  }

  @action.bound
  resetList() {
    this.isEnd = false
    this.marker = ''
    this.taskList = []
  }

  @action.bound
  refreshList() {
    this.resetList()
    this.updateQueryOptions({ name: this.searchKeywords })
    this.fetchTaskList()
  }

  @action.bound
  removeTask(taskID: string) {
    this.taskList = [...this.taskList.filter(task => task.taskID !== taskID)]
  }

  @action.bound
  updateSearchKeywords(searchKeywords: string) {
    this.searchKeywords = searchKeywords
  }

  @action.bound
  updateTaskList(rsp: StreamPushTaskList) {
    this.taskList = this.taskList.concat(rsp && rsp.list ? rsp.list : [])
    this.marker = rsp.marker
    this.isEnd = rsp.isEnd
  }

  @action.bound
  updateTaskInfo(taskIdx: number, taskInfo: Partial<StreamPushTask>) {
    const taskList = [...this.taskList]
    taskList[taskIdx] = Object.assign<StreamPushTask, Partial<StreamPushTask>>(this.taskList[taskIdx], taskInfo)
    this.taskList = taskList
  }

  @action.bound
  updateQueryOptions(options: Partial<GetStreamPushTaskListOptions>) {
    this.queryOptions = { ...this.queryOptions, ...options }
  }

  @action.bound
  handleSearchTasks(searchKeywords?: string) {
    this.resetList()
    if (searchKeywords) this.updateSearchKeywords(searchKeywords)
    this.updateQueryOptions({ name: this.searchKeywords, marker: this.marker })
    this.fetchTaskList()
  }

  @autobind
  loadMore() {
    this.updateQueryOptions({ marker: this.marker })
    this.fetchTaskList()
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.FetchTaskList)
  fetchTaskList() {
    return this.streamPushApis.getStreamPushTaskList(this.queryOptions).then(this.updateTaskList)
  }

  @autobind
  @Toaster.handle('创建成功')
  @Loadings.handle(Loading.CreateTask)
  createTask(options: StreamPushTaskBaseInfo) {
    return this.streamPushApis.createStreamPushTask(options).then(_ => this.handleSearchTasks(options.name))
  }

  @autobind
  @Toaster.handle('任务已启动')
  startTask(taskIdx: number) {
    return this.streamPushApis.startStreamPushTask(this.taskList[taskIdx].taskID)
      .then(_ => this.updateTaskInfo(taskIdx, { status: StreamPushTaskStatus.Running }))
  }

  @autobind
  @Toaster.handle('任务已停止')
  stopTask(taskIdx: number) {
    return this.streamPushApis.stopStreamPushTask(this.taskList[taskIdx].taskID)
      .then(_ => this.updateTaskInfo(taskIdx, { status: StreamPushTaskStatus.Stopped }))
  }

  @autobind
  @Toaster.handle('删除成功')
  @Loadings.handle(Loading.DeleteTask)
  deleteTask(taskID: string) {
    return this.streamPushApis.deleteStreamPushTask(taskID).then(_ => this.removeTask(taskID))
  }
}
