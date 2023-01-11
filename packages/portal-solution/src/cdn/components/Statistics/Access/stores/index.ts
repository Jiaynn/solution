import { computed, observable, reaction, action } from 'mobx'
import { isEmpty } from 'lodash'
import { UnitOptions } from 'react-icecream-charts'
import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'
import { I18nStore } from 'portal-base/common/i18n'
import { IamPermissionStore } from 'portal-base/user/iam'
import { ColumnProps } from 'react-icecream/lib/table'

import { exportCSVFile } from 'cdn/utils/csv'

import { humanizeDiagramTypeName, isOptionsValid } from 'cdn/transforms/statistics'
import { humanizePercent, humanizePercent100 } from 'cdn/transforms/unit'

import { IBarSeriesData, geBarChartOptions, getChartCSVData, getPieChartOptions, XAxisType, IPieSeriesData, CSVDataType, getReqcountUnit } from 'cdn/transforms/chart'

import { SearchType } from 'cdn/constants/statistics'
import { bandwidthUnit, flowUnit } from 'cdn/constants/chart'

import IamInfo from 'cdn/constants/iam-info'

import { ISearchOptionProps } from '../../Search/store'
import { FlowData, BandwidthData, ReqCountData, TrafficItem } from './base'
import * as messages from '../messages'

export { FlowData, BandwidthData, ReqCountData }

export interface IStatisticsAccessProps {
  options: ISearchOptionProps
}

export type DataType = SearchType.Flow | SearchType.Bandwidth | SearchType.Reqcount

enum LoadingType {
  Region = 'region',
  Isp = 'isp'
}

@injectable()
export default class LocalStore extends Store {
  constructor(
    @injectProps() private props: IStatisticsAccessProps,
    private iamPermissionStore: IamPermissionStore,
    private flowData: FlowData,
    private bandwidthData: BandwidthData,
    private reqcountData: ReqCountData,
    private iamInfo: IamInfo,
    private i18n: I18nStore
  ) {
    super()
  }

  loadings = Loadings.collectFrom(this, LoadingType)

  @computed get isRegionLoading() {
    return this.loadings.isLoading(LoadingType.Region)
  }

  @computed get isIspLoading() {
    return this.loadings.isLoading(LoadingType.Isp)
  }

  @computed get searchOptions(): ISearchOptionProps {
    return this.props.options
  }

  @computed get isOptionsValid() {
    return isOptionsValid(this.searchOptions, SearchType.Access)
  }

  // 地区分布的类型 - 流量、带宽、请求数
  @observable regionCurrentType: DataType = SearchType.Flow

  // 运营商分布的类型 - 流量、带宽、请求数
  @observable ispCurrentType: DataType = SearchType.Flow

  @action.bound updateRegionCurrentType(type: DataType) {
    this.regionCurrentType = type
  }

  @action.bound updateIspCurrentType(type: DataType) {
    this.ispCurrentType = type
  }

  @autobind
  @Loadings.handle(LoadingType.Region)
  fetchRegionData() {
    let req
    switch (this.regionCurrentType) {
      case SearchType.Flow:
        req = this.flowData.fetchRegionData(this.searchOptions)
        break
      case SearchType.Bandwidth:
        req = this.bandwidthData.fetchRegionData(this.searchOptions)
        break
      case SearchType.Reqcount:
        req = this.reqcountData.fetchRegionData(this.searchOptions)
        break
      default:
    }
    return req
  }

  @autobind
  @Loadings.handle(LoadingType.Isp)
  fetchIspData() {
    let req
    switch (this.ispCurrentType) {
      case SearchType.Flow:
        req = this.flowData.fetchIspData(this.searchOptions)
        break
      case SearchType.Bandwidth:
        req = this.bandwidthData.fetchIspData(this.searchOptions)
        break
      case SearchType.Reqcount:
        req = this.reqcountData.fetchIspData(this.searchOptions)
        break
      default:
    }
    return req
  }

  @computed get regionSeriesData(): IBarSeriesData {
    let seriesData: IBarSeriesData | undefined

    switch (this.regionCurrentType) {
      case SearchType.Flow:
        seriesData = this.flowData.regionSeriesData
        break
      case SearchType.Bandwidth:
        seriesData = this.bandwidthData.regionSeriesData
        break
      case SearchType.Reqcount:
        seriesData = this.reqcountData.regionSeriesData
        break
      default:
    }

    return seriesData || { categories: [], data: [] }
  }

  @computed get ispSeriesData(): IPieSeriesData[] {
    let seriesData: IPieSeriesData[] = []

    switch (this.ispCurrentType) {
      case SearchType.Flow:
        seriesData = this.flowData.ispSeriesData
        break
      case SearchType.Bandwidth:
        seriesData = this.bandwidthData.ispSeriesData
        break
      case SearchType.Reqcount:
        seriesData = this.reqcountData.ispSeriesData
        break
      default:
    }

    return seriesData || []
  }

