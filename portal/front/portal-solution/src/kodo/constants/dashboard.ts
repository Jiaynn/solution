/**
 * @file common constants of dashboard
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

export enum ReportType {
  Storage = 'storage',
  API = 'api',
  Flow = 'flow',
  Bandwidth = 'bandwidth',
  Transfer = 'transfer'
}

export const reportTextMap = {
  [ReportType.Storage]: '存储',
  [ReportType.API]: 'API 请求',
  [ReportType.Flow]: '空间流量',
  [ReportType.Bandwidth]: '空间带宽',
  [ReportType.Transfer]: '跨区域同步'
}

export interface ITabConfig {
  key: ReportType
  name: string
  path: string
}

export const bucketAll = '全部'
