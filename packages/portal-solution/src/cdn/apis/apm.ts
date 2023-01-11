/**
 * @file apm apis
 * @author zhuhao <zhuhao@qiniu.com>
 * @author linchen <gakiclin@gmail.com>
 */

import moment from 'moment'
import { injectable } from 'qn-fe-core/di'

import { prefix } from 'cdn/constants/api'

import CommonClient from './clients/common'

export type Freq = '1day' | '1hour' | '15min'

// 用于系统内部
export interface IApmOptions {
  domain?: string
  freq: Freq
  regions: string[]
  isps: string[]
  startDate: moment.Moment
  endDate: moment.Moment
}

// 用于发送请求
interface IApmParams {
  domain: string
  freq: Freq
  regions: string[]
  isps: string[]
  startDate: string
  endDate: string
}

export interface IApmMetricData {
  time: number[]
  value: number[]
}

@injectable()
export default class ApmApis {
  private apiPrefix = `${prefix}/apm`

  constructor(private client: CommonClient) {}

  private getApmParams({ startDate, endDate, ...otherOptions }: IApmOptions): IApmParams {
    return {
      ...otherOptions,
      startDate: startDate.format('YYYY-MM-DD-HH-mm'),
      endDate: endDate.format('YYYY-MM-DD-HH-mm')
    } as IApmParams
  }

  fetchDownloadSpeed(option: IApmOptions) {
    return this.client.post<IApmMetricData>(`${this.apiPrefix}/downspeed`, this.getApmParams(option))
  }

  fetchResponseTime(option: IApmOptions) {
    return this.client.post<IApmMetricData>(`${this.apiPrefix}/restime`, this.getApmParams(option))
  }
}
