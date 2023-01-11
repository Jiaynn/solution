/**
 * @desc Stream push constants
 * @author hovenjay <hovenjay@outlook.com>
 */

export const pageSize = 50

export enum StreamPushTaskStatus {
  Pending = 'pending',
  Running = 'running',
  Stopped = 'stopped',
  Failed = 'failed',
  Finished = 'finished'
}

export const streamPushTaskStatusNameMap = {
  [StreamPushTaskStatus.Pending]: '未开始',
  [StreamPushTaskStatus.Running]: '进行中',
  [StreamPushTaskStatus.Stopped]: '停止',
  [StreamPushTaskStatus.Failed]: '异常',
  [StreamPushTaskStatus.Finished]: '结束'
} as const

export const streamPushTaskStatusColorMap = {
  [StreamPushTaskStatus.Pending]: 'grey6',
  [StreamPushTaskStatus.Running]: 'green4',
  [StreamPushTaskStatus.Stopped]: 'grey6',
  [StreamPushTaskStatus.Failed]: 'red2',
  [StreamPushTaskStatus.Finished]: 'grey6'
} as const

export enum StreamPushTabKey {
  Tasks = 'tasks',
  Histories = 'histories'
}

export const streamPushTabNameMap = {
  [StreamPushTabKey.Tasks]: '任务列表',
  [StreamPushTabKey.Histories]: '执行记录'
} as const
