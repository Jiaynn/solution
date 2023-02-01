
import { computed, observable, reaction, action } from 'mobx'
import { isEmpty, sum } from 'lodash'
import autobind from 'autobind-decorator'
import dayjs from 'dayjs'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore } from 'portal-base/common/toaster'
import { I18nStore } from 'portal-base/common/i18n'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { exportCSVFile } from 'cdn/utils/csv'

import {
  isOptionsValid, getExportName,
  getAllSeriesTotal,
  transformCodePieSeries, transformNormalLineSeries
} from 'cdn/transforms/statistics'
import { humanizePercent, humanizePercent100 } from 'cdn/transforms/unit'
import { enhancedDivision } from 'cdn/transforms/math'
import { ISeriesData, getChartCSVData, getAreaChartOptions, getPieChartOptions, getReqcountUnit } from 'cdn/transforms/chart'

import { logAnalysisDateFormat, SearchType } from 'cdn/constants/statistics'

import StatisticsApis, { AnalysisCodeOptions, AnalysisCodeResponse } from 'cdn/apis/statistics'

import { ISearchOptionProps } from '../Search/store'
import * as messages from './messages'

export interface IStatisticsCodeProps {
  options: ISearchOptionProps
}

export type CodeTimeline = {
  [statusCode: string]: number[]
  time: number[]
}
export type CodeDetailItem = {
  code: number
  count: number
  percent: number
}

export type CodeResult = {
  timeline: CodeTimeline
  details: CodeDetailItem[]
}

enum LoadingType {
  Code = 'code'
}

@injectable()
export default class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  constructor(
    @injectProps() private props: IStatisticsCodeProps,
    private statisticsApis: StatisticsApis,
    private i18n: I18nStore
  ) {
    super()
  }

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @observable exportName = ''

  @action.bound updateExportName(name: string) {
    this.exportName = name
  }

  @computed get codeSearchOptions(): AnalysisCodeOptions {
    const { domains, startDate, endDate, freq } = this.props.options
    return {
      domains,
      freq,
      startDate: startDate.format(logAnalysisDateFormat),
      endDate: endDate.format(logAnalysisDateFormat),
      region: 'global'
    }
  }

  @computed get isOptionsValid(): boolean {
    return isOptionsValid(this.props.options, SearchType.Code)
  }

  @computed get isTimelineDataEmpty(): boolean {
    return isEmpty(this.timelineData)
  }

  // 状态码时间线数据
  @observable.ref timelineData = {} as CodeTimeline
  @observable.ref detailData: CodeDetailItem[] = []

  @action.bound updateData(data: CodeResult) {
    this.timelineData = data.timeline
    this.detailData = data.details
  }

  @computed get seriesData(): ISeriesData[] {
    return transformNormalLineSeries(
      this.timelineData as { time: number[] } & {},
      name => (name === 'others' ? this.i18n.t(messages.others) : name)
    )
  }

  @computed get areaChartTooltipData(): number[] {
    const tooltipData: number[] = []
    const codeKeys = Object.keys(this.timelineData as any).filter(key => key !== 'time')
    if (codeKeys.length > 0) {
      (this.timelineData as any)[codeKeys[0]].forEach((_: unknown, index: number) => {
        const total = sum(codeKeys.map(key => (this.timelineData as any)[key][index]))
        tooltipData.push(total)
      })
    }
    return tooltipData
  }

  @computed get areaChartOptions() {
    return getAreaChartOptions({
      unit: getReqcountUnit(this.i18n.t),
      decimals: 3,
      tooltipFormatter({ humanizeNum, pointData, tooltipData }) {
        const { pointDot, name, value, index } = pointData
        const valuesStr = `${humanizePercent(value / tooltipData[index])}(${humanizeNum(value)})`

        return `${pointDot} ${name}: <b>${valuesStr}</b><br/>`
      },
      tooltipData: this.areaChartTooltipData
    })
  }

  @computed get summary() {
    if (isEmpty(this.timelineData)) {
      return {
        total: null,
        average: null
      }
    }
    const total = getAllSeriesTotal(this.seriesData)
    const { startDate, endDate } = this.props.options
    const diff = endDate.diff(startDate, 'd') + 1
    return {
      total,
      average: enhancedDivision(total, diff)
    }
  }

  @computed get pieSeriesData() {
    if (!this.detailData || isEmpty(this.detailData)) {
      return []
    }
    return transformCodePieSeries(this.detailData, this.i18n.t(messages.statusCodeDistribution))
  }

  @computed get pieChartOptions() {
    return getPieChartOptions({
      tooltipFormatter({ pointData }) {
        const { pointDot, name, percentage } = pointData
        return `${pointDot} ${name}: <b>${humanizePercent100(percentage!)}</b><br/>`
      }
    })
  }

  @computed get pieTableData() {
    if (!this.detailData || isEmpty(this.detailData)) {
      return []
    }
    const total = sum(this.detailData.map(item => item.count))
    return this.detailData.sort(
      (prev, next) => next.count - prev.count
    ).map(
      item => ({
        ...item,
        percent: enhancedDivision(item.count, total)
      })
    )
  }

  @autobind
  exportAreaData() {
    exportCSVFile(getChartCSVData(this.seriesData), this.exportName)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.Code)
  fetchData() {
    return this.statisticsApis.fetchStatusCode(this.codeSearchOptions).then(
      data => this.updateData(transformResponseForDisplay(data))
    )
  }

  init() {
    // 若 optionsForQuery 发生变化，则请求 状态码 统计数据
    this.addDisposer(reaction(
      () => this.props.options,
      options => {
        if (!this.isOptionsValid) {
          return
        }
        this.fetchData()

        const name = getExportName(options.startDate, options.endDate, '状态码统计')
        this.updateExportName(name)
      },
      { fireImmediately: true }
    ))
  }
}

function transformResponseForDisplay({ codes, points }: AnalysisCodeResponse): CodeResult {
  const time = (points || []).map(point => dayjs(point, 'YYYY-MM-DD-HH-mm').valueOf())
  const timeline: CodeTimeline = { time }

  let total = 0
  let details: CodeDetailItem[] = []

  Object.keys(codes || {}).forEach(code => {
    const countList = codes[code as any]
    const count = sum(countList)
    total += count

    switch (Math.floor(Number(code) / 100)) {
      case 2:
        timeline['2xx'] = appendArray(timeline['2xx'], countList)
        break
      case 3:
        timeline['3xx'] = appendArray(timeline['3xx'], countList)
        break
      case 4:
        timeline['4xx'] = appendArray(timeline['4xx'], countList)
        break
      case 5:
        timeline['5xx'] = appendArray(timeline['5xx'], countList)
        break
      default:
        timeline.others = appendArray(timeline.others, countList)
        break
    }

    details.push({
      code: Number(code),
      count,
      percent: 0
    })
  })

  if (total > 0) {
    details = details.map(item => ({
      ...item,
      percent: Number((item.count / total).toFixed(2))
    }))
  }

  return { timeline, details }
}

/**
 * 合并数组
 * example: appendArray([1, 2], [4, 5]) => [5, 7]
 */
function appendArray(arr: number[] | undefined, inArr: number[]): number[] {
  arr = arr || []
  const result = [...arr]

  inArr.forEach((item, index) => {
    result[index] = item + (result[index] || 0)
  })
  return result
}
