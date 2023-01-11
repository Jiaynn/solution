/*
 * @file 并发执行任务的控制器
 * @author nighca <nighca@live.cn>
 */
// copy from kodo-web

import { observable, when, action, makeObservable } from 'mobx'

// TODO should be store
// TODO 单测

export default class Cluster<T, R> {
  constructor(
    private runTask: (task: T) => Promise<R>,
    private workerNum: number
  ) {
    makeObservable(this)
  }

  private queue: T[] = []
  @observable private left = 0

  @observable private index = 0
  private result: R[] = []

  @action private handleWorkerFinish(index: number, res: R) {
    this.result[index] = res
    this.left--
  }

  @action private startWorker() {
    if (this.queue.length === 0) {
      return
    }
    const index = this.index++
    const task = this.queue.shift()!
    this.runTask(task).catch(err => err).then(
      (res: R) => {
        this.handleWorkerFinish(index, res)
        this.startWorker()
      }
    )
  }

  @action start(tasks: T[]): Promise<R[]> {
    this.queue = (tasks || []).slice()
    this.left = this.queue.length
    for (let i = 0; i < this.workerNum; i++) {
      this.startWorker()
    }
    return new Promise(resolve => when(
      () => this.left === 0,
      () => resolve(this.result)
    ))
  }
}
