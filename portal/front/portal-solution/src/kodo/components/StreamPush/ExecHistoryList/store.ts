/**
 * @desc Stream push task execute history list store
 * @author hovenjay <hovenjay@outlook.com>
 */

import autobind from 'autobind-decorator'
import { RangePickerValue } from 'antd/lib/date-picker/interface'
import { action, computed, makeObservable, observable } from 'mobx'
import moment from 'moment'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import Store from 'qn-fe-core/store'
import { injectable } from 'qn-fe-core/di'
import { injectProps } from 'qn-fe-core/local-store'
import { LoadMore } from 'react-icecream/lib/table'

import { valuesOf } from 'kodo/utils/ts'

import { pageSize } from 'kodo/constants/stream-push'

import {
  StreamPushApis, GetStreamPushTaskExecHistoriesOptions, TaskExecHistories, TaskExecHistory
} from 'kodo/apis/stream-push'
import { ExecHistoryListProps } from '.'

enum Loading {
  FetchTaskExecHistoryList = 'FetchTaskExecHistoryList'
}

@injectable()
export default class HistoryListStore extends Store {

  constructor(
    private streamPushApis: StreamPushApis,
    private toaster: Toaster,
    @injectProps() props: ExecHistoryListProps
  ) {
    super()
    makeObservable(this)
    this.initSearchKeywords(props.taskName)
    Toaster.bindTo(this, this.toaster)
  }

  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @observable isEnd = false

  @observable marker = ''

  @observable searchKeywords = ''

  @observable.ref taskExecHistoryList: TaskExecHistory[] = []

  @observable.ref dateRanges: RangePickerValue = [moment().subtract(2, 'weeks').startOf('day'), moment().endOf('day')]

  @observable.ref queryOptions: GetStreamPushTaskExecHistoriesOptions = {
    limit: pageSize,
    start: this.dateRanges[0]!.valueOf(),
    end: this.dateRanges[1]!.valueOf()
  }

  @computed
  get isTaskExecHistoryListLoading(): boolean {
    return this.loadings.isLoading(Loading.FetchTaskExecHistoryList)
  }

  @computed
  get loadMoreProps(): LoadMore {
    return {
      loading: this.isTaskExecHistoryListLoading,
      hasMore: !this.isEnd,
      onLoad: this.loadMore
    }
  }

  @action.bound
  initSearchKeywords(searchKeywords?: string) {
    this.updateSearchKeywords(searchKeywords || '')
    this.updateQueryOptions({ name: searchKeywords })
  }

  @action.bound
  resetList() {
    this.isEnd = false
    this.marker = ''
    this.taskExecHistoryList = []
  }

  @action.bound
  updateSearchKeywords(searchKeywords: string) {
    this.searchKeywords = searchKeywords
  }

  @action.bound
  updateTaskExecHistoryList(rsp: TaskExecHistories) {
    this.taskExecHistoryList = this.taskExecHistoryList.concat(rsp && rsp.histories ? rsp.histories : [])
    this.marker = rsp.marker
    this.isEnd = rsp.isEnd
  }

  @action.bound
  updateDateRanges(dates: RangePickerValue) {
    this.resetList()
    this.dateRanges = dates
    const [startDate, endDate] = dates
    this.updateQueryOptions({ start: startDate!.valueOf(), end: endDate!.valueOf() })
    this.fetchExecHistories()
  }

  @action.bound
  updateQueryOptions(options: Partial<GetStreamPushTaskExecHistoriesOptions>) {
    this.queryOptions = { ...this.queryOptions, ...options }
  }

  @action.bound
  handleSearchTasks() {
    this.resetList()
    this.updateQueryOptions({ name: this.searchKeywords, marker: this.marker })
    this.fetchExecHistories()
  }

  @autobind
  loadMore() {
    this.updateQueryOptions({ marker: this.marker })
    this.fetchExecHistories()
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.FetchTaskExecHistoryList)
  fetchExecHistories() {
    return this.streamPushApis.getSteamPushTaskExecHistories(this.queryOptions)
      .then(this.updateTaskExecHistoryList)
  }
}
