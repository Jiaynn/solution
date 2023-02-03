import { observable, action, computed, makeObservable } from 'mobx'

import SslApis, { IOrderAuth, IOrderDetail, OrderType } from '../apis/ssl'
import ApplyState from './apply-state'
import InformationState from './information-state'
import { OrderStatus, ProductShortName } from '../constants/ssl'

export default class OrderInfo {
  constructor(private sslApis: SslApis) {
    makeObservable(this)
    this.updateApplyStateData = this.updateApplyStateData.bind(this)
  }

  @observable currentValues = new ApplyState(this.sslApis).currentValues

  @observable completedInfo = new InformationState()

  @observable orderType!: OrderType
  @observable state!: OrderStatus
  @observable orderParentId!: string
  @observable uploadConfirmLetter!: boolean
  @observable rejectReason!: string
  @observable createTime!: number
  @observable certID!: string
  @observable tradeOrderId!: string
  @observable providerRenewable!: boolean
  @observable isPaid!: boolean
  @observable oneKeyFreeCert!: boolean
  @observable productShortName!: ProductShortName
  @observable autoRenew!: boolean
  @observable renewable!: boolean

  @observable authInfo: IOrderAuth[] = []

  @computed get orderBaseInfo() {
    return this.currentValues
  }

  @action updateApplyStateData(data: IOrderDetail) {
    new ApplyState(this.sslApis).updateCurrentValues.call(this, data)

    this.completedInfo.newDomains = {
      memoName: data.cert_name || '',
      commonName: data.common_name || '',
      dnsNames: data.dns_names ? data.dns_names.split(',') : [],
      authMethod: data.auth_method || '',
      recordType: data.record_type,
      encrypt: data.encrypt || ''
    }

    this.authInfo = data.auth_array || []
    this.orderType = data.orderType || OrderType.Normal
    this.state = data.state
    this.orderParentId = data.orderParentId || ''
    this.uploadConfirmLetter = data.upload_confirm_letter
    this.rejectReason = data.reject_reason || ''
    this.createTime = data.create_time
    this.certID = data.certID || ''
    this.tradeOrderId = data.trade_order_id || ''
    this.providerRenewable = data.provider_renewable || false
    this.isPaid = data.isPaid || false
    this.oneKeyFreeCert = data.oneKeyFreeCert || false
    this.productShortName = data.product_short_name
    this.autoRenew = data.auto_renew || false
    this.renewable = data.renewable || false
  }

  @action updateCompanyContact(data: IOrderDetail) {
    this.completedInfo.updateCompanyContact(data)
  }

  @action resetCompletedInfo() {
    this.completedInfo = new InformationState()
  }
}
