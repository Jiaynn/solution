/**
 * @file Transfer api
 * @description Transfer 相关的接口
 * @author Surmon <i@surmon.me>
 */

import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { KodoProxyApiException, KodoProxyClient } from 'portal-base/kodo/apis/proxy'

import { proxy } from 'kodo/constants/apis'
import { RegionSymbol } from 'kodo/constants/region'

// 同步任务类型
export enum TransferTaskType {
  CrossRegion = 0, // 跨区域同步任务
  TwoWaySync = 1, // 双向同步任务
  CrossAccount = 2 // 跨账号体系迁移任务
}

// 任务状态
export enum TransferTaskStatus {
  Enabled = 'ENABLED', // 启用
  Disabled = 'DISABLED' // 停用
}

// 同步时文件冲突（同步文件与目标文件Hash不一致）处理策略
export enum ConflictStrategy {
  ForceReplace = 0, // 强制覆盖目标文件
  AutoReplace = 1, // 如果当前文件上传时间较新则覆盖目标文件
  Skip = 2 // 跳过当前同步
}

// 强制指定目标空间的参数，可实现跨账号体系的迁移，非必须，如设置该参数则必须保证参数中的所有参数都设置
export interface ITransferDstBktArgs {
  ak: string // 用户 AK
  sk: string // 用户 SK
  bkt_addr: string // 对应公有云的 bucket - 空间管理地址
  rs_addr: string // 对应公有云的 rs - 元数据地址
  up_addr: string // 对应公有云的 up - 上传地址
}

// 同步删除操作参数
export interface ITransferSyncDelArgs {
  sync_del: boolean // 同步删除操作开关
  del_before: number // 仅删除目标空间特定时间之前上传的文件，Unix 时间戳，精确到秒，若设置为0，则不匹配时间直接执行删除
}

export interface ICreateTransferTask {
  name: string // 任务名称，必须
  // uid: number // 用户Id，必须
  src_bkt: string // 源空间，必须
  dst_bkt: string // 目标空间，必须
  dst_bkt_args?: ITransferDstBktArgs
  sync_del_args?: ITransferSyncDelArgs // 同步删除操作，非必须
  is_sync: boolean // 是否同步历史数据，非必须，默认不同步
  conflict_strategy?: ConflictStrategy
  prefix?: string  // 同步过滤前缀，非必须
}

export interface ITransferTaskSource {
  uid: number
  bucket: string // 源空间名
  domain: string
  region: RegionSymbol
}

export interface ITransferTaskTarget {
  uid: number
  bucket: string // 目标空间名
  domain: string
  dst_bkt_args: ITransferDstBktArgs // 跨账号体系的迁移任务参数
  sync_del_args: ITransferSyncDelArgs // 同步删除操作，非必须
  region: RegionSymbol
}

export interface ITransferTask {
  id: string
  name: string
  source: ITransferTaskSource
  target: ITransferTaskTarget
  option: {
    is_sync: boolean
    conflict_strategy: ConflictStrategy
    prefix: string
  }
  created_at: string // 任务创建时间
  updated_at: string // 任务更新时间
  status: TransferTaskStatus // 任务状态
  job_done: number // 成功迁移数量
  job_failed: number // 失败迁移数量
  job_count: number // 总任务数量
  file_done_size: number // 总迁移文件大小
  last_job_put_time: string // 最近任务生成时间
  last_job_done_time: string // 最近任务完成时间
  marker: string // 当前历史数据列举进度，内部使用
  dispatched: boolean // 历史任务是否列举完成
  type: TransferTaskType
}

export interface IUserTransferTaskList {
  tasks: ITransferTask[]
}

@autobind
@injectable()
export class TranscodeApis {
  constructor(private kodoProxyClient: KodoProxyClient) { }

  // 创建任务
  createTransferTask(task: ICreateTransferTask): Promise<{ id: string }> {
    return this.kodoProxyClient.post<{ id: string }>(proxy.createTransferTask, task)
      .catch(error => {
        if (error instanceof KodoProxyApiException && (error.httpCode as number) === 612) {
          throw error.withMessage('任务已存在')
        }
        throw error
      })
  }

  // 删除任务
  deleteTransferTask(taskId: string, taskName: string): Promise<void> {
    return this.kodoProxyClient.post(proxy.deleteTransferTask, { id: taskId, name: taskName })
  }

  // 暂停任务
  stopTransferTask(taskId: string, taskName: string): Promise<void> {
    return this.kodoProxyClient.post(proxy.stopTransferTask, { id: taskId, name: taskName })
  }

  // 开始任务
  startTransferTask(taskId: string, taskName: string): Promise<void> {
    return this.kodoProxyClient.post(proxy.startTransferTask, { id: taskId, name: taskName })
  }

  // 查询单个任务
  getTransferTask(taskId: string): Promise<ITransferTask> {
    return this.kodoProxyClient.post(proxy.getTransferTask, { id: taskId })
  }

  // 查询当前用户的所有任务
  getTransferTasks(): Promise<IUserTransferTaskList> {
    return this.kodoProxyClient.post(proxy.getTransferTasks, {})
  }
}