  @computed get regionTableData() {
    let columns: Array<ColumnProps<any>> = []
    let dataSource: TrafficItem[] = []

    switch (this.regionCurrentType) {
      case SearchType.Flow:
        columns = this.flowData.regionColumns
        dataSource = this.flowData.regionTableData
        break
      case SearchType.Bandwidth:
        columns = this.bandwidthData.regionColumns
        dataSource = this.bandwidthData.regionTableData
        break
      case SearchType.Reqcount:
        columns = this.reqcountData.regionColumns
        dataSource = this.reqcountData.regionTableData
        break
      default:
        columns = []
        dataSource = []
    }

    return {
      columns,
      dataSource
    }
  }

  @computed get ispTableData() {
    let columns: Array<ColumnProps<any>>
    let dataSource: TrafficItem[]

    switch (this.ispCurrentType) {
      case SearchType.Flow:
        columns = this.flowData.ispColumns
        dataSource = this.flowData.ispTableData
        break
      case SearchType.Bandwidth:
        columns = this.bandwidthData.ispColumns
        dataSource = this.bandwidthData.ispTableData
        break
      case SearchType.Reqcount:
        columns = this.reqcountData.ispColumns
        dataSource = this.reqcountData.ispTableData
        break
      default:
        columns = []
        dataSource = []
    }

    return {
      columns,
      dataSource
    }
  }

  @computed get isRegionDataEmpty(): boolean {
    return isEmpty(this.regionSeriesData.data)
  }

  @computed get isIspDataEmpty(): boolean {
    return isEmpty(this.ispTableData)
  }

  @computed get regionChartOptions() {
    const regionCurrentType = this.regionCurrentType
    let unit: UnitOptions | undefined
    let decimals = 4
    const t = this.i18n.t

    switch (regionCurrentType) {
      case SearchType.Flow:
        unit = flowUnit
        break
      case SearchType.Bandwidth:
        unit = bandwidthUnit
        break
      case SearchType.Reqcount:
        unit = getReqcountUnit(t)
        decimals = 3
        break
      default:
    }
    return geBarChartOptions({
      unit,
      decimals,
      legend: false,
      categories: this.regionSeriesData.categories,
      tooltipFormatter({ humanizeNum, pointData, tooltipData }) {
        let result: string[] = []
        const { value, index } = pointData

        switch (regionCurrentType) {
          case SearchType.Flow:
            result = [
              `${t(messages.flow)}: ${humanizeNum(value)}`,
              `${t(messages.trafficProportion)}: ${humanizePercent(tooltipData[index].percent)}`
            ]
            break
          case SearchType.Bandwidth:
            result = [
              `${t(messages.bandwidth)}: ${humanizeNum(value)}`
            ]
            break
          case SearchType.Reqcount:
            result = [
              `${t(messages.reqCount)}: ${humanizeNum(value)}`,
              `${t(messages.reqProportion)}: ${humanizePercent(tooltipData[index].percent)}`
            ]
            break
          default:
        }

        return result.join('<br/>')
      },
      tooltipData: this.regionTableData.dataSource
    })
  }

  @computed get ispChartOptions() {
    return getPieChartOptions({
      tooltipFormatter({ pointData }) {
        const { pointDot, name, percentage } = pointData
        return `${pointDot} ${name}: <b>${humanizePercent100(percentage!)}</b><br/>`
      }
    })
  }

  @computed get isIspAllowed() {
    return !this.iamPermissionStore.shouldSingleDeny({
      product: this.iamInfo.iamService,
      actionName: this.iamInfo.iamActions.GetISPReqCount
    })
  }

  @computed get isRegionAllowed() {
    return !this.iamPermissionStore.shouldSingleDeny({
      product: this.iamInfo.iamService,
      actionName: this.iamInfo.iamActions.GetReqCount
    })
  }

  @autobind
  exportRegionData() {
    const typeName = this.i18n.t(humanizeDiagramTypeName(this.regionCurrentType))
    const csvData: CSVDataType[] = this.regionTableData.dataSource
      .map(it => ({ Category: it.name, [typeName]: it.value }))
    exportCSVFile(csvData, `${this.i18n.t(messages.regionDistribution)}-${typeName}`)
  }

  @autobind
  exportIspData() {
    exportCSVFile(
      getChartCSVData(this.ispSeriesData, XAxisType.Category),
      `${this.i18n.t(messages.ispDistribution)}-${this.i18n.t(humanizeDiagramTypeName(this.ispCurrentType))}`
    )
  }

  init() {
    // 若 optionsForQuery 发生变化，则请求 Region 统计数据
    this.addDisposer(reaction(
      () => this.isRegionAllowed && {
        type: this.regionCurrentType,
        options: this.props.options
      },
      params => {
        if (!params || !params.options || !this.isOptionsValid) {
          return
        }
        this.fetchRegionData()
      },
      { fireImmediately: true }
    ))

    // 若 optionsForQuery 发生变化，则请求 ISP 统计数据
    this.addDisposer(reaction(
      () => this.isIspAllowed && {
        type: this.ispCurrentType,
        options: this.props.options
      },
      params => {
        if (!params || !params.options || !this.isOptionsValid) {
          return
        }
        this.fetchIspData()
      },
      { fireImmediately: true }
    ))
  }
}
