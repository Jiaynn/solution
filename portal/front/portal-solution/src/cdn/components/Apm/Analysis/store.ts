/*
 * @file apm analysis store
 * @author zhuhao <zhuhao@qiniu.com>
 */

import { computed, observable, reaction, action } from 'mobx'
import { isEmpty } from 'lodash'
import autobind from 'autobind-decorator'
import { ApiException } from 'qn-fe-core/client'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { exportCSVFile } from 'cdn/utils/csv'

import {
  isOptionsValid, transformNormalLineSeries, getExportName, getResponseTimeSeriesName, getDownloadSpeedSeriesName
} from 'cdn/transforms/apm'
import { ISeriesData, getChartCSVData, getLineChartOptions } from 'cdn/transforms/chart'

import { apmDownloadSpeedUnit } from 'cdn/constants/chart'
import { ErrorCodeForTicket, errorCodeMsgForTicket, getErrorCodesForTicket } from 'cdn/constants/apm'

import ApmApis, { IApmOptions } from 'cdn/apis/apm'

import { ISearchOptionProps } from '../Search/store'

export interface IApmUsageProps {
  options: ISearchOptionProps
}

enum LoadingType {
  ResponseTime = 'responseTime',
  DownloadSpeed = 'downloadSpeed'
}

@injectable()
export default class LocalStore extends Store {
  constructor(
    @injectProps() private props: IApmUsageProps,
    private apmApis: ApmApis
  ) {
    super()
  }

  loadings = Loadings.collectFrom(this, LoadingType)

  @computed get isLoadingTimeline() {
    return !this.loadings.isAllFinished()
  }

  @computed get apmOptions(): IApmOptions {
    return this.props.options
  }

  @computed get isOptionsValid() {
    return isOptionsValid(this.apmOptions)
  }

  @computed get isResponseTimeExportDisable() {
    return !this.isOptionsValid || isEmpty(this.responseTimeSeriesData)
  }

  @computed get isDownloadSpeedExportDisable() {
    return !this.isOptionsValid || isEmpty(this.downloadSpeedSeriesData)
  }

  @observable errorMsgForTicket?: { code: string }

  @computed get errorMsgModalOptions() {
    if (!this.errorMsgForTicket) {
      return null
    }
    return {
      title: this.errorMsgForTicket.code,
      content: errorCodeMsgForTicket[this.errorMsgForTicket.code as unknown as ErrorCodeForTicket]
    }
  }

  @action.bound updateErrorMsgForTicket(err?: { code: string }) {
    this.errorMsgForTicket = err
  }

  getExportName(name: string) {
    const { startDate, endDate } = this.apmOptions
    return getExportName(startDate, endDate, name)
  }

  // 响应时间数据
  @observable.ref responseTimeSeriesData: ISeriesData[] = []
  // 下载速度数据
  @observable.ref downloadSpeedSeriesData: ISeriesData[] = []

  @action.bound updateResponseTimeSeriesData(seriesData: ISeriesData[]) {
    this.responseTimeSeriesData = seriesData
  }

  @action.bound updateDownloadSpeedSeriesData(seriesData: ISeriesData[]) {
    this.downloadSpeedSeriesData = seriesData
  }

  @autobind
  exportResponseTimeData() {
    exportCSVFile(getChartCSVData(this.responseTimeSeriesData), this.getExportName('响应时间'))
  }

  @autobind
  exportDownloadSpeedData() {
    exportCSVFile(getChartCSVData(this.downloadSpeedSeriesData), this.getExportName('下载速度'))
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.ResponseTime)
  fetchResponseTimeMetric() {
    return this.apmApis.fetchResponseTime(this.apmOptions).then(
      data => {
        const responseTimeInMillisecond = (data.value || []).map(responseTime => responseTime * 1000)
        const seriesData = transformNormalLineSeries(
          {
            ...data,
            value: responseTimeInMillisecond
          },
          getResponseTimeSeriesName
        )
        this.updateResponseTimeSeriesData(seriesData)
      }
    ).catch(err => {
      const errorCodes = getErrorCodesForTicket()
      if (err instanceof ApiException && errorCodes.indexOf(Number(err.code)) >= 0) {
        this.updateErrorMsgForTicket({ code: err.code + '' })
        return
      }
      throw err
    })
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.DownloadSpeed)
  fetchDownloadSpeedMetric() {
    return this.apmApis.fetchDownloadSpeed(this.apmOptions).then(
      data => {
        const seriesData = transformNormalLineSeries(data as any, getDownloadSpeedSeriesName)
        this.updateDownloadSpeedSeriesData(seriesData)
      }
    ).catch(err => {
      const errorCodes = getErrorCodesForTicket()
      if (err instanceof ApiException && errorCodes.indexOf(Number(err.code)) >= 0) {
        this.updateErrorMsgForTicket({ code: err.code + '' })
        return
      }
      throw err
    })
  }

  @computed get responseTimeChartOptions() {
    return getLineChartOptions({
      unit: '毫秒'
    })
  }

  @computed get downloadSpeedChartOptions() {
    return getLineChartOptions({
      unit: apmDownloadSpeedUnit,
      decimals: 3
    })
  }

  init() {
    // 若 optionsForQuery 发生变化，则请求 响应时间，下载速度 统计数据
    this.addDisposer(reaction(
      () => this.props.options,
      options => {
        if (!options || !this.isOptionsValid) {
          return
        }
        this.fetchResponseTimeMetric()
        this.fetchDownloadSpeedMetric()
      },
      { fireImmediately: true }
    ))
  }
}
