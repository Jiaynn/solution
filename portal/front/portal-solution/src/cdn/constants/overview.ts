/**
 * @file overview constants
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */
import { valuesOfEnum } from 'cdn/utils'

export enum TimeRange {
  Today = 'today',
  CurrentMonth = 'currentMonth'
}

export const timeRangeTextMap = {
  [TimeRange.Today]: {
    cn: '今天',
    en: 'Today'
  },
  [TimeRange.CurrentMonth]: {
    cn: '本月',
    en: 'This month'
  }
} as const

export const timeRangeValues = valuesOfEnum(TimeRange)

export enum TrafficType {
  Flow = 'flow',
  Bandwidth = 'bandwidth',
  Reqcount = 'reqcount'
}

export const trafficTypeTextMap = {
  [TrafficType.Flow]: {
    cn: '流量',
    en: 'Traffic'
  },
  [TrafficType.Bandwidth]: {
    cn: '带宽',
    en: 'Bandwidth'
  },
  [TrafficType.Reqcount]: {
    cn: '动态请求次数',
    en: 'Dynamic ReqCount'
  }
} as const

export const trafficTypeValues = valuesOfEnum(TrafficType)
