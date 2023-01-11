
import { computed, observable, reaction, action } from 'mobx'
import { sum } from 'lodash'
import autobind from 'autobind-decorator'

import { Loadings } from 'portal-base/common/loading'
import { ToasterStore } from 'portal-base/common/toaster'
import { IamPermissionStore } from 'portal-base/user/iam'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { I18nStore } from 'portal-base/common/i18n'

import { isOptionsValid, transformAnalysisOptions } from 'cdn/transforms/statistics'
import { humanizeReqcount, humanizeTraffic, humanizePercent } from 'cdn/transforms/unit'
import { enhancedDivision } from 'cdn/transforms/math'

import IamInfo from 'cdn/constants/iam-info'
import { SearchType } from 'cdn/constants/statistics'

import StatisticsApis, { BatchFetchTopOptions, IGetAnalysisOptions, TopType } from 'cdn/apis/statistics'

import { ISearchOptionProps } from '../Search/store'
import * as messages from './messages'

export interface IStatisticsTopProps {
  options: ISearchOptionProps
}

export interface ITopItem {
  index: number
  key: string
  value: number
  percent?: string
}

enum LoadingType {
  TopUrl = 'topUrl',
  TopIp = 'topIp'
}

@injectable()
export default class StateStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  constructor(
    @injectProps() private props: IStatisticsTopProps,
    private statisticsApis: StatisticsApis,
    private iamPermissionStore: IamPermissionStore,
    private iamInfo: IamInfo,
    private i18n: I18nStore
  ) {
    super()
  }

  @computed get isTopUrlLoading() {
    return this.loadings.isLoading(LoadingType.TopUrl)
  }

  @computed get isTopIpLoading() {
    return this.loadings.isLoading(LoadingType.TopIp)
  }

  @computed get topSearchOptions(): BatchFetchTopOptions {
    const { domains, startDate, endDate, regions } = this.analysisSearchOptions
    return { domains, startDate, endDate, regions }
  }

  @computed get analysisSearchOptions(): IGetAnalysisOptions {
    return transformAnalysisOptions({
      ...this.props.options,
      isp: 'all',
      freq: '1day'
    })
  }

  @computed get isOptionsValid() {
    return isOptionsValid(this.props.options, SearchType.Top)
  }

  @observable topType: { url: TopType, ip: TopType } = { url: 'traffic', ip: 'traffic' }

  @action.bound updateTopType(type: TopType, target: 'url' | 'ip') {
    this.topType[target] = type
  }

  @observable.ref topUrlData: ITopItem[] = [] // topUrl 数据
  @observable.ref topIpData: ITopItem[] = [] // topIp 数据

  @action.bound updateTopUrlData(data: ITopItem[]) {
    this.topUrlData = data
  }

  @action.bound updateTopIpData(data: ITopItem[]) {
    this.topIpData = data
  }

  @computed get topUrlTableColumns() {
    const isReqCount = this.topType.url === 'reqcount'
    const t = this.i18n.t

    return [{
      title: '',
      dataIndex: 'index',
      className: 'column-value'
    }, {
      title: 'URL',
      dataIndex: 'key'
    }, {
      title: isReqCount ? t(messages.reqCount) : t(messages.flow),
      dataIndex: 'value',
      className: 'column-value',
      render: (val: number) => (isReqCount ? t(humanizeReqcount(val)) : humanizeTraffic(val))
    }, {
      title: isReqCount ? t(messages.visitProportion) : t(messages.trafficProportion),
      dataIndex: 'percent',
      className: 'column-value'
    }]
  }

  @computed get topIpTableColumns() {
    const t = this.i18n.t

    return [{
      title: '',
      dataIndex: 'index',
      className: 'column-value'
    }, {
      title: 'IP',
      dataIndex: 'key'
    }, {
      title: this.topType.ip === 'reqcount' ? t(messages.reqCount) : t(messages.flow),
      dataIndex: 'value',
      className: 'column-value',
      render: (val: number) => (this.topType.ip === 'reqcount' ? t(humanizeReqcount(val)) : humanizeTraffic(val))
    }]
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.TopUrl)
  fetchTopUrlData() {
    const isReqcount = this.topType.url === 'reqcount'
    return Promise.all([
      this.statisticsApis.batchFetchAccessTop(
        isReqcount ? this.statisticsApis.fetchTopUrlByReqcount : this.statisticsApis.fetchTopUrlByFlow,
        this.topSearchOptions
      ),
      isReqcount
        ? this.statisticsApis.fetchAnalysisReqCount(this.analysisSearchOptions)
        : this.statisticsApis.fetchAnalysisFlow(this.analysisSearchOptions)
    ]).then(([data, totalTimeline]) => {
      const total = sum(totalTimeline.value)
      const topUrlData = data.map((item, index) => ({
        ...item,
        index: index + 1,
        percent: humanizePercent(enhancedDivision(item.value, total))
      }))
      this.updateTopUrlData(topUrlData)
    })
  }

  @autobind
  @ToasterStore.handle()
  @Loadings.handle(LoadingType.TopIp)
  fetchTopIpData() {
    const isReqcount = this.topType.ip === 'reqcount'
    return this.statisticsApis.batchFetchAccessTop(
      isReqcount ? this.statisticsApis.fetchTopIpByReqcount : this.statisticsApis.fetchTopIpByFlow,
      this.topSearchOptions
    )
      .then(data => {
        const topIpData = data.map((item, index) => ({
          ...item,
          index: index + 1
        }))
        this.updateTopIpData(topIpData)
      })
  }

  @computed get isTopAllowed() {
    return !this.iamPermissionStore.shouldSingleDeny({
      product: this.iamInfo.iamService,
      actionName: this.iamInfo.iamActions.GetTop
    })
  }

  init() {
    this.addDisposer(reaction(
      () => this.isTopAllowed && this.props.options,
      options => {
        if (!options || !this.isOptionsValid) {
          return
        }
        this.fetchTopUrlData()
        this.fetchTopIpData()
      },
      { fireImmediately: true }
    ))

    // 若 TopUrl 查询类型变化
    this.addDisposer(reaction(
      () => this.isTopAllowed && this.topType.url,
      () => {
        if (!this.isOptionsValid) {
          return
        }
        this.fetchTopUrlData()
      }
    ))
    // 若 TopIp 查询类型变化
    this.addDisposer(reaction(
      () => this.isTopAllowed && this.topType.ip,
      () => {
        if (!this.isOptionsValid) {
          return
        }
        this.fetchTopIpData()
      }
    ))
  }
}
