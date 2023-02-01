/**
 * @file 拉流转推流相关接口
 * @author hovenjay <hovenjay@outlook.com>
 */

import autobind from 'autobind-decorator'

import { injectable } from 'qn-fe-core/di'

import { proxy } from 'kodo/constants/apis'

import { StreamPushTaskStatus } from 'kodo/constants/stream-push'

import { ProeProxyClient } from 'kodo/clients/proxy-proe'

export interface StreamPushSourceUrl {
  url: string
}

export interface StreamPushTaskBaseInfo {
  name: string                        // 任务名称
  sourceUrls: [StreamPushSourceUrl]   // 拉流地址，数组长度只能为 1 个
  runType: 'normal'                   // 转推类型，必须是 normal
  stream: string                      // 默认与 name 相同
  bucket: string                      // 转推目标空间名称
  triggerNow?: boolean                // 创建任务后，是否立即启动任务开始拉流
  deliverStartTime?: number           // 定时开启
  deliverStopTime?: number            // 定时关闭
}

export interface CreateStreamPushTaskResponse {
  taskID: string
}

export interface StreamPushTaskOperateResult {
  code: number
}

export interface StopStreamPushTaskOption {
  deleteTask: boolean
}

export interface GetStreamPushTaskListOptions {
  marker?: string
  limit?: number
  name?: string
}

export interface StreamPushTask extends StreamPushTaskBaseInfo {
  taskID: string
  status: StreamPushTaskStatus
  startTime: number
  stopTime: number
}

export interface StreamPushTaskList {
  marker: string
  isEnd: boolean
  list: StreamPushTask[]
}

export interface GetStreamPushTaskExecHistoriesOptions {
  marker?: string
  limit?: number
  name?: string
  start?: number
  end?: number
}

export interface TaskExecHistory {
  name: string
  status: StreamPushTaskStatus
  startTime: string
  stopTime: string
  message: string
}

export interface TaskExecHistories {
  marker: string
  isEnd: boolean
  histories: TaskExecHistory[]
}

@autobind
@injectable()
export class StreamPushApis {
  constructor(private proeProxyClient: ProeProxyClient) { }

  /**
   * 创建推流任务
   * @param payload - 任务信息
   */
  createStreamPushTask(payload: StreamPushTaskBaseInfo): Promise<CreateStreamPushTaskResponse> {
    return this.proeProxyClient.post(proxy.streamPushTask, payload)
  }

  /**
   * 启动推流任务
   * @param taskID - 任务 ID
   */
  startStreamPushTask(taskID: string): Promise<StreamPushTaskOperateResult> {
    return this.proeProxyClient.post(proxy.streamPushTask + '/' + taskID + '/start', {})
  }

  /**
   * 停止推流任务
   * @param taskID - 任务 ID
   * @param options - 删除操作 相关配置项
   */
  stopStreamPushTask(
    taskID: string,
    options?: StopStreamPushTaskOption
  ): Promise<StreamPushTaskOperateResult> {
    return this.proeProxyClient.post(proxy.streamPushTask + '/' + taskID + '/stop', options || {})
  }

  /**
   * 删除推流任务
   * @param taskID - 任务 ID
   */
  deleteStreamPushTask(taskID: string): Promise<StreamPushTaskOperateResult> {
    return this.proeProxyClient.delete(proxy.streamPushTask + '/' + taskID, {})
  }

  /**
   * 查询推流任务列表
   * @param options - 查询参数
   */
  getStreamPushTaskList(options: GetStreamPushTaskListOptions): Promise<StreamPushTaskList> {
    return this.proeProxyClient.get(proxy.streamPushTask, options)
  }

  /**
   * 查询推流任务执行历史记录
   * @param options - 查询参数
   */
  getSteamPushTaskExecHistories(
    options: GetStreamPushTaskExecHistoriesOptions
  ): Promise<TaskExecHistories> {
    return this.proeProxyClient.get(proxy.streamPushHistory, options)
  }
}
