
import { computed, observable, reaction, action } from 'mobx'
import { isEmpty } from 'lodash'
import autobind from 'autobind-decorator'
import { UnitOptions, ChartOptions } from 'react-icecream-charts'

import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'
import { IamPermissionStore } from 'portal-base/user/iam'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { I18nStore, RawLocaleMessage } from 'portal-base/common/i18n'

import { nonEmptyArray } from 'cdn/utils'

import { exportCSVFile } from 'cdn/utils/csv'

import {
  getExportName,
  isOptionsValid,
  humanizeDiagramTypeName,
  humanizeUsageSummaryName
} from 'cdn/transforms/statistics'

import { ISeriesData, getChartCSVData, getAreaChartOptions, getReqcountUnit } from 'cdn/transforms/chart'

import DomainStore from 'cdn/stores/domain'

import AbilityConfig from 'cdn/constants/ability-config'
import { allTrafficRegions } from 'cdn/constants/traffic-region'
import IamInfo from 'cdn/constants/iam-info'
import { maxStackByDomainCount, SearchType, StatisticsDataSource } from 'cdn/constants/statistics'
import { Platform } from 'cdn/constants/domain'
import { bandwidthUnit, flowUnit } from 'cdn/constants/chart'

import {
  IUsageOptionsWithRegionsAndIsp, GroupType
} from 'cdn/apis/statistics'

import { ReqCountData, NightBandwidthData, seriesNameMap, FlowDataBase, BandwidthDataBase } from './base'
import { ISearchOptionProps } from '../../Search/store'

export { FlowDataBase, BandwidthDataBase, ReqCountData, NightBandwidthData }

export interface IStatisticsUsageProps {
  options: ISearchOptionProps
  type: DataType
}

export type DataType = SearchType.Flow | SearchType.Bandwidth | SearchType.Reqcount | SearchType.NightBandwidth

enum LoadingType {
  Usage = 'usage',
}

const suffixMap: Record<GroupType, RawLocaleMessage> = {
  '': {
    cn: '所选域名汇总',
    en: 'Selected domain name summary'
  },
  geoCover: {
    cn: '所选域名按区域汇总',
    en: 'Selected domain name is summarized by region'
  },
  domain: {
    cn: '所选域名对比',
    en: 'Comparison of selected domain names'
  }
}

