/*
 * @file store of Order
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { observable, computed, reaction, action } from 'mobx'

import Disposable from 'qn-fe-core/disposable'
import { observeInjectable } from 'qn-fe-core/store'
import { ToasterStore } from 'portal-base/common/toaster'
import { RouterStore } from 'portal-base/common/router'
import { Loadings } from 'portal-base/common/loading'
import Modal from 'react-icecream/lib/modal'

import { basename } from '../../../constants/app'
import { payForOrder } from '../../../utils/base'
import SslApis, { IQueryOrdersParams, IOrderInfo, IQueryOrderListParams, IOrderDetail } from '../../../apis/ssl'
import { OperationName, IOperationInfo } from '../ColumnRenderers'
import { DownloadCertModalStore } from '../DownloadCertModal'
import { createState, getValue } from './Search'

enum LoadingType {
  CloseOrder = 'CloseOrder',
  ApplyOrderRefund = 'ApplyOrderRefund',
  GetOrderList = 'GetOrderList',
  GetTotal = 'GetTotal'
}

@observeInjectable()
export default class StateStore extends Disposable {
  loading = Loadings.collectFrom(this, LoadingType)

  constructor(
    private toasterStore: ToasterStore,
    private routerStore: RouterStore,
    private sslApis: SslApis
  ) {
    super()
    ToasterStore.bindTo(this, toasterStore)
  }

  downloadCertStore = new DownloadCertModalStore(this.toasterStore, this.sslApis)

  @observable total = 0
  @observable pageIndex = 1
  @observable.ref orders: IOrderInfo[] = []

  pageSize = 10

  @observable.ref searchState = createState()
  @observable.ref searchOptions?: IQueryOrdersParams

  @computed get isLoading() {
    return !this.loading.isAllFinished()
  }

  @computed get pagination() {
    return {
      current: this.pageIndex,
      total: this.total,
      onChange: (pageIdx: number) => this.updatePageIndex(pageIdx)
    }
  }

  @action updateSearchOptions() {
    this.searchOptions = getValue(this.searchState)
  }

  @action updateTotal(total: number) {
    this.total = total
  }

  @action updateOrders(data: IOrderInfo[]) {
    this.orders = data || []
  }

  @action updatePageIndex(pageIndex: number) {
    this.pageIndex = pageIndex
  }

  @ToasterStore.handle('订单关闭成功！')
  @Loadings.handle(LoadingType.CloseOrder)
  closeOrder(orderId: string) {
    return this.sslApis.closeSSLOrder(orderId)
  }

  @ToasterStore.handle('已成功申请退款！')
  @Loadings.handle(LoadingType.ApplyOrderRefund)
  applyRefund(orderId: string) {
    return this.sslApis.closeSSLOrder(orderId)
  }

  handleOrder(orderId: string, isPaid: boolean) {
    const req = isPaid ? this.applyRefund(orderId) : this.closeOrder(orderId)
    return req.then(() => this.fetchOrderByPage(1, getValue(this.searchState)))
  }

  formatQuery(pageIndex: number, query?: IQueryOrdersParams): IQueryOrderListParams {
    return {
      startIndex: (pageIndex - 1) * this.pageSize,
      pageSize: this.pageSize,
      ...query
    }
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetTotal)
  fetchTotal(query: IQueryOrdersParams) {
    return this.sslApis.fetchOrderTotal(query).then(res => this.updateTotal(res.total))
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetOrderList)
  fetchOrderByPage(pageIndex: number, query?: IQueryOrdersParams): Promise<any> {
    return this.sslApis.fetchRangeOrder(this.formatQuery(pageIndex, query))
      .then(res => {
        this.updatePageIndex(pageIndex)
        this.updateOrders(res)
      })
  }

  navToDeploy(orderId: string) {
    this.sslApis.fetchOrderPrepareInfo(orderId)
      .then((data: IOrderDetail) => {
        this.routerStore.push(`${basename}/deploy/${data.certID}`)
      })
  }

  handleOperation(operationInfo: IOperationInfo) {
    const operation = operationInfo.operation
    switch (operation) {
      case OperationName.Renewal: {
        this.routerStore.push(`${basename}/apply/renewal/${operationInfo.id}`)
        break
      }
      case OperationName.AddDomain: {
        this.routerStore.push(`${basename}/reissue/${operationInfo.id}/add`)
        break
      }
      case OperationName.Fixup: {
        this.routerStore.push(`${basename}/complete/first/${operationInfo.id}`)
        break
      }
      case OperationName.FixupRenew: {
        this.routerStore.push(`${basename}/complete/renew/${operationInfo.id}`)
        break
      }
      case OperationName.OrderDownloadCert: {
        this.downloadCertStore.open(false, operationInfo.id)
        break
      }
      case OperationName.Confirmation: {
        this.routerStore.push(`${basename}/confirmation/${operationInfo.id}`)
        break
      }
      case OperationName.Deploy: {
        this.navToDeploy(operationInfo.id)
        break
      }
      case OperationName.Detail: {
        this.routerStore.push(`${basename}/ssl/detail/${operationInfo.id}/order`)
        break
      }
      case OperationName.Pay: {
        payForOrder({ orderId: operationInfo.id, tradeOrderId: operationInfo.tradeid! }, this.routerStore)
        break
      }
      case OperationName.Close: {
        const orderid = operationInfo.id
        const tip = (
            operationInfo.isPaid
            ? '申请退款后，该订单将被关闭，退款金额将返还至您的七牛账户，如仍需购买证书，请重新下单。确认要退款吗？'
            : '关闭订单后，如仍需购买证书，请重新下单。确认关闭订单吗？'
        )
        Modal.confirm({
          content: tip,
          onOk: () => this.handleOrder(orderid, operationInfo.isPaid!)
        })
        break
      }
      default: break
    }
  }

  init() {

    this.addDisposer(reaction(
      () => this.searchOptions,
      searchOptions => {
        this.fetchTotal(searchOptions!)
      },
      {
        fireImmediately: true
      }
    ))

    this.addDisposer(reaction(
      () => ({
        pageIndex: this.pageIndex,
        searchState: this.searchOptions
      }),
      ({ pageIndex, searchState }) => {
        this.fetchOrderByPage(pageIndex, searchState)
      },
      {
        fireImmediately: true
      }
    ))
  }
}
