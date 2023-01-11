
import { computed, observable, reaction, action, autorun } from 'mobx'
import { isEmpty } from 'lodash'
import autobind from 'autobind-decorator'
import dayjs from 'dayjs'

import { I18nStore } from 'portal-base/common/i18n'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore } from 'portal-base/common/toaster'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { exportCSVFile } from 'cdn/utils/csv'

import {
  isOptionsValid, getExportName,
  getAllSeriesTotal,
  transformNormalLineSeries
} from 'cdn/transforms/statistics'
import { enhancedDivision } from 'cdn/transforms/math'
import { ISeriesData, getChartCSVData, getAreaChartOptions } from 'cdn/transforms/chart'

import { logAnalysisDateFormat, SearchType, searchTypeTextMap } from 'cdn/constants/statistics'

import StatisticsApis, { AnalysisUvOptions, AnalysisUvResponse } from 'cdn/apis/statistics'

import { ISearchOptionProps } from '../Search/store'
import * as messages from './messages'

export interface IStatisticsUvProps {
  options: ISearchOptionProps
}

enum LoadingType {
  Uv = 'uv',
}

@injectable()
export default class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  constructor(
    @injectProps() private props: IStatisticsUvProps,
    private statisticsApis: StatisticsApis,
    private i18n: I18nStore
  ) {
    super()
  }

  @computed get isLoading() {
    return this.loadings.isLoading(LoadingType.Uv)
  }

  @observable exportName = ''

  @action.bound updateExportName(name: string) {
    this.exportName = name
  }

  // FUSION-10248 只查询一个小时的数据
  @computed get uvSearchOptions(): AnalysisUvOptions {
    const { domains, startDate, endDate } = this.props.options
    return {
      domains,
      freq: '1hour',
      startDate: startDate.format(logAnalysisDateFormat),
      endDate: endDate.format(logAnalysisDateFormat),
      region: 'global'
    }
  }

  @computed get isOptionsValid() {
    return isOptionsValid(this.props.options, SearchType.Uv)
  }

  @computed get isSeriesDataEmpty() {
    return isEmpty(this.seriesData) || isEmpty(this.seriesData[0].data)
  }

  @computed get summary() {
    if (isEmpty(this.seriesData)) {
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

  // uv 时间线数据
  @observable.ref seriesData: ISeriesData[] = []

  @action.bound updateSeriesData(data: ISeriesData[]) {
    this.seriesData = data
  }

  @computed get areaChartOptions() {
    return getAreaChartOptions({
      unit: this.i18n.t(messages.areaChartUnit)
    })
  }

  @autobind
  exportAreaData() {
    exportCSVFile(getChartCSVData(this.seriesData), this.exportName)
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.Uv)
  fetchLineData() {
    return this.statisticsApis.fetchUvTimeline(this.uvSearchOptions).then(
      data => this.updateSeriesData(transformResponseForDisplay(data))
    )
  }

  init() {
    // 若 optionsForQuery 发生变化，则请求 UV 统计数据
    this.addDisposer(reaction(
      () => this.props.options,
      _ => {
        if (!this.isOptionsValid) {
          return
        }
        this.fetchLineData()
      },
      { fireImmediately: true }
    ))

    this.addDisposer(autorun(() => {
      if (this.isOptionsValid) {
        const options = this.props.options
        const name = getExportName(options.startDate, options.endDate, this.i18n.t(searchTypeTextMap[SearchType.Uv]))
        this.updateExportName(name)
      }
    }))
  }
}

function transformResponseForDisplay({ uvCount, points }: AnalysisUvResponse): ISeriesData[] {
  return transformNormalLineSeries(
    {
      time: (points || []).map(point => dayjs(point, 'YYYY-MM-DD-HH-mm').valueOf()),
      uvCount
    },
    _ => 'UV'
  )
}
