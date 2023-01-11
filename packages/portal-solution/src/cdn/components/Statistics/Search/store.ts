
import { observable, computed, action, reaction, when, autorun } from 'mobx'
import { Moment } from 'moment'
import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'

import { getVideoSlimStatisticDefaultParams } from 'cdn/transforms/video-slim'

import { isOptionsValid, checkOptions, getFreqByDiffHour } from 'cdn/transforms/statistics'
import { getDiffHour } from 'cdn/transforms/datetime'

import DomainStore from 'cdn/stores/domain'

import { MAX_DOMAIN_COUNT } from 'cdn/constants/domain'
import { SearchType, FlowDirection } from 'cdn/constants/statistics'

import * as domainSelector from 'cdn/components/common/DomainSelector'

import { Freq } from 'cdn/apis/statistics'

import { IDomain, IDomainSearchResult } from 'cdn/apis/domain'

import { Props } from '.'

export interface ISearchOptionProps {
  startDate: Moment
  endDate: Moment
  region: string[]
  trafficRegions?: string[]
  isp: string
  freq: Freq
  // 为了在用量统计、日志分析之间同步 tags 所以要把 tags 保存到这里
  domainTags?: string[]
  domains: string[]
  fullDomainsChecked?: boolean
  flowDirection?: FlowDirection
}

export interface IFreqOption {
  label: string
  value: Freq
}

@injectable()
export default class LocalStore extends Store {
  @observable.ref startDate!: Moment
  @observable.ref endDate!: Moment
  @observable isp!: string
  @observable.ref regions!: string[]
  @observable.ref trafficRegions!: string[]
  @observable freq!: Freq
  @observable flowDirection!: FlowDirection

  @observable.ref state = domainSelector.createState(false)
  @observable.ref domains: IDomain[] | null = null

  constructor(
    @injectProps() public props: Props,
    private userInfo: UserInfo,
    private domainStore: DomainStore
  ) {
    super()
  }

  @computed get timeRange(): [Moment, Moment] {
    return [this.startDate, this.endDate]
  }

  @computed get options() {
    return {
      domains: this.selectedDomains,
      startDate: this.startDate,
      endDate: this.endDate,
      region: this.regions,
      isp: this.isp,
      freq: this.freq,
      domainTags: this.domainTags,
      trafficRegions: this.trafficRegions,
      fullDomainsChecked: this.isFullDomainChecked,
      flowDirection: this.flowDirection
    }
  }

  @computed get optionsForSearch() {
    return { ...this.options }
  }

  @action.bound updateAll(options: ISearchOptionProps) {
    const { startDate, endDate } = options
    const timeRange = [startDate, endDate]

    this.updateTimeRange(timeRange as [Moment, Moment])

    if ('region' in options) {
      this.updateRegions(options.region)
    }
    if ('freq' in options) {
      this.updateFreq(options.freq)
    }
    if ('isp' in options) {
      this.updateIsp(options.isp)
    }
    if ('trafficRegions' in options) {
      this.updateTrafficRegions(options.trafficRegions!)
    }
    if ('flowDirection' in options) {
      this.updateFlowDirection(options.flowDirection!)
    }
  }

  @computed get queryParams() {
    return this.searchFor === SearchType.VideoSlim
      ? getVideoSlimStatisticDefaultParams()
      : undefined
  }

  @computed get isValid() {
    return isOptionsValid(this.options, this.searchFor)
  }

  @computed get searchOptionsError() {
    return checkOptions(this.options, this.searchFor)
  }

  @action.bound updateFreq(freq: Freq) {
    this.freq = freq
  }

  @action.bound updateRegions(regions: string[]) {
    this.regions = regions
  }

  @action.bound updateIsp(isp: string) {
    this.isp = isp
  }

  @action.bound updateTimeRange(dates: [Moment, Moment]) {
    this.startDate = dates[0]
    this.endDate = dates[1]
  }

  @action.bound updateTrafficRegions(regions: string[]) {
    this.trafficRegions = regions
  }

  @action.bound updateFlowDirection(flowDirection: FlowDirection) {
    this.flowDirection = flowDirection
  }

  @computed get searchFor(): SearchType {
    return this.props.type
  }

  @computed get isAnalysisSearch() {
    return [
      SearchType.Access,
      SearchType.Code,
      SearchType.Hit,
      SearchType.Uv,
      SearchType.Speed,
      SearchType.VideoSlim,
      SearchType.Top
    ].includes(this.searchFor)
  }

  @computed get shouldShowFullCheck() {
    const searchType = this.searchFor
    return !this.userInfo.is_iam_user && [SearchType.Flow, SearchType.Bandwidth].indexOf(searchType) !== -1
  }

  @computed get domainTags() {
    return domainSelector.getValue(this.state).tags
  }

  @computed get isFullDomainChecked() {
    return domainSelector.getValue(this.state).fullSelector
  }

  @computed get selectedDomains() {
    return domainSelector.getValue(this.state).domains.map(it => it.name)
  }

  @action.bound updateSearchDomainsResp({ domains }: IDomainSearchResult) {
    this.domains = domains || []
  }

  @autobind
  searchDomains() {
    return this.domainStore.searchDomains(
      {
        all: true,
        size: MAX_DOMAIN_COUNT,
        ...this.queryParams
      }
    ).then(this.updateSearchDomainsResp)
  }

  init() {
    this.addDisposer(when(
      () => this.domains != null,
      () => {
        const { domains, domainTags } = this.props.options
        const isFullDomainsChecked = !(domains && domains.length)

        if (!isFullDomainsChecked) {
          // FIXME: 当 options.domains 含有不在 this.domains 范围内的域名的时候，可能会有 BUG
          const targetDomains = this.domains!.filter(it => domains.includes(it.name))
          this.state = domainSelector.createState(false, targetDomains, domainTags)
        } else if (this.shouldShowFullCheck) {
          this.state = domainSelector.createState(isFullDomainsChecked)
        } else {
          this.state = domainSelector.createState(false, this.domains!)
        }
      }
    ))

    this.addDisposer(reaction(
      () => this.queryParams,
      () => this.searchDomains(),
      { fireImmediately: true }
    ))

    this.addDisposer(reaction(
      () => this.props.options,
      options => options && this.updateAll(options),
      { fireImmediately: true }
    ))

    this.addDisposer(reaction(
      () => this.shouldShowFullCheck,
      showFullCheck => {
        if (!showFullCheck && this.isFullDomainChecked) {
          this.state = domainSelector.createState(false, this.domains!)
          if (this.isValid) {
            this.props.onSubmit(this.options)
          }
        }
      },
      { fireImmediately: true }
    ))

    // 数据 ready 后自动查一把
    this.addDisposer(when(
      () => this.isValid,
      () => this.props.onSubmit(this.options)
    ))

    this.addDisposer(reaction(
      () => this.timeRange,
      timeRange => {
        if (timeRange.length === 2
          && timeRange[0] != null
          && timeRange[1] != null) {
          this.updateFreq(getFreqByDiffHour(getDiffHour(timeRange[0], timeRange[1])))
        }
      },
      { fireImmediately: true }
    ))

    this.addDisposer(autorun(
      () => this.state && this.addDisposer(this.state.dispose)
    ))
  }
}
