/**
 * @file relative datetime functions
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import moment from 'moment'

import { RangePickerValue } from 'kodo/polyfills/icecream/date-picker'

import { Granularity, granularityDateRangeLimitMap } from 'kodo/constants/date-time'

// 获取距指定一定时间段的时间范围，比如最近七天...
export function getLatestDuration(
  value: number,
  time?: moment.Moment,
  unit?: moment.unitOfTime.DurationConstructor
): [moment.Moment, moment.Moment] {
  const end = time || new Date()
  const start = moment(end).subtract(value, unit).startOf(unit)
  if (unit === 'day' || unit === 'd' || unit === 'days') {
    return [start, moment(end).endOf(unit)]
  }

  return [start, moment(end)]
}

// 该函数用于获取指定日期类型的时间范围，比如本月、上个月、本年
export function getMomentRangeBaseDuration(
  duration?: moment.unitOfTime.DurationConstructor,
  initTime?: moment.MomentInput
): [moment.Moment, moment.Moment] {
  duration = duration || 'day'
  const time = initTime || new Date()
  const start = moment(time).startOf(duration)
  const end = moment(time).endOf(duration)
  return [start, end]
}

// 接口返回的时间戳不能直接转换，需要转换一下
export function extractTimeStamp(value: number) {
  return parseInt(value.toString().slice(0, 13), 10)
}

export function humanizeTimestamp(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  return moment(timestamp).format(format)
}

export function getFormattedDateRangeValue(
  dateRange: RangePickerValue,
  format = 'YYYYMMDDHHmmss',
  defaultDateRange: RangePickerValue = getLatestDuration(6, undefined, 'days')
): [string, string] {
  const [startDate, endDate] = dateRange

  if (startDate && endDate) {
    return [startDate.format(format), endDate.format(format)]
  }

  return [defaultDateRange[0]!.format(format), defaultDateRange[1]!.format(format)]
}

export const granularityFormatMap = {
  [Granularity.HalfMinutes]: 'YYYY-MM-DD HH:mm:ss',
  [Granularity.FiveMinutes]: 'YYYY-MM-DD HH:mm:00',
  [Granularity.OneHour]: 'YYYY-MM-DD HH:00:00',
  [Granularity.OneDay]: 'YYYY-MM-DD'
} as const

/**
 * 检查日期范围是否是有效的没有超出最大范围
 *
 * @param range - Ant Design RangePicker Value
 * @param granularity 粒度
 */
export function isValidateDateRange(range: RangePickerValue, granularity: Granularity) {
  const [start, end] = range
  if (start == null || end == null) return false

  const maxDate = start.clone()
  maxDate.add(...granularityDateRangeLimitMap[granularity]).subtract(1, 'day').endOf('day')
  return end <= maxDate
}

/**
 * 把时间戳转化成 hours minutes seconds
 */
export function getHourMinSec(t: number) {
  if (!t) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0
    }
  }

  const time = Math.floor(t)

  const seconds = time % 60
  const minutes = Math.floor((t % 3600) / 60)
  const hours = Math.floor(t / 3600)
  return {
    hours,
    minutes,
    seconds
  }
}

/**
 * 转化成 hh:mm:ss 形式
 *
 * @param times - seconds
 */
export function humanizeDuration(times: number) {
  if (Number.isNaN(times)) return '00:00'
  const hours = Math.floor(times / 3600)
  const minutes = Math.floor((times - (hours * 3600)) / 60)
  const seconds = Math.floor(times - (hours * 3600) - (minutes * 60))

  return [...[hours].filter(Boolean), minutes, seconds].map(t => t.toString().padStart(2, '0')).join(':')
}
