
import { sum, max, zip, isEmpty } from 'lodash'
import { Moment } from 'moment'

import { responseTimeSeriesMap, downloadSpeedSeriesMap } from 'cdn/constants/apm'

import { ISearchOptionProps } from 'cdn/components/Apm/Search/store'

import { Freq } from 'cdn/apis/apm'

import { ISeriesData } from './chart'

export function isOptionsValid(options: Partial<ISearchOptionProps>): boolean {
  return !checkOptions(options)
}

export function checkOptions(options: Partial<ISearchOptionProps>): string | undefined {
  if (isEmpty(options)) {
    return '选项不能为空'
  }

  // 公共的必填项：域名
  if (!options.domain) {
    return '请选择域名'
  }

  // 公共的必填项：时间范围
  if (!options.startDate || !options.endDate) {
    return '请选择开始时间和结束时间'
  }

  if (!options.freq) {
    return '请选择时间粒度'
  }
  if (!options.regions || options.regions.length === 0) {
    return '请勾选地区'
  }
  if (!options.isps || options.isps.length === 0) {
    return '请选择运营商'
  }
}

export function transformNormalLineSeries(
  data: { time: number[], [valueProp: string]: number[] },
  parseSeriesName?: (name: string) => string
): ISeriesData[] {
  const res: ISeriesData[] = []
  Object.keys(data).forEach(
    seriesName => {
      if (seriesName !== 'time') {
        const item = {
          name: parseSeriesName ? parseSeriesName(seriesName) : seriesName,
          data: zip(data.time, data[seriesName]) as Array<[number | string, number]>,
          total: sum(data[seriesName]),
          max: max(data[seriesName])
        }
        res.push(item)
      }
    }
  )
  return res
}

export function getAllSeriesTotal(series: ISeriesData[]) {
  const lineTotals = series.map(item => item.total)
  return sum(lineTotals)
}

export function getTotalSeriesTotal(data: { time: number[], [valueProp: string]: number[] }) {
  const totalData = { time: data.time, total: data.total }
  const series = transformNormalLineSeries(totalData)
  const lineTotals = series.map(item => item.total)
  return sum(lineTotals)
}

export function getExportName(start: Moment, end: Moment, item: string) {
  const format = 'YYYY-MM-DD'
  const startDate = start.clone().format(format)
  const endDate = end.clone().format(format)

  return `${startDate}_to_${endDate}_${item}`
}

export function getFreqByDiffHour(diffHour: number): Freq {
  const hour = Math.abs(diffHour)
  if (hour < 48) {
    return '15min'
  }
  if (hour < 14 * 24) {
    return '1hour'
  }
  return '1day'
}

export function getResponseTimeSeriesName(key: string): string {
  return responseTimeSeriesMap[key] || key
}

export function getDownloadSpeedSeriesName(key: string): string {
  return downloadSpeedSeriesMap[key] || key
}
