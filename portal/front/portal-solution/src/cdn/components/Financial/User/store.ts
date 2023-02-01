/**
 * @file Financial User Store
 * @author linchen <linchen@qiniu.com>
 */

import autobind from 'autobind-decorator'
import { computed, action, observable, autorun } from 'mobx'
import { noop } from 'lodash'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { PaginationConfig } from 'react-icecream/lib/table'

import FinancialApis, {
  IGetFinancialOptions,
  IFinancial,
  IGetFinancialResp,
  IFinancialBase,
  IUpdateBill
} from 'cdn/apis/oem/financial'

import { BillHistoryModalStore } from './Modal/BillHistory'
import { UserFinancialModalStore } from './Modal/UserFinancial'
import { UpdateBillModalStore } from './Modal/UpdateBill'
import { CurrentBillModalStore } from './Modal/CurrentBill'
import { createState } from './SearchBar'

enum LoadingType {
  GetFinancial = 'getFinancial',
  UpdateFinancial = 'updateFinancial',
  UpdateBill = 'updateBill'
}

const DEFAULT_PAGE_SIZE = 10

@injectable()
export class LocalStore extends Store {
  searchState = createState()
  loadings = Loadings.collectFrom(this, LoadingType)

  userFinancialModalStore = new UserFinancialModalStore()
  billHistoryModalStore = new BillHistoryModalStore()
  updateBillModalStore = new UpdateBillModalStore()
  currentBillModalStore = new CurrentBillModalStore()

  @observable.ref financialList: IFinancial[] = []
  @observable pageSize = DEFAULT_PAGE_SIZE
  @observable currentPage = 1
  @observable total = 0

  constructor(
    public toasterStore: Toaster,
    private financialApis: FinancialApis
  ) {
    super()
    Toaster.bindTo(this, this.toasterStore)
  }

  @computed get isLoading() {
    return !this.loadings.isAllFinished()
  }

  @computed get pagination(): PaginationConfig {
    return {
      pageSize: this.pageSize,
      showSizeChanger: true,
      current: this.currentPage,
      onChange: this.handlePageChange,
      onShowSizeChange: this.handlePageSizeChange,
      total: this.total
    }
  }

  @computed get queryOptions(): IGetFinancialOptions {
    return {
      content: this.searchState.value,
      pageSize: this.pageSize,
      pageNo: this.currentPage - 1 // 后端分页从 0 开始
    }
  }

  @action.bound updateFinancialResp(resp: IGetFinancialResp) {
    this.total = resp.total
    this.financialList = resp.list
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

  @autobind handleShowHistory(info: IFinancial) {
    this.billHistoryModalStore
      .open({ uid: info.uid, name: info.name })
      .catch(noop)
  }

  @autobind handleShowCurrent(info: IFinancial) {
    this.currentBillModalStore
      .open({ uid: info.uid, name: info.name })
      .catch(noop)
  }

  @autobind
  @Toaster.handle('设置成功')
  @Loadings.handle(LoadingType.UpdateFinancial)
  updateFinancial(uid: number, info: IFinancialBase) {
    return this.financialApis.updateFinancial(uid, info).then(() => { this.getFinancial() })
  }

  @autobind
  @Toaster.handle('出账成功')
  @Loadings.handle(LoadingType.UpdateBill)
  updateBill(uid: number, info: IUpdateBill) {
    return this.financialApis.updateBill(uid, info)
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(LoadingType.GetFinancial)
  getFinancial() {
    return this.financialApis.getFinancial(this.queryOptions).then(this.updateFinancialResp)
  }

  init() {
    this.addDisposer(this.searchState.dispose)
    this.addDisposer(autorun(() => this.getFinancial()))
  }
}
