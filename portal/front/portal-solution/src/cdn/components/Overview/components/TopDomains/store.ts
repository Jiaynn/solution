/**
 * @file top domains store
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { computed, observable, action } from 'mobx'
import moment from 'moment'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import { sumTraffic302Points, sumTrafficPoints } from 'cdn/transforms/statistics'

import AbilityConfig from 'cdn/constants/ability-config'
import { allTrafficRegions } from 'cdn/constants/traffic-region'
import { allTrafficProtocols } from 'cdn/constants/domain'
import { trafficSimpleDateFormat, trafficDateFormat } from 'cdn/constants/statistics'

import StatisticsApis, { IGetStatisticsOptions } from 'cdn/apis/statistics'

enum LoadingType {
  TopDomains = 'topDomains'
}

const topCount = 5

export type ITopDomain = {
  name: string
  flow: number
  bandwidth: number
  reqcount: number
}

@injectable()
export default class LocalStore extends Store {
  constructor(
    private toasterStore: Toaster,
    private statisticsApis: StatisticsApis,
    private abilityConfig: AbilityConfig
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, LoadingType)

  @observable.ref topDomains: ITopDomain[] = []

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @action updateTopDomains(topDomains: ITopDomain[]) {
    this.topDomains = topDomains
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.TopDomains)
  fetchTopDomains() {
    let flow = this.abilityConfig.defaultTrafficTypes.userFlow
    if (this.abilityConfig.dynamic302Enabled) {
      flow = '302flow+'
    }
    return this.statisticsApis.fetchTrafficUser({
      type: flow,
      protocol: allTrafficProtocols,
      region: allTrafficRegions,
      g: 'day',
      start: moment().startOf('month').format(trafficSimpleDateFormat),
      end: moment().add(1, 'M').startOf('month').format(trafficSimpleDateFormat),
      topn: topCount
    }).then(res => {
      // 可能会超过 5 条数据，多出来一条域名名称为 others 的数据
      const domains = (res.domains || []).slice(0, topCount)
      const promises = domains.map(it => this.fetchDomainDetail(it.name))

      return Promise.all(promises)
    }).then(topDomains => {
      this.updateTopDomains(topDomains)
    })
  }

  @autobind
  fetchDomainDetail(name: string): Promise<ITopDomain> {
    const options: IGetStatisticsOptions = {
      domains: [name],
      start: moment().startOf('month').format(trafficDateFormat),
      end: moment().format(trafficDateFormat),
      g: 'day',
      group: ''
    }
    const reqcountPromise = (
      this.abilityConfig.hideDynTraffic
      ? Promise.resolve(null)
      : this.statisticsApis.fetchReqcountTimeline(options)
    )
    let { flow, bandwidth } = this.abilityConfig.defaultTrafficTypes
    const dynamic302Enabled = this.abilityConfig.dynamic302Enabled
    if (dynamic302Enabled) {
      flow = '302flow+'
      bandwidth = '302bandwidth+'
    }
    return Promise.all([
      this.statisticsApis.fetchFlowTimeline({ ...options, type: flow }),
      this.statisticsApis.fetchBandwidthTimeline({ ...options, type: bandwidth }),
      reqcountPromise
    ]).then(([flowRes, bandwidthRes, reqcountRes]) => ({
      name,
      flow: dynamic302Enabled ? sumTraffic302Points(flowRes) : sumTrafficPoints(flowRes),
      bandwidth: bandwidthRes.stats.peak.value,
      reqcount: reqcountRes == null ? 0 : sumTrafficPoints(reqcountRes)
    }))
  }

  init() {
    this.fetchTopDomains()
  }
}
