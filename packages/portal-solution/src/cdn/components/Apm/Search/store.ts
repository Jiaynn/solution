/**
 * @file Apm Search Component
 * @author zhuhao <zhuhao@qiniu.com>
 */

import moment from 'moment'
import { observable, computed, action, reaction, when } from 'mobx'
import { Loadings } from 'portal-base/common/loading'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { isOptionsValid, checkOptions, getFreqByDiffHour } from 'cdn/transforms/apm'
import { getDiffHour } from 'cdn/transforms/datetime'

import { Freq, IApmOptions } from 'cdn/apis/apm'

export interface ISearchOptionProps extends IApmOptions {}

export interface IFreqOption {
  label: string
  value: Freq
}

export interface ApmSearchProps {
  options: IApmOptions
  onSubmit: (options: IApmOptions) => void
}

@injectable()
export default class LocalStore extends Store {
  @observable domain?: string
  @observable regions!: string[]
  @observable isps!: string[]
  @observable freq!: Freq
  @observable startDate!: moment.Moment
  @observable endDate!: moment.Moment

  loadings = new Loadings('domains')

  constructor(
    @injectProps() private props: ApmSearchProps
  ) {
    super()
  }

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @computed get optionsForQuery(): ISearchOptionProps {
    return {
      domain: this.domain,
      startDate: this.startDate,
      endDate: this.endDate,
      freq: this.freq,
      regions: this.regions,
      isps: this.isps
    }
  }

  @computed get isValid() {
    return isOptionsValid(this.optionsForQuery)
  }

  @computed get searchOptionsError() {
    return checkOptions(this.optionsForQuery)
  }

  @action.bound updateRegions(regions: string[]) {
    this.regions = regions
  }

  @action.bound updateFreq(freq: Freq) {
    this.freq = freq
  }

  @action.bound updateIsps(isps: string[]) {
    this.isps = isps
  }

  @action.bound updateStartDate(startDate: moment.Moment) {
    this.startDate = startDate
  }

  @action.bound updateEndDate(endDate: moment.Moment) {
    this.endDate = endDate
  }

  @action.bound updateDomain(domain?: string) {
    this.domain = domain
  }

  updateAll(options: ISearchOptionProps) {
    this.updateDomain(options.domain)
    this.updateStartDate(options.startDate)
    this.updateEndDate(options.endDate)
    this.updateFreq(options.freq)
    this.updateIsps(options.isps)
    this.updateRegions(options.regions)
  }

  init() {
    this.addDisposer(reaction(
      () => this.props.options,
      options => options && this.updateAll(options),
      { fireImmediately: true }
    ))

    // 数据 ready 后自动查一把
    this.addDisposer(when(
      () => this.isValid,
      () => this.props.onSubmit(this.optionsForQuery)
    ))

    this.addDisposer(reaction(
      () => [this.startDate, this.endDate],
      timeRange => {
        if (timeRange[0] != null
          && timeRange[1] != null) {
          this.updateFreq(getFreqByDiffHour(getDiffHour(timeRange[0], timeRange[1])))
        }
      },
      { fireImmediately: true }
    ))
  }
}
