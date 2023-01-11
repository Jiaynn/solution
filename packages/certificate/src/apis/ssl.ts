/**
 * @file SSL API
 * @author yaojingtian <yncst233@gmail.com>
 */

import { trim } from 'lodash'
import { injectable } from 'qn-fe-core/di'

import { OrderStatus, SSLDomainType, ProductShortName, CertStatus } from '../constants/ssl'
import { SslClient, SslProxyClient, SslHttpClient } from './client'
import { AuthMethodType, DnsRecordType } from '../constants/domain'

export interface IQueryOrdersParams {
  keyword?: string
  state?: OrderStatus
  productShortName?: string
  startTime?: number
  endTime?: number
}

export interface ITotal {
  total: number
}

// 获取订单列表信息
export interface IQueryOrderListParams extends IQueryOrdersParams {
  startIndex: number
  pageSize: number
}

export enum OrderType {
  Normal = 'normal', // 温馨提示：历史原因，目前空字符串表示的含义也是 normal，后端将来会修正 https://jira.qiniu.io/browse/FUSION-11320
  Renew = 'renew',
  Replace = 'replace'
}

export interface IOrderInfo {
  orderid: string
  state: OrderStatus
  product_short_name: ProductShortName
  isPaid: boolean // 是否有过支付行为

  auth: IOrderAuth
  auth_array: IOrderAuth[]
  cert_name: string
  common_name: string
  create_time: number
  last_modify_time: number
  not_after: number
  not_before: number
  orderParentId: string
  orderType: OrderType // 温馨提示：历史原因，目前空字符串表示的含义也是 normal，后端将来会修正 https://jira.qiniu.io/browse/FUSION-11320
  product_type: SSLDomainType
  provider_renewable: boolean
  reject_reason: string
  trade_order_id: string
  upload_confirm_letter: boolean
  org_organization_name: string
  oneKeyFreeCert: boolean
  auto_renew: boolean // 是否自动续期，1 + 1 续期订单中第一个订单值为 true
  renewable: boolean // 是否显示续费按钮
}

export interface IOrderAuth {
  AuthKey: string
  AuthValue: string
  Domain: string
}

export interface IPrepareOrderInfoOptions {
  product_short_name: ProductShortName
  years: number
  limit: number
  wildcard_limit: number
  product_type: SSLDomainType
}

export interface IPrepareSSLOrder {
  trade_order_id: string
  order_id: string
}

export interface IRenewOrderOptions extends IPrepareOrderInfoOptions {
  orderid: string
  certid: string
  name: string
}

export interface IOrderDetail extends IOrderInfo, IPrepareOrderInfoOptions {
  certID: string
  orderParentId: string
  encrypt: string
  dns_names: string
  auth_method: AuthMethodType
  /** 当 auth_method 为 DNS 时该字段有效 */
  record_type?: DnsRecordType

  admin_email: string
  admin_firstName: string
  admin_lastName: string
  admin_phone: string
  admin_title: string

  org_addressLine1: string
  org_city: string
  org_country: string
  org_division: string
  org_organization_name: string
  org_phone: string
  org_postalCode: string
  org_region: string
}

export interface ISaveOrderInfo {
  common_name: string
  org_addressLine1: string
  org_city: string
  org_region: string
  org_postalCode: string
  org_country: string
  admin_firstName: string
  admin_lastName: string
  admin_phone: string
  admin_email: string
  org_organization_name: string
  org_division: string
  org_phone: string
  orderid: string
  admin_title: string
  dns_names: string
  cert_name: string
  auth_method: AuthMethodType
  encrypt: string
  toBeDeployedDomains?: string[]
}

export interface IConfirmLetter {
  file_name: string
  file_data: string
}

// 获取证书列表信息
export interface ISSLCertListReq {
  keyword?: string
  productShortName?: string
  startTime?: number
  endTime?: number
  beforeAsc?: boolean
  afterAsc?: boolean
}

export interface ISSLCertListWithPageReq extends ISSLCertListReq {
  startIndex: number,
  pageSize: number
}

export interface ICertInfo {
  name: string
  common_name: string
  certid: string
  create_time: number
  dnsnames: string[]
  not_after: number
  not_before: number
  orderid: string
  product_short_name: ProductShortName
  cert_type: string
  product_type: SSLDomainType
  state: CertStatus
  child_order_id: string
  auto_renew: boolean
  renewable: boolean
}

