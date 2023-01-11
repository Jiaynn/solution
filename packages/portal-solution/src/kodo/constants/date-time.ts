/**
 * @file common constants of date-time
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

export enum Granularity {
  HalfMinutes = '30s',
  FiveMinutes = '5min',
  OneHour = 'hour',
  OneDay = 'day'
}

export const granularityTextMap = {
  [Granularity.HalfMinutes]: '30 秒',
  [Granularity.FiveMinutes]: '5 分钟',
  [Granularity.OneHour]: '小时',
  [Granularity.OneDay]: '天'
} as const

export const granularityDateRangeLimitMap = {
  [Granularity.FiveMinutes]: [1, 'month'],
  [Granularity.OneHour]: [3, 'months'],
  [Granularity.OneDay]: [3, 'months']
} as const

export const granularityDateRangeLimitTextMap = {
  [Granularity.FiveMinutes]: '数据粒度为 ' + granularityTextMap[Granularity.FiveMinutes] + ' 时，数据查询最大时间范围为一个月',
  [Granularity.OneHour]: '数据粒度为 ' + granularityTextMap[Granularity.OneHour] + ' 时，数据查询最大时间范围为三个月',
  [Granularity.OneDay]: '数据粒度为 ' + granularityTextMap[Granularity.OneDay] + ' 时，数据查询最大时间范围为三个月'
} as const

export const intervalsOf5Minutes = {
  [Granularity.OneHour]: 12,  // 60m / 5m
  [Granularity.OneDay]: 288   // 24h * 60m / 5m
} as const

export const fiveMinutesSeconds = 300 // 5m * 60s
