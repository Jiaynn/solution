
import { observable, action, computed, reaction } from 'mobx'
import moment from 'moment'
import { extend } from 'lodash'

import { RouterStore } from 'portal-base/common/router'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { getAllRegionNameList } from 'cdn/transforms/apm-region'
import { getLatestDurationWithTime } from 'cdn/transforms/datetime'

import { isps } from 'cdn/constants/isp'

import { Freq } from 'cdn/apis/apm'
import { ISearchOptionProps } from './Search/store'

const initialOptionsWithoutDate = {
  domain: undefined,
  regions: getAllRegionNameList(),
  isps: [isps.telecom, isps.unicom, isps.mobile],
  freq: '15min' as Freq
}

@injectable()
export default class LocalStore extends Store {
  @observable searchOptions!: ISearchOptionProps

  constructor(private routerStore: RouterStore) {
    super()
  }

  @action.bound updateOptions(options: ISearchOptionProps) {
    this.searchOptions = options
  }

  @action.bound updateDomainOfSearchOptions(domain: string) {
    this.searchOptions.domain = domain
  }

  @computed get searchDomain() {
    const search = this.routerStore.query
    return search && search.domain as string
  }

  @action.bound setInitialDates() {
    const [startDate, endDate] = getLatestDurationWithTime(moment(), 3, 'hour')
    const initialDates = {
      startDate,
      endDate
    }
    this.searchOptions = extend({}, initialOptionsWithoutDate, initialDates)
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