interface IUserCertInfo {
  name: string
  pri: string // 私钥
  ca: string // 公钥
}

export interface ICA {
  ca: string
}

export interface IRenewOrder {
  trade_order_id: string
  order_id: string
}

export interface IReplaceOrderOptions {
  orderid: string
  dns_names: string
}

export interface IReplaceOrder {
  trade_order_id: string
  replace_id: string
}

export interface IReplacePrice {
  rmb: number
}

export interface IAuthInfo {
  AuthKey: string
  AuthValue: string
  Domain: string
}

export interface IHistoryOrder {
  orderid: string
  state: number
  reject_reason: string
  dnsnames: string
  certID: string
  trade_order_id: string
  create_time: number
  auth_array: IAuthInfo[]
  auth_method: AuthMethodType
  /** 当 auth_method 为 DNS 该字段有效 */
  record_type?: DnsRecordType
  isPaid: boolean
}

export interface IVerifyHostOptions {
  domain: string
  path?: string
  value: string
  method: string
  /** 当 method 为 DNS 该字段有效 */
  record_type?: DnsRecordType
}

export interface IBaseContact {
  remarkName: string
  lastName: string
  firstName: string
  position: string
  phone: string
  email: string
  isDefault: boolean
}

export interface IContact extends IBaseContact {
  id?: string
  modifyAt?: string
}

export interface IContactList {
  list: IContact[]
}

export interface IContactIds {
  ids: string[]
}

export interface IBaseCompany {
  name: string
  remarkName: string
  division: string
  country: string
  province: string
  city: string
  address: string
  postCode: string
  phone: string
  isDefault: boolean
}

export interface ICompany extends IBaseCompany {
  id?: string
  modifyAt?: string
}

export interface ICompanyList {
  list: ICompany[]
}

export interface ICompanyIds {
  ids: string[]
}

export interface IRecommendCertOptions {
  certId: string
}

export interface IRecommendCert {
  product_short_name: ProductShortName
  years: number
  limit: number
  wildcard_limit: number
  rmb: number
}

export type PeakOrderResponse = {
  is_on_sale: boolean
  prime_rmb: number
  rmb: number
  sale_rmb: number
}

@injectable()
export default class SslApis {
  constructor(
    private sslClient: SslClient,
    private sslProxyClient: SslProxyClient,
    private sslHttpClient: SslHttpClient
  ) { }

  // 获取证书列表总数
  fetchOrderTotal(params: IQueryOrdersParams): Promise<ITotal> {
    if (params) {
      const { keyword, state, productShortName, startTime, endTime } = params
      const requestParams = {
        state: state != null && state > 0 ? state : null,
        product_short_name: productShortName === '-1' ? null : productShortName,
        start_time: startTime || null,
        end_time: endTime || null,
        keyword: trim(keyword) || null
      }

      return this.sslClient.get('/sslorders/total', requestParams)
    }
    return this.sslClient.get('/sslorders/total')
  }

  fetchRangeOrder(params: IQueryOrderListParams): Promise<IOrderInfo[]> {
    const { startIndex, pageSize, keyword, state, productShortName, startTime, endTime } = params
    const requestParams = {
      start_index: startIndex,
      total: pageSize,
      state: state != null && state > 0 ? state : null,
      product_short_name: productShortName === '-1' ? null : productShortName,
      start_time: startTime || null,
      end_time: endTime || null,
      keyword: trim(keyword) || null
    }

    return this.sslClient.get('/sslorders', requestParams)
  }

  // prepare 订单
  prepareOrder(param: IPrepareOrderInfoOptions): Promise<IPrepareSSLOrder> {
    return this.sslClient.post('/sslorder/prepare', param)
  }

  // renew 订单
  renewOrder(param: IRenewOrderOptions): Promise<IPrepareSSLOrder> {
    return this.sslProxyClient.post('/certrenew', param)
  }

  fetchOrderPrepareInfo(orderId: string): Promise<IOrderDetail> {
    return this.sslClient.get(`/sslorder/${orderId}`)
  }

  // 订单价格
  peekOrder(param: IPrepareOrderInfoOptions) {
    return this.sslClient.get<PeakOrderResponse>('/sslorder/peek', {
      product_short_name: param.product_short_name,
      years: param.years,
      limit: param.limit,
      wildcard_limit: param.wildcard_limit
    })
  }

