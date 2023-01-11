/**
 * @desc 视频瘦身相关接口
 * @author yaojingtian <yaojingtian@qiniu.com>
 * @author linchen <gakiclin@gmail.com>
 */

import { Moment } from 'moment'
import { injectable } from 'qn-fe-core/di'

import { isMP4 } from 'cdn/transforms/video-slim'

import { IListWithPageOf } from 'cdn/constants/api'
import { TaskState, VideoDef } from 'cdn/constants/video-slim'
import { logAnalysisDateFormat } from 'cdn/constants/statistics'

import StatisticsApis, { BatchFetchTopOptions } from './statistics'
import VideoSlimClient from './clients/video-slim'

export interface IVideoSlimTaskListReq {
  pageIndex: number
  pageSize: number
  domains?: string[]
  searchKeyword?: string // 模糊搜索 URL 关键字
  urls?: string[] // 用于精确查询 URL
  states?: TaskState[]
  rangeGTE?: string // 时间范围下限 (包含), 格式: RFC3339
  rangeLT?: string // 时间范围上限 (不包含), 格式: RFC3339
  deletedAndLastStateSlimSuccess?: boolean // 是否包含已删除且删除前为瘦身成功的任务
}

export interface IVideoSlimTask {
  id: string
  resource: string // 任务资源
  newUrl: string // 瘦身后资源 url
  urls: string[] // 异步任务的 urls 数组
  desc: string // 任务描述
  tid: string // dora 任务 id
  ignoreQuery: boolean
  cdnAutoEnable: boolean // 自动启用 CDN 分发
  domain: string
  createAt: string // 任务创建时间，格式: RFC3339
  updateAt: string // 任务更新时间，格式: RFC3339
  cdnOpAt: string // CDN 启用或者停用时间，格式: RFC3339
  avType: string // 视频格式，例如 mp4
  state: TaskState // 任务状态
  stateDesc: string // 任务状态描述
  cdnState: boolean // cdn 打开状态
  originDef: VideoDef // 原始视频规格（HD|SD|2K）
  afterDef: VideoDef // 瘦身后视频规格（HD|SD|2K）
  originDur: number // 原始视频时长，单位 s
  originSize: number // 原始视频大小，单位 Byte
  originBr: number // 原始视频码率，单位 bps
  afterSize: number // 瘦身后视频大小，单位 Byte
  afterDur: number // 瘦身后视频时长，单位 s
  afterBr: number // 瘦身后视频码率，单位 bps
  slimRate: number // 瘦身前 size/瘦身后 size - 1（用于计算节省流量）
}

export interface IVideoFile {
  url: string
  value: number // 最近 2 日的流量
  slimed: boolean // 是否瘦身过，true 表示在当前域名的有效任务列表里的
}

export interface ITopNVideoFilesReq {
  domain: string
  startDate: Moment
  endDate: Moment
  topN: number
}

export interface ICreateVideoSlimTasksReq {
  urls: string[]
  cdnAutoEnable: boolean
  domain: string
}

export interface IEffect<T> {
  success: string[]
  failed: T[]
}

export type IModifyVideoSlimTasksRes = IEffect<{ id: string, err: Error }>

export type ICreateVideoSlimTasksRes = IEffect<{ url: string, err: Error }>

@injectable()
export default class VideoSlimApi {
  constructor(
    private client: VideoSlimClient,
    private statisticsApis: StatisticsApis
  ) {}

  getVideoSlimTaskList(params: IVideoSlimTaskListReq) {
    return this.client.post<IListWithPageOf<IVideoSlimTask>>('/get/tasks', {
      ...params,
      syncState: true // 默认要同步 dora 那边的视频瘦身结果
    })
  }

  getVideoSlimTaskInfo(taskId: string) {
    return this.client.get<IVideoSlimTask>(`/task/${taskId}`)
  }

  getTopNVideoFiles(params: ITopNVideoFilesReq): Promise<IVideoFile[]> {
    // 获得流量 TopN 的 url => 过滤可能是 mp4 的 URL => 请求对应任务
    const topUrlParams: BatchFetchTopOptions = {
      domains: [params.domain],
      startDate: params.startDate.format(logAnalysisDateFormat),
      endDate: params.endDate.format(logAnalysisDateFormat),
      regions: ['global']
    }
    return this.statisticsApis.batchFetchAccessTop(this.statisticsApis.fetchTopUrlByFlow, topUrlParams).then(
      traffic => {
        const mp4Urls = (traffic || []).filter(v => isMP4(v.key))
        if (mp4Urls.length === 0) {
          return []
        }
        return this.getVideoSlimTaskList({
          urls: mp4Urls.map(v => v.key),
          pageIndex: 1,
          pageSize: mp4Urls.length
        }).then(
          ({ list }) => mp4Urls.map(
            ({ key: url, value }) => {
              // 若存在瘦身任务，则表示已启动瘦身
              const slimed = !!list.find(task => task.urls.indexOf(url) !== -1)
              return { url, value, slimed }
            }
          ).slice(0, params.topN)
        )
      }
    )
  }

  createVideoSlimTasks(params: ICreateVideoSlimTasksReq) {
    return this.client.post<ICreateVideoSlimTasksRes>('/task', params)
  }

  enableVideoSlimTask(ids: string[]) {
    return this.client.post<IModifyVideoSlimTasksRes>('/task/cdn/enable', {
      ids,
      ignorePrefetch: false // 是否要忽略预取，默认不忽略
    })
  }

  disableVideoSlimTask(ids: string[]) {
    return this.client.post<IModifyVideoSlimTasksRes>('/task/cdn/disable', {
      ids,
      ignorePrefetch: false // 是否要忽略预取，默认不忽略
    })
  }

  cdnAutoEnableVideoSlimTask(cdnAutoEnable: boolean, ids: string[] = []) {
    return this.client.post<IModifyVideoSlimTasksRes>('/task/cdn/auto/enable', {
      autoEnable: ids.map(id => ({
        id,
        enable: cdnAutoEnable
      }))
    })
  }

  deleteVideoSlimTask(ids: string[]) {
    return this.client.fetch<IModifyVideoSlimTasksRes>('/task', {
      method: 'DELETE',
      payload: { ids }
    })
  }
}