@injectable()
export default class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  constructor(
    @injectProps() private props: IStatisticsUsageProps,
    private iamPermissionStore: IamPermissionStore,
    private featureConfigStore: FeatureConfigStore,
    private domainStore: DomainStore,
    private flowData: FlowDataBase,
    private bandwidthData: BandwidthDataBase,
    private reqcountData: ReqCountData,
    private nightBandwidthData: NightBandwidthData,
    private iamInfo: IamInfo,
    private abilityConfig: AbilityConfig,
    private i18n: I18nStore
  ) {
    super()
  }

  @computed get isLoadingTimeline() {
    return this.loadings.isLoading(LoadingType.Usage)
  }

  // 搜索条件相关
  @observable currentType: DataType = this.props.type
  @observable stackBy: GroupType = ''

  @observable exportName = ''

  @action.bound updateExportName(name: string) {
    this.exportName = name
  }

  @action.bound updateCurrentType(type: DataType) {
    this.currentType = type
  }

  @computed get staticAndDynamicDomains() {
    const domains = nonEmptyArray(this.props.options.domains.map(
      domainName => this.domainStore.getDomain(domainName)
    ))
    const staticDomains = domains.filter(
      domain => domain.platform !== Platform.Dynamic
    )
    const dynamicDomains = domains.filter(
      domain => domain.platform === Platform.Dynamic
    )
    return {
      static: staticDomains.map(domain => domain.name),
      dynamic: dynamicDomains.map(domain => domain.name)
    }
  }

  @computed get region() {
    const { options } = this.props

    // 如果不是请求数统计，则使用计量区域
    if (this.currentType !== SearchType.Reqcount) {
      return options.trafficRegions || []
    }

    // 如果是请求数统计且数据源是计量数据，则使用全部计量区域（暂不分区域）
    if (this.abilityConfig.reqCountDataSource === StatisticsDataSource.Traffic) {
      return allTrafficRegions
    }

    // 如果是请求数统计且数据源是日志分析数据，则使用全部分析区域（暂不分区域）
    return ['global']
  }

  @computed get usageSearchOptions(): IUsageOptionsWithRegionsAndIsp {
    const { options } = this.props
    const { trafficRegions, region, domains, fullDomainsChecked, ...otherOptions } = options

    return {
      ...otherOptions,
      fullDomainsChecked,
      domains: fullDomainsChecked ? [] : domains,
      region: this.region,
      group: this.stackBy
    }
  }

  @computed get isOverDomainLimit(): boolean {
    const { domains, fullDomainsChecked } = this.props.options

    if (fullDomainsChecked) {
      return false
    }

    return domains && domains.length > maxStackByDomainCount
  }

  @computed get usageValidateOptions(): ISearchOptionProps {
    return this.props.options
  }

  @computed get isOptionsValid() {
    return isOptionsValid(this.usageValidateOptions, this.currentType)
  }

  @action.bound updateStackBy(stackBy: GroupType) {
    this.stackBy = stackBy
  }

  @computed get isTimelineDataEmpty() {
    return isEmpty(this.seriesData)
  }

  @computed get seriesData() {
    if (!this.isOptionsValid) {
      return []
    }

    let seriesData: Array<ISeriesData<RawLocaleMessage>>
    switch (this.currentType) {
      case SearchType.Flow:
        seriesData = this.flowData.seriesData
        break
      case SearchType.Bandwidth:
        seriesData = this.bandwidthData.seriesData
        break
      case SearchType.Reqcount:
        seriesData = this.reqcountData.seriesData
        break
      case SearchType.NightBandwidth:
        seriesData = this.nightBandwidthData.seriesData
        break
      default:
        seriesData = []
    }

    // 1. 图表、导出报表默认会展示所有数据，统计接口新返回了 pcdn 的统计数据，需要忽略之
    // 2. 全部项也隐藏
    // 3. 根据站点功能判断是否隐藏动态数据
    const ignorePoints = [{ cn: 'pcdnPoints', en: 'pcdnPoints' }, seriesNameMap.total]

    if (this.abilityConfig.hideDynTraffic) {
      ignorePoints.push(seriesNameMap.dcdnPoints)
    }

    const ignoreNames = ignorePoints.map(this.i18n.t)
    return (seriesData || [])
      .map(({ name, ...rest }) => ({ name: this.i18n.t(name), ...rest }))
      .filter(item => !ignoreNames.includes(item.name))
  }

  @computed get chartOptions() {
    let unit: UnitOptions | undefined
    let decimals = 4

    switch (this.currentType) {
      case SearchType.Flow:
        unit = flowUnit
        break
      case SearchType.Bandwidth:
        unit = bandwidthUnit
        break
      case SearchType.Reqcount:
        unit = getReqcountUnit(this.i18n.t)
        decimals = 3
        break
      case SearchType.NightBandwidth:
        unit = bandwidthUnit
        break
      default:
    }

    let chartOptions: ChartOptions = {
      unit,
      decimals
    }

    if (this.bandwidthSummary
        && this.currentType === SearchType.Bandwidth
        && !this.featureConfigStore.isDisabled('FUSION.FUSION_STAT_PEAK95')
    ) {
      chartOptions = {
        ...chartOptions,
        yAxis: {
          plotLine: {
            text: this.i18n.t(humanizeUsageSummaryName('peak95')),
            value: this.bandwidthSummary.peak95?.value
          }
        }
      }
    }

    return getAreaChartOptions(chartOptions)
  }

  @computed get flowSummary() { return this.flowData.summary }
  @computed get bandwidthSummary() { return this.bandwidthData.summary }
  @computed get reqcountSummary() { return this.reqcountData.reqcountSummary }
  @computed get nightbandwidthSummary() { return this.nightBandwidthData.bandwidthSummary }

  @autobind
  @Loadings.handle(LoadingType.Usage)
  fetchLineData() {
    let req
    switch (this.currentType) {
      case SearchType.Flow:
        req = this.flowData.fetchLineData(this.usageSearchOptions)
        break
      case SearchType.Bandwidth:
        req = this.bandwidthData.fetchLineData(this.usageSearchOptions)
        break
      case SearchType.Reqcount:
        req = this.reqcountData.fetchLineData(this.usageSearchOptions, this.staticAndDynamicDomains)
        break
      case SearchType.NightBandwidth:
        req = this.nightBandwidthData.fetchLineData(this.usageSearchOptions)
        break
      default:
    }
    return req
  }

  @computed get csvSuffix() {
    const t = this.i18n.t
    return `${t(humanizeDiagramTypeName(this.currentType))}：${t(suffixMap[this.stackBy])}`
  }

  @computed get isTimelineAllowed() {
    return !this.iamPermissionStore.shouldSingleDeny({
      product: this.iamInfo.iamService,
      actionName: this.iamInfo.iamActions.GetBandwidthAndFlux
    })
  }

  @autobind
  exportCSV() {
    exportCSVFile(getChartCSVData(this.seriesData), this.exportName)
  }

  init() {
    // 若 optionsForQuery 或 stackBy 发生变化，则请求流量／带宽统计数据
    this.addDisposer(reaction(
      () => (this.isTimelineAllowed && {
        type: this.currentType,
        options: this.props.options,
        group: this.stackBy
      }),
      data => {
        if (!data) { return }
        const { options, group } = data
        const { fullDomainsChecked, domains, startDate, endDate } = options

        if (!this.isOptionsValid) {
          return
        }

        // 按域名堆叠时，如果选中的域名超过数量限制，将堆叠类型切换到 “使用量”
        if (
          group === 'domain'
          && !fullDomainsChecked
          && domains.length > maxStackByDomainCount
        ) {
          this.updateStackBy('')
          return
        }

        this.fetchLineData()

        const name = getExportName(startDate, endDate, this.csvSuffix)
        this.updateExportName(name)
      },
      { fireImmediately: true }
    ))
  }
}
