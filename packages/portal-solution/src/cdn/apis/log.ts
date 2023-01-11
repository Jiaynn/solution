/**
 * @file log apis
 * @author gaoupon <gaopeng01@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'

import DefyLogClient from './clients/defy-log'

export interface IFilterOptions {
  domains: string[]
  start: number
  end: number
  marker: string
  limit: number
}

export interface ILog {
  name: string
  size: number
  time: number
  url: string
}

export interface ITask {
  domain: string
  start: number
  end: number
  finish: number
  status: string
  logs: ILog[]
}

@injectable()
export default class LogApis {
  constructor(
    private client: DefyLogClient
  ) { }

  getFusionLogs(param: IFilterOptions): Promise<ITask[]> {
    return this.client.post<{data: ITask[]}>('/v2/log/tasks', param).then(
      res => (res.data || [])
    )
  }
}