  // save订单
  saveOrder(param: ISaveOrderInfo) {
    return this.sslClient.post('/sslorder/create', param)
  }

  downloadConfirmLetterTemplate(id: string): Promise<IConfirmLetter> {
    return this.sslClient.get(`/download_confirm_letter_template/${id}`)
  }

  uploadConfirmLetter(formData: FormData): Promise<void> {
    return this.sslHttpClient.post('/upload_confirm_letter', formData, {
      credentials: 'include'
    })
  }

  fetchRangeSSLCert(params: ISSLCertListWithPageReq): Promise<ICertInfo> {
    const { startIndex, pageSize, keyword, productShortName, startTime, endTime } = params
    const requestParams = {
      start_index: startIndex,
      total: pageSize,
      product_short_name: productShortName === '-1' ? null : productShortName,
      start_time: startTime || null,
      end_time: endTime || null,
      keyword: keyword || null
    }

    return this.sslClient.get('/ssls', requestParams)
  }

  fetchRangeSSLCertV2(params: ISSLCertListReq): Promise<ICertInfo[]> {
    const { keyword, productShortName, startTime, endTime, beforeAsc, afterAsc } = params
    const requestParams = {
      product_short_name: productShortName === '-1' ? null : productShortName,
      start_time: startTime || null,
      end_time: endTime || null,
      keyword: trim(keyword) || null,
      before_asc: beforeAsc,
      after_asc: afterAsc
    }

    return this.sslClient.get('/ssls/v2', requestParams)
  }

  saveSSLCert(param: IUserCertInfo): Promise<void> {
    return this.sslClient.post('/ssl/save', param)
  }

  renameSSLCert(param: {id: string, newName: string}): Promise<void> {
    return this.sslClient.post(`/ssl/${param.id}`, param)
  }

  deleteSSLCert(id: string): Promise<void> {
    return this.sslClient.delete(`/ssl/${id}`)
  }

  closeSSLOrder(id: string): Promise<void> {
    return this.sslClient.post('/sslorder/close', { order_id: id })
  }

  downloadSSLCert(id: string): Promise<void> {
    return this.sslClient.get(`/ssl/${id}/download`)
  }

  fetchCert(ca: string): Promise<ICA> {
    return this.sslClient.post('/ssl/fetchca', { ca })
  }

  orderRenew(param: { orderid: string, years: number}): Promise<IRenewOrder> {
    return this.sslClient.post('/sslorder/renew', param)
  }

  replaceOrder(options: IReplaceOrderOptions): Promise<IReplaceOrder> {
    return this.sslClient.post('/sslorder/replace', options)
  }

  queryReplacePrice(options: IReplaceOrderOptions): Promise<IReplacePrice> {
    return this.sslClient.get(`/sslorder/price?orderId=${options.orderid}&dnsNames=${options.dns_names}`)
  }

  fetchReplaceOrders(orderid: string): Promise<IHistoryOrder[]> {
    return this.sslClient.get(`/sslorders/replace/${orderid}`)
  }

  verifyHost(options: IVerifyHostOptions): Promise<boolean> {
    return this.sslClient.get('/ssl/verifyhost', options)
  }

  addContact(option: IBaseContact): Promise<void> {
    return this.sslClient.post('/ssl/add_user', option)
  }

  modifyContact(option: IContact): Promise<void> {
    return this.sslClient.post('/ssl/modify_user', option)
  }

  getContactList() {
    return this.sslClient.post<IContactList>('/ssl/users')
      .then(res => ({ list: res.list || [] }))
  }

  deleteContactList(option: IContactIds): Promise<void> {
    return this.sslClient.post('/ssl/delete_user', option)
  }

  addCompany(option: IBaseCompany): Promise<void> {
    return this.sslClient.post('/ssl/add_company', option)
  }

  modifyCompany(option: ICompany): Promise<void> {
    return this.sslClient.post('/ssl/modify_company', option)
  }

  getCompanyList() {
    return this.sslClient.post<ICompanyList>('/ssl/company_list')
      .then(res => ({ list: res.list || [] }))
  }

  deleteCompanyList(option: ICompanyIds): Promise<void> {
    return this.sslClient.post('/ssl/delete_company', option)
  }

  recommendCert(options: IRecommendCertOptions): Promise<IRecommendCert> {
    return this.sslProxyClient.get('/optimalcertproduct', options)
  }
}
