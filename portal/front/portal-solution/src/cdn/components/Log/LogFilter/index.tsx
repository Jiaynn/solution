/*
 * @file 日志筛选条件
 * @author gaoupon <gaopeng01@qiniu.com>
 */

import React from 'react'
import moment from 'moment'
import { assign, isEmpty } from 'lodash'
import autobind from 'autobind-decorator'
import { action, autorun, computed, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { useLocalStore, injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Spin from 'react-icecream/lib/spin'
import Form from 'react-icecream/lib/form'
import DatePicker from 'react-icecream/lib/date-picker'
import Button from 'react-icecream/lib/button'
import { useTranslation } from 'portal-base/common/i18n'

import { DomainType } from 'cdn/constants/domain'

import DomainSelector, * as domainSelector from 'cdn/components/common/DomainSelector'

import DomainApis, { IQueryParams, IDomainSearchResult, IDomain } from 'cdn/apis/domain'
import { IFilterOptions } from 'cdn/apis/log'

import './style.less'

const FormItem = Form.Item
const RangePicker = DatePicker.RangePicker
type Moment = moment.Moment
type DateRangeValue = [Moment, Moment]

export interface ILogFilterProps {
  onSearch: (option: IFilterOptions) => void
  isLoading: boolean
  now?: Moment
}

enum LoadingType {
  DomainSearch = 'domainSearch'
}

@injectable()
export class LocalStore extends Store {

  loadings = Loadings.collectFrom(this, LoadingType)

  @observable.ref searchDomainResult!: IDomainSearchResult
  @observable.ref startDate!: Moment
  @observable.ref endDate!: Moment
  @observable.ref searchParams: IQueryParams = { size: 200, all: true }

  @observable.ref domainState = domainSelector.createState()

  now = this.props.now || moment()

  constructor(
    @injectProps() protected props: ILogFilterProps,
    private toasterStore: Toaster,
    private domainApis: DomainApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @computed get isLoadingDomainList() {
    return this.loadings.isLoading(LoadingType.DomainSearch)
  }

  @computed get domainList(): string[] {
    return (
      this.searchDomainResult
      && this.searchDomainResult.domains.filter((domain: IDomain) => (
        domain.type === DomainType.Normal
          || domain.type === DomainType.Wildcard
          || domain.type === DomainType.Test
      )).map((domain: IDomain) => domain.name)
    ) || []
  }

  @computed get dateRange(): DateRangeValue {
    return [this.startDate, this.endDate]
  }

  @computed get selectedDomains() {
    return domainSelector.getValue(this.domainState).domains.map(it => it.name)
  }

  @action
  updateDateRange(dateRange: DateRangeValue) {
    this.startDate = dateRange[0]
    this.endDate = dateRange[1]
  }

  @action
  updateSearchParams(params: IQueryParams) {
    this.searchParams = assign({}, this.searchParams, params)
    this.fetchDomainList()
  }

  @action
  updateSearchDomainResult(result: IDomainSearchResult) {
    this.searchDomainResult = result
  }

  @Toaster.handle()
  @Loadings.handle(LoadingType.DomainSearch)
  fetchDomainList() {
    return this.domainApis.searchDomains(this.searchParams).then(
      (result: IDomainSearchResult) => {
        this.updateSearchDomainResult(result)
      }
    )
  }

  @autobind
  getDisabledDate(current?: Moment): boolean {
    if (!current) {
      return false
    }
    const { now } = this.props
    const c = current.clone()
    return (
      c.isAfter(now)
      || c.add(30, 'day').isBefore(now)
    )
  }

  init() {
    this.updateDateRange([this.now, this.now])

    this.addDisposer(autorun(
      () => this.domainState && this.addDisposer(this.domainState.dispose)
    ))

    return this.fetchDomainList().then(
      () => {
        const result = this.searchDomainResult
        if (!isEmpty(result.domains)) {
          runInAction(() => {
            this.domainState = domainSelector.createState(false, result.domains)
          })
        }
      }
    )
  }
}

const messages = {
  search: {
    cn: '搜索',
    en: 'Search'
  },
  selectDate: {
    cn: '选择日期',
    en: 'Date'
  },
  selectDomain: {
    cn: '选择域名',
    en: 'Domain'
  }
}

export default observer(function _LogFilter(props: ILogFilterProps) {
  const store = useLocalStore(LocalStore, props)
  const { onSearch, isLoading } = props
  const t = useTranslation()

  const onSubmit = React.useCallback(() => {
    const handleSearch = onSearch
    // 由于 RangePicker 组件的限制，界面上点击 a - a 日期，实际的值为 a 00:00:00 - a 23:59:59
    // 而后端必须要 a - a + 1 这样才可以查出 a 当天的日志，这样才与旧版一致，因此这里给 endDate + 1 天
    const options: IFilterOptions = {
      domains: store.selectedDomains,
      start: store.startDate.clone().startOf('d').unix(),
      end: store.endDate.clone().add(1, 'd').startOf('d').unix(),
      marker: '',
      limit: 30
    }
    handleSearch(options)
  }, [store, onSearch])

  return (
    <Spin spinning={store.isLoadingDomainList}>
      <Form layout="inline" className="log-filter-wrapper" colon={false} >
        <FormItem label={t(messages.selectDate)}>
          <RangePicker
            style={{ width: '240px', marginLeft: '8px' }}
            allowClear={false}
            value={store.dateRange}
            onChange={dates => store.updateDateRange(dates as DateRangeValue)}
            disabledDate={current => store.getDisabledDate(current)}
          />
        </FormItem>
        <FormItem
          label={t(messages.selectDomain)}
        >
          <div style={{ marginLeft: '8px' }}>
            <DomainSelector
              state={store.domainState}
            />
          </div>
        </FormItem>
        <FormItem>
          <Button
            style={{ marginLeft: '24px' }}
            type="primary"
            htmlType="button"
            onClick={onSubmit}
            loading={isLoading}
          >
            {t(messages.search)}
          </Button>
        </FormItem>
      </Form>
    </Spin>
  )
})
