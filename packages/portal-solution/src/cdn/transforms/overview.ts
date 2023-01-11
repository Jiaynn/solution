
import moment from 'moment'
import { sum, max } from 'lodash'
import { RawLocaleMessage } from 'portal-base/common/i18n'

import { transformNormalLineSeries, combineTrafficPoints, LineSeriesData } from 'cdn/transforms/statistics'

import { ISeriesData } from 'cdn/transforms/chart'

import { trafficDateFormat } from 'cdn/constants/statistics'
import { TimeRange, TrafficType } from 'cdn/constants/overview'

import { IGetStatisticsOptions, IStatisticsGroupByUsage } from 'cdn/apis/statistics'

const seriesNameMap = {
  cdnPoints: {
    cn: '静态',
    en: 'Static'
  },
  dcdnPoints: {
    cn: '动态',
    en: 'Dynamic'
  },
  total: {
    cn: '全部',
    en: 'Total'
  },
  reqcount: {
    cn: '动态请求次数',
    en: 'Dynamic Request count'
  }
}

export type StatisticsOptions = {
  current: IGetStatisticsOptions,
  previous: IGetStatisticsOptions
}

// 按选择的 “今日”、“本月” 来获取前后时间段统计请求参数
export function getStatisticsOptions(timeRange: TimeRange): StatisticsOptions {
  // 当天与昨天
  if (timeRange === TimeRange.Today) {
    const commonDayOptions: Pick<IGetStatisticsOptions, 'g' | 'group'> = {
      g: '5min',
      group: ''
    }
    return {
      current: {
        start: moment().startOf('day').format(trafficDateFormat),
        end: moment().format(trafficDateFormat),
        ...commonDayOptions
      },
      previous: {
        start: moment().subtract(1, 'day').startOf('day').format(trafficDateFormat),
        end: moment().subtract(1, 'day').format(trafficDateFormat),
        ...commonDayOptions
      }
    }
  }

  // 当月与上月
  const commonMonthOptions: Pick<IGetStatisticsOptions, 'g' | 'group'> = {
    g: 'day',
    group: ''
  }

  const currentDay = moment().date()
  let previousEndTime = moment().subtract(1, 'M').endOf('month')

  if (previousEndTime.date() > currentDay) {
    previousEndTime = moment().subtract(1, 'M').startOf('month').add(currentDay, 'day')
  }

  return {
    current: {
      start: moment().startOf('month').format(trafficDateFormat),
      end: moment().format(trafficDateFormat),
      ...commonMonthOptions
    },
    previous: {
      start: moment().subtract(1, 'M').startOf('month').format(trafficDateFormat),
      end: previousEndTime.format(trafficDateFormat),
      ...commonMonthOptions
    }
  }
}

export type TrafficSummary = {
  total: number
  increase: number
}

export type ComparePointsOptions = {
  previousPoints: number[]
  currentPoints: number[]
}

export function compareTimelinePoints({ previousPoints, currentPoints }: ComparePointsOptions): TrafficSummary {
  const previousTotal = sum(previousPoints)
  const currentTotal = sum(currentPoints)

  return {
    total: currentTotal,
    increase: calculateIncrease(previousTotal, currentTotal)
  }
}

export function compareBandwidthPoints({ previousPoints, currentPoints }: ComparePointsOptions): TrafficSummary {
  const previousPeak = max(previousPoints)!
  const currentPeak = max(currentPoints)!

  return {
    total: currentPeak,
    increase: calculateIncrease(previousPeak, currentPeak)
  }
}

export function calculateIncrease(previous: number, current: number): number {
  const diff = current - previous
  let increase: number

  if (diff === 0) {
    increase = 0
  } else if (previous === 0) {
    if (diff > 0) {
      increase = 100
    } else {
      increase = -100
    }
  } else {
    increase = (diff / previous) * 100
  }

  return increase
}

export type TrafficTimelineOptions = {
  previousRes: IStatisticsGroupByUsage
  currentRes: IStatisticsGroupByUsage
  trafficType: TrafficType
  timeRange: TimeRange
  hideDynTraffic?: boolean
}

export type TrafficTimeLineResult = {
  summary: TrafficSummary
  series: Array<ISeriesData<RawLocaleMessage>>
}

export function transformTrafficTimelineData(options: TrafficTimelineOptions): TrafficTimeLineResult {
  const { previousRes, currentRes, timeRange, trafficType, hideDynTraffic } = options
  const previousPoints = combineTrafficPoints(previousRes)
  const currentPoints = combineTrafficPoints(currentRes)
  const { cdnPoints, dcdnPoints, time } = currentRes.data

  let summaryOptions = { previousPoints, currentPoints }
  let timelineData: LineSeriesData

  if (trafficType === TrafficType.Reqcount) {
    timelineData = { reqcount: dcdnPoints, time }
  } else if (hideDynTraffic) {
    timelineData = { cdnPoints, time }
  } else {
    timelineData = { cdnPoints, dcdnPoints, time }
  }

  if (timeRange === TimeRange.Today) {
    summaryOptions = cutOffSummaryPoints(summaryOptions)
    timelineData = cutOffTimelinePoints(timelineData)
  }

  const summary = trafficType === TrafficType.Bandwidth
    ? compareBandwidthPoints(summaryOptions)
    : compareTimelinePoints(summaryOptions)

  const series = transformNormalLineSeries(
    timelineData,
    name => seriesNameMap[name as keyof typeof seriesNameMap] ?? { cn: name, en: name }
  )

  return { summary, series }
}

/**
 * 即使传的时间非全天，返回的仍然为全天的时间点数据，需手动截取时间段来计算总和
 */
export function cutOffSummaryPoints(options: ComparePointsOptions): ComparePointsOptions {
  const count = Math.floor((moment().minutes() + moment().hours() * 60) / 5) || 1
  const result = {} as ComparePointsOptions

  (Object.keys(options) as Array<keyof ComparePointsOptions>).forEach(key => {
    result[key] = options[key].slice(0, count)
  })

  return result
}

/**
 * 查当日数据时，计量数据有延迟，所以图表只展示到 45 分钟前的数据
 */
export function cutOffTimelinePoints(options: any): any {
  const offsetMinutes = 45
  const result: Record<string, any> = {}

  // 如果时间在当天的 00:45 之前展示暂无数据
  if (!(moment().hour() === 0 && moment().minute() <= offsetMinutes)) {
    const endTime = moment().subtract(offsetMinutes, 'minute')
    const count = Math.floor((endTime.minutes() + endTime.hours() * 60) / 5)
    Object.keys(options).forEach(key => {
      result[key] = options[key].slice(0, count)
    })
  }

  return result
}
