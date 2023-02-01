/**
 * @file domain store
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import moment from 'moment'
import autobind from 'autobind-decorator'
import { computed, observable, action } from 'mobx'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import DomainStore from 'cdn/stores/domain'

import AbilityConfig from 'cdn/constants/ability-config'
import { allTrafficRegions } from 'cdn/constants/traffic-region'
import { allTrafficProtocols } from 'cdn/constants/domain'
import { trafficSimpleDateFormat } from 'cdn/constants/statistics'

import StatisticsApis from 'cdn/apis/statistics'

enum LoadingType {
  HotDomains = 'hotDomains'
}

@injectable()
export default class LocalStore extends Store {
  constructor(
    private toasterStore: Toaster,
    private domainStore: DomainStore,
    private statisticsApis: StatisticsApis,
    private abilityConfig: AbilityConfig
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  loadings = Loadings.collectFrom(this, LoadingType)

  @observable hotDomains?: number

  @computed get isLoading() {
    return this.loadings.isLoading(LoadingType.HotDomains) || this.domainStore.isLoadingTotal
  }

  @computed get totalDomains() {
    return this.domainStore.total
  }

  @action updateHotDomains(hotDomains: number) {
    this.hotDomains = hotDomains
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.HotDomains)
  fetchHotDomains() {
    const now = Date.now()
    return this.statisticsApis.fetchTrafficUser({
      type: this.abilityConfig.defaultTrafficTypes.userFlow,
      protocol: allTrafficProtocols,
      region: allTrafficRegions,
      g: 'day',
      start: moment(now).startOf('month').format(trafficSimpleDateFormat),
      end: moment(now).add(1, 'M').startOf('month').format(trafficSimpleDateFormat),
      topn: 0
    }).then(res => {
      this.updateHotDomains(res.domain_cnt)
    })
  }

  init() {
    this.fetchHotDomains()

    this.domainStore.fetchTotal(false)
  }
}
