/**
 * @file refresh-prefetch apis
 * @author gaoupon <gaopeng01@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'

import RefreshPrefetchClient from './clients/refresh-prefetch'

export interface ISurplusInfo {
  dirQuotaDay: number
  dirSurplusDay: number
  quotaDay: number
  surplusDay: number
  urlQuotaDay: number
  urlSurplusDay: number
}

export interface IRefreshUrlParam {
  urls: string[]
}

export interface IRefreshDirParam {
  dirs: string[]
}

export interface IPrefetchUrlParam {
  urls: string[]
}

export interface IQueryLogParam {
  pageNo: number
  pageSize: number
  urls?: string[]
}

export interface ILogItem {
  beginAt: string
  createAt: string
  endAt: string
  midState: string
  progress: number
  requestId: string
  state: string
  stateDetail: string
  uid: number
  url: string
  isDir: IsDir
}

export interface ILogResult {
  currentSize: number
  items: ILogItem[]
  pageNo: number
  pageSize: number
  total: number
}

export type TRPLog = 'refresh' | 'prefetch'
export type IsDir = 'no' | 'yes'

@injectable()
export default class RefreshPrefetchApi {
  constructor(private client: RefreshPrefetchClient) {}

  getRefreshDirStatus(): Promise<string> {
    return this.client.get<{ refreshDirStatus: string }>('/refresh/user/setting').then(
      res => res.refreshDirStatus
    )
  }

  getRefreshPrefetchLog(param: IQueryLogParam, type: TRPLog) {
    return this.client.post<ILogResult>(`/${type}/list`, param)
  }

  getSurplus() {
    return this.client.get<ISurplusInfo>('/refresh/user/surplus')
  }

  refresh(param: IRefreshDirParam | IRefreshUrlParam): Promise<void> {
    return this.client.post<void>('/refresh', param)
  }

  prefetch(param: IPrefetchUrlParam): Promise<void> {
    return this.client.post<void>('/prefetch', param)
  }
}
