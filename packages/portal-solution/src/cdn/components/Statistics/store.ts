
import { observable, action, computed, reaction } from 'mobx'
import moment from 'moment'
import { extend } from 'lodash'
import { RouterStore } from 'portal-base/common/router'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { getRegionList } from 'cdn/transforms/region'

import { getLatestDuration } from 'cdn/transforms/datetime'

import { getAllRegionNameList } from 'cdn/transforms/traffic-region'

import { FlowDirection } from 'cdn/constants/statistics'
import { isps } from 'cdn/constants/isp'
import { isOEM, oemConfig } from 'cdn/constants/env'

import { Freq } from 'cdn/apis/statistics'

import { ISearchOptionProps } from './Search/store'

const initialOptionsWithoutDate = {
  domains: [],
  staticDomains: [],
  dynamicDomains: [],
  region: getRegionList(['global']),
  trafficRegions: getAllRegionNameList(),
  isp: isps.all,
  freq: isOEM && oemConfig.statisticsFreq ? oemConfig.statisticsFreq as Freq : '1hour' as Freq,
  startDate: moment(),
  endDate: moment(),
  fullDomainsChecked: false,
  flowDirection: FlowDirection.Down
}

@injectable()
export default class LocalStore extends Store {
  @observable.ref searchOptions: ISearchOptionProps = initialOptionsWithoutDate

  constructor(
    private routerStore: RouterStore
  ) {
    super()
  }

  @action.bound updateOptions(options: ISearchOptionProps) {
    this.searchOptions = options
  }

  @action.bound updateDomainOfSearchOptions(domain: string) {
    this.searchOptions.domains = [domain]
  }

  @computed get searchDomain(): string {
    return this.routerStore.query.domain as string
  }

  @action.bound setInitialDates() {
    const now = moment()
    const initialDays = isOEM && oemConfig.statisticsDateRangeDays > 0 ? oemConfig.statisticsDateRangeDays : 7
    const [startDate, endDate] = getLatestDuration(now, initialDays, 'day')
    this.searchOptions = extend({}, initialOptionsWithoutDate, { startDate, endDate })
  }

  init() {
    this.setInitialDates()

    this.addDisposer(reaction(
      () => this.searchDomain,
      domain => domain && this.updateDomainOfSearchOptions(domain),
      { fireImmediately: true }
    ))
  }
}
