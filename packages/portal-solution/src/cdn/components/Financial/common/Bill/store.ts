/**
 * @file Financial Bill Component
 * @author linchen <linchen@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { computed, action, observable, autorun } from 'mobx'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { PaginationConfig, TableSize } from 'react-icecream/lib/table'

import FinancialApis, { IGetBillOptions, IBill, IGetBillResp } from 'cdn/apis/oem/financial'

import { createState, getValue } from './SearchBar'

enum LoadingType {
  GetBillList = 'getBillList'
}

export interface IProps {
  queryOptions: Pick<IGetBillOptions, 'uid'>
  size?: Exclude<TableSize, 'middle'>
}

const DEFAULT_PAGE_SIZE = 10

@injectable()
export class LocalStore extends Store {
  loadings = Loadings.collectFrom(this, LoadingType)

  formState = createState()

  @observable.ref billList: IBill[] = []
  @observable pageSize = DEFAULT_PAGE_SIZE
  @observable currentPage = 1
  @observable total = 0

  constructor(
    @injectProps() protected props: IProps,
    private toasterStore: Toaster,
    private financialApis: FinancialApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @computed get isLoading() {
    return this.loadings.isLoading(LoadingType.GetBillList)
  }

  @computed get pagination(): PaginationConfig {
    return {
      size: this.props.size,
      pageSize: this.pageSize,
      showSizeChanger: true,
      current: this.currentPage,
      onChange: this.handlePageChange,
      onShowSizeChange: this.handlePageSizeChange,
      total: this.total
    }
  }

  @computed get queryOptions(): IGetBillOptions {
    const [start, end] = getValue(this.formState)
    return {
      ...this.props.queryOptions,
      pageSize: this.pageSize,
      pageNo: this.currentPage - 1, // 后端要求从 0 开始
      startTime: parseInt(start.format('YYYYMM'), 10),
      endTime: parseInt(end.format('YYYYMM'), 10)
    }
  }

  @action.bound updateBillResp(resp: IGetBillResp) {
    this.total = resp.total
    this.billList = resp.list
  }

  @action.bound
  handlePageChange(page: number) {
    this.currentPage = page
  }

  @action.bound
  handlePageSizeChange(_: unknown, pageSize: number) {
    this.pageSize = pageSize
    this.currentPage = 1
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.GetBillList)
  getBillList() {
    return this.financialApis.getBillList(this.queryOptions).then(this.updateBillResp)
  }

  init() {
    this.addDisposer(this.formState.dispose)
    this.addDisposer(autorun(() => this.getBillList()))
  }
}

