/**
 * @file store of ResourceManage/BatchDeleteModal
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import { computed, observable, action, reaction, makeObservable } from 'mobx'
import { injectable } from 'qn-fe-core/di'
import Store from 'qn-fe-core/store'

import { KodoProxyErrorCode } from 'portal-base/kodo/apis/proxy'

export enum ModalState {
  None,
  Confirming,
  Deleting,
  ToRetry,
  Deleted,
  Cancelled
}

export enum TaskState {
  BeforeDelete,
  Deleting,
  Deleted,
  Failed,
  DeleteLatestVersionFailed
}

const taskStateTextMap = {
  [TaskState.BeforeDelete]: '待删除',
  [TaskState.Deleting]: '正在删除',
  [TaskState.Deleted]: '已删除',
  [TaskState.Failed]: '删除失败',
  [TaskState.DeleteLatestVersionFailed]: '最新版本文件不可删除'
} as const

export function humanizeTaskState(state: TaskState) {
  return taskStateTextMap[state] || '未知'
}

type TaskId = string

export interface ITaskDetailState {
  id: TaskId
  state: TaskState
  err?: any
}

@injectable()
export default class BatchDeleteModalStore extends Store {
  constructor() {
    super()
    makeObservable(this)
  }

  @observable state: ModalState
  @observable finishedTaskCount = 0
  @observable doDeleteTask: (id: string) => Promise<void>
  @observable complete: (keys: string[]) => void

  // key: task id
  taskDetailStateMap = observable.map<string, ITaskDetailState>({}, { deep: false })

  @observable.ref targetTaskIds: TaskId[] = []

  @action
  private updateState(state: ModalState) {
    this.state = state
  }

  @action.bound
  reset() {
    this.updateState(ModalState.None)
    this.taskDetailStateMap.clear()
    this.targetTaskIds = []
    this.finishedTaskCount = 0
  }

  @computed
  get visible(): boolean {
    return [
      ModalState.Confirming,
      ModalState.Deleting,
      ModalState.ToRetry
    ].includes(this.state)
  }

  @computed
  get isModalLoading() {
    return this.state === ModalState.Deleting
  }

  @computed
  get isRetrying(): boolean {
    return this.state === ModalState.Deleting
      && this.taskDetailStateMap.size !== this.targetTaskIds.length
  }

  @computed
  get tasks(): ITaskDetailState[] {
    return [...this.taskDetailStateMap.values()]
  }

  @computed
  get deletedTaskId(): string[] {
    return this.tasks.filter(item => item.state === TaskState.Deleted).map(item => item.id)
  }

  @computed
  get hasDeleted(): boolean {
    return this.tasks.some(task => task.state === TaskState.Deleted)
  }

  @computed
  get isDeleting(): boolean {
    return this.tasks.every(task => task.state !== TaskState.Deleting)
  }

  @action.bound
  cancel() {
    this.updateState(ModalState.Cancelled)
    if (this.finishedTaskCount > 0) {
      this.complete(this.deletedTaskId)
    }
  }

  @action.bound
  increaseFinishedTaskCount() {
    this.finishedTaskCount++
  }

  @action
  private finish() {
    this.updateState(ModalState.Deleted)
    this.complete(this.deletedTaskId)
  }

  @action
  private retry() {
    this.updateState(ModalState.ToRetry)
  }

  @action
  private updateTask(task: ITaskDetailState) {
    this.taskDetailStateMap.set(
      task.id,
      {
        ...task
      }
    )
  }

  @action
  private updateFailedTask(id: string, err: any) {
    this.increaseFinishedTaskCount()
    this.updateTask({
      id,
      err,
      state: (
        err.error_code && err.error_code === KodoProxyErrorCode.DelLatestVersion
          ? TaskState.DeleteLatestVersionFailed
          : TaskState.Failed
      )
    })
  }

  @action
  private updateDeletedTask(id: string) {
    this.increaseFinishedTaskCount()
    this.updateTask({
      id,
      state: TaskState.Deleted
    })
  }

  @action
  private deleteTask() {
    this.targetTaskIds.forEach(id => {
      this.updateTask({
        id,
        state: TaskState.Deleting
      })

      this.doDeleteTask(id).then(
        () => {
          this.updateDeletedTask(id)
        },
        err => {
          this.updateFailedTask(id, err)
        }
      )
    })
  }

  @action
  delete() {
    this.targetTaskIds = this.tasks
      .filter(
        ({ state }) => state === TaskState.BeforeDelete || state === TaskState.Failed
      )
      .map(task => task.id)
    this.deleteTask()
  }

  @action
  confirm(
    taskIds: TaskId[],
    task: (id: string) => Promise<void>,
    complete: (keys: string[]) => void
  ) {
    this.reset()
    this.doDeleteTask = task
    this.targetTaskIds = taskIds
    this.complete = complete
    taskIds.forEach(id => {
      this.updateTask({
        id,
        state: TaskState.BeforeDelete
      })
    })

    this.updateState(ModalState.Confirming)
  }

  @action.bound
  handleFinishedTaskCountChange(count: number) {
    if (count !== this.tasks.length) {
      return
    }

    const needRetryTasks = this.tasks.some(task => {
      const data = this.taskDetailStateMap.get(task.id)
      return !!(data && data.state === TaskState.Failed)
    })

    if (needRetryTasks) {
      this.retry()
      return
    }

    this.finish()

  }

  init() {
    this.addDisposer(reaction(
      () => this.finishedTaskCount,
      this.handleFinishedTaskCountChange
    ))
  }
}
