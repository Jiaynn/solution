/**
 * @desc store for video slim preview
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import { observable, action, reaction } from 'mobx'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import VideoSlimApis, { IVideoSlimTask } from 'cdn/apis/video-slim'

import { PlayerStatus } from './VideoPlayer'
import { ISnapshotPair } from './Snapshots'

import { IProps } from '.'

export enum Loading {
  GetTask = 'GetTask',
  CaptureSnapshot = 'CaptureSnapshot',
  VideoBefore = 'VideoBefore',
  VideoAfter = 'VideoAfter'
}

export enum Status {
  Paused = 'paused',
  Playing = 'playing'
}

@injectable()
export class LocalStore extends Store {
  loadings = new Loadings()

  @observable.ref task!: IVideoSlimTask

  constructor(
    @injectProps() private props: IProps,
    private videoSlimApis: VideoSlimApis,
    private toasterStore: ToasterStore
  ) {
    super()
    ToasterStore.bindTo(this, this.toasterStore)
  }

  @action updateTask(task: IVideoSlimTask) {
    this.task = task
  }

  // 最终应该统一的播放状态
  @observable status: Status = Status.Paused
  @action updateStatus(status: Status) {
    this.status = status
  }

  getPlayerStatus(target: string): PlayerStatus {
    if (this.loadings.isLoading(target)) { // target 在 seeking 过程中
      return PlayerStatus.Waiting
    }
    // 其他视频在 seeking 或任一视频在截帧，当前指令又是 play，因此先暂停 target
    if (this.status === Status.Playing && !this.loadings.isAllFinished()) {
      return PlayerStatus.Paused
    }
    return this.status as any
  }

  // 播放时间
  @observable time = 0
  @action updateTime(time: number) {
    this.time = time
  }

  @observable.ref snapshots: ISnapshotPair[] = []

  @action addSnapshots(snapshots: ISnapshotPair) {
    this.snapshots = this.snapshots
      .concat(snapshots)
      .sort((a, b) => a.before.time - b.before.time)
  }

  @ToasterStore.handle()
  fetchTaskInfo(taskId: string) {
    const req = this.videoSlimApis.getVideoSlimTaskInfo(taskId).then(
      res => this.updateTask(res)
    )
    return this.loadings.promise(Loading.GetTask, req)
  }

  init() {
    // 获取瘦身任务信息
    this.addDisposer(reaction(
      () => this.props.taskId,
      taskId => {
        if (taskId) {
          this.fetchTaskInfo(taskId)
        }
      },
      { fireImmediately: true }
    ))

  }
}
