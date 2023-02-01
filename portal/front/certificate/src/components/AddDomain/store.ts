/*
 * @file store of AddDomain
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { observable, action, computed, reaction, autorun } from 'mobx'

import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { RouterStore } from 'portal-base/common/router'
import { injectProps } from 'qn-fe-core/local-store'
import { observeInjectable } from 'qn-fe-core/store'
import { UnknownException } from 'qn-fe-core/exception'
import Disposable from 'qn-fe-core/disposable'

import { SSLDomainType } from '../../constants/ssl'
import SslApis, { IOrderDetail, IReplaceOrderOptions } from '../../apis/ssl'
import { payForOrder } from '../../utils/base'
import {
  getCertFormData,
  getDnsNames
} from '../../transforms/domain'
import {
  createState as createDomainState,
  IState as IDomainState,
  IValue as IDomainValue,
  IDomainFormProps
} from './DomainForm'
import { IAddDomainProps, ICertFormValue } from '.'
import openConfirmModal from './ConfirmModal'
import { basename } from '../../constants/app'
import { getLatestDnsNames } from '../../utils/certificate'

enum LoadingType {
  FetchOrder = 'FetchOrder',
  AddDomain = 'AddDomain',
  QueryAddDomainPrice = 'QueryAddDomainPrice'
}

enum ExceptionType {
  Validate = 'Validate'
}

@observeInjectable()
export default class StateStore extends Disposable {
  constructor(
    @injectProps() private props: IAddDomainProps,
    toasterStore: ToasterStore,
    private routerStore: RouterStore,
    private sslApis: SslApis
  ) {
    super()
    ToasterStore.bindTo(this, toasterStore)
  }

  loading = Loadings.collectFrom(this, LoadingType)

  @computed get isLoading() {
    return !this.loading.isAllFinished()
  }

  @observable.ref order?: IOrderDetail
  @observable.ref originOrder!: IOrderDetail
  @observable.ref domainState: IDomainState = createDomainState()

  @action updateOrder(order: IOrderDetail) {
    this.order = order
  }

  @action updateCurrentAndOriginOrder(order: IOrderDetail) {
    this.updateOrder(order)
    this.originOrder = order
  }

  @action updateDomainState(domainValue: IDomainValue) {
    this.domainState = createDomainState(domainValue, this.order)
  }

  @computed get certFormData(): ICertFormValue | null {
    return this.order ? getCertFormData(this.order) : null
  }

  @computed get domainFormData(): IDomainValue {
    if (!this.order) {
      return []
    }
    return getDnsNames(this.order.dns_names)
  }

  @computed get domainFormProps(): IDomainFormProps {
    if (!this.order) {
      return {
        state: this.domainState,
        domain: '',
        type: undefined,
        bindedDomains: []
      }
    }
    return {
      state: this.domainState,
      domain: this.order.common_name,
      type: this.order.product_type,
      bindedDomains: this.domainFormData
    }
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.FetchOrder)
  async fetchOrder(orderId: string) {
    const order = await this.sslApis.fetchOrderPrepareInfo(orderId)
    if (!order.orderParentId) {
      this.updateCurrentAndOriginOrder(order)
    } else {
      const parentOrder = await this.sslApis.fetchOrderPrepareInfo(order.orderParentId)
      // 查询是否有重颁发订单，若无，则需要更新dnsNames
      if (parentOrder.product_type === SSLDomainType.MultipleWildcard
        || parentOrder.product_type === SSLDomainType.Multiple) {
        const orderList = await this.sslApis.fetchReplaceOrders(order.orderParentId)
        const dnsNames = getLatestDnsNames(orderList).join(',')
        this.updateCurrentAndOriginOrder({ ...parentOrder, dns_names: dnsNames })
      } else {
        this.updateCurrentAndOriginOrder(parentOrder)
      }
    }
  }

  @ToasterStore.handle('添加域名提交成功，待确认签发后即可查看或下载')
  @Loadings.handle(LoadingType.AddDomain)
  addDomain(options: IReplaceOrderOptions) {
    return this.sslApis.replaceOrder(options)
  }

  @Loadings.handle(LoadingType.QueryAddDomainPrice)
  queryAddDomainPrice(options: IReplaceOrderOptions) {
    return this.sslApis.queryReplacePrice(options)
  }

  @ToasterStore.handle()
  async doAddDomain() {
    const { dnsNames } = this.domainState.value
    const replaceOrderOptions: IReplaceOrderOptions = {
      orderid: this.props.id,
      dns_names: dnsNames.join(',')
    }
    const { rmb } = await this.queryAddDomainPrice(replaceOrderOptions)
    const originDnsNames = this.originOrder.dns_names.split(',')
    await openConfirmModal(rmb, originDnsNames ? dnsNames.length - originDnsNames.length : dnsNames.length)
    const order = await this.addDomain(replaceOrderOptions)
    if (order.trade_order_id) {
      payForOrder({
        orderId: order.replace_id,
        tradeOrderId: order.trade_order_id
      }, this.routerStore)
    } else {
      this.routerStore.push(`${basename}/ssl/detail/${this.props.id}/order`)
    }
  }

  reset() {
    this.updateOrder(this.originOrder)
    this.updateDomainState(this.domainFormData)
  }

  @ToasterStore.handle()
  async confirm() {
    const res = await this.domainState.validate()
    if (res.hasError) {
      throw new UnknownException(ExceptionType.Validate, '输入有误、请检查')
    }
    this.doAddDomain()
  }

  init() {
    // id 变化时都需要重新拉取数据
    this.addDisposer(autorun(() => this.props.id && this.fetchOrder(this.props.id)))
    this.addDisposer(() => this.domainState.dispose())

    this.addDisposer(reaction(
      () => this.domainFormData,
      domainFormData => {
        this.updateDomainState(domainFormData)
      }
    ))
  }
}
