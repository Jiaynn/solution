/*
 * @file store of Complete
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { observable, action, computed, reaction } from 'mobx'
import { uniq } from 'lodash'

import { observeInjectable } from 'qn-fe-core/store'
import { injectProps } from 'qn-fe-core/local-store'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { RouterStore } from 'portal-base/common/router'

import { CompleteType, AuthMethodType, EncryptType } from '../../constants/domain'
import { isTrustAsia, SSLDomainType, isDVSSLType, isWildCardType, CertType } from '../../constants/ssl'
import SslApis, { IOrderDetail, ICompany, IContact, ISaveOrderInfo, IBaseContact, IBaseCompany } from '../../apis/ssl'
import {
  validateCompanyData,
  validateContactData,
  isMultiDomain
} from '../../transforms/complete'
import {
  createState as createDomainState,
  IState as IDomainState,
  IValue as IDomainValue,
  IDomainFormProps
} from './DomainForm'
import { CompanyDrawerStore } from './CompanyDrawer'
import { ContactDrawerStore } from './ContactDrawer'
import { IValue as CompanyFormValue } from '../SSLOverview/Info/Company/Form'
import { IValue as ContactFormValue } from '../SSLOverview/Info/Contact/Form'

import { basename } from '../../constants/app'
import { getLatestDnsNames, shortNameToInfo } from '../../utils/certificate'
import {
  wildcardDomainValid, standardDomainValid
} from '../../utils/validate'
import { domainsValidate, cannotContainCommonName } from '../common/MultiDomainInput'
import { ICertFormValue, ICertFormDomain, ICompleteProps } from '.'
import { AppointmentForEditProps } from '../Deploy/Appointment'

enum LoadingType {
  GetOrder = 'GetOrder',
  CompleteInformation = 'CompleteInformation',
  AddCompany = 'AddCompany',
  ModifyCompany = 'ModifyCompany',
  AddContact = 'AddContact',
  ModifyContact = 'ModifyContact'
}

@observeInjectable()
export default class StateStore extends Disposable {
  constructor(
    @injectProps() private props: ICompleteProps,
    private toasterStore: ToasterStore,
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

  companyDrawerStore: CompanyDrawerStore = new CompanyDrawerStore(this.toasterStore, this.sslApis)
  contactDrawerStore: ContactDrawerStore = new ContactDrawerStore(this.toasterStore, this.sslApis)

  // 当前的订单
  @observable.ref order?: IOrderDetail
  // 当前订单的原始状态，用于重置
  @observable.ref originOrder?: IOrderDetail
  // 域名表单的 formstate
  @observable.ref domainState: IDomainState = createDomainState()
  // 上次编辑后的公司信息
  @observable.ref lastCompanyFormData?: ICompany
  // 上次编辑后的联系人信息
  @observable.ref lastContactFormData?: IContact

  @observable.ref domainsToDeploy: string[] = []

  @observable displayDeploy = false

  @action updateOrder(order?: IOrderDetail) {
    this.order = order
  }

  @action updateOriginOrder(order: IOrderDetail) {
    this.originOrder = order
  }

  @action updateDomainState(domainValue?: IDomainValue) {
    this.domainState = createDomainState(domainValue)
    const { product_type, product_short_name, common_name } = this.order!
    const { certType } = shortNameToInfo(product_short_name)
    this.domainState.$.encrypt.disableValidationWhen(() => certType !== CertType.DV)
    this.domainState.$.authMethod.disableValidationWhen(
      () => !isTrustAsia(product_short_name) || certType !== CertType.DV
    )
    this.domainState.$.domain.validators(
      commonNameValue => (isWildCardType(certType) && wildcardDomainValid(commonNameValue))
      || (!isWildCardType(certType) && standardDomainValid(commonNameValue))
    )
    this.domainState.$.dnsNames.validators(
      dnsNamesValue => cannotContainCommonName(dnsNamesValue, common_name)
      || domainsValidate(product_type, dnsNamesValue)
    ).disableValidationWhen(() => !isMultiDomain(this.order! && this.order.product_type))
  }

  @action updateDisplayDeploy(displayDeploy: boolean) {
    this.displayDeploy = displayDeploy
  }

  @action updateLastCompanyFormData(formData?: ICompany) {
    this.lastCompanyFormData = formData
  }

  @action updateLastContactFormData(formData?: IContact) {
    this.lastContactFormData = formData
  }

  @action updateDomainsToDeploy(domains: string[]) {
    this.domainsToDeploy = domains
  }

  @computed get certFormData(): ICertFormValue | null {
    return this.order ? getCertFormData(this.order) : null
  }

  @computed get partialAppointProps(): Pick<AppointmentForEditProps, 'dnsNames' | 'certId' | 'orderId'> {
    const domainStateValue = this.domainState.value
    return {
      certId: this.order ? this.order.certID : undefined,
      orderId: this.props.id,
      dnsNames: uniq([...domainStateValue.dnsNames, domainStateValue.domain])
    }
  }

  @computed get domainFormProps(): IDomainFormProps {
    return {
      state: this.domainState,
      isFirst: this.props.type === CompleteType.First,
      productName: this.order ? this.order.product_short_name : undefined,
      type: this.order ? this.order.product_type : undefined,
      limit: this.order ? this.order.limit + this.order.wildcard_limit : 0,
      years: this.order?.years ?? 1
    }
  }

  @computed get companyFormData(): ICompany | undefined {
    if (this.lastCompanyFormData) {
      return this.lastCompanyFormData
    }
    return this.order ? { ...getCompanyFormData(this.order), id: '' } : undefined
  }

  @computed get contactFormData(): IContact | undefined {
    if (this.lastContactFormData) {
      return this.lastContactFormData
    }
    return this.order ? { ...getContactFormData(this.order), id: '' } : undefined
  }

  @computed get needConfirmation(): boolean {
    if (!this.order || !this.originOrder) {
      return false
    }
    const certInfo = shortNameToInfo(this.order.product_short_name)
    if (isDVSSLType(certInfo.certType)) {
      return false
    }
    return true
  }

  @ToasterStore.handle()
  openCompanyDrawer(isModify?: boolean, company?: ICompany) {
    return this.companyDrawerStore.open(isModify, company)
      .then(({ useOnly, ...companyFormData }) => {
        this.updateLastCompanyFormData(companyFormData)
        if (!useOnly) {
          return companyFormData.id
            ? this.modifyCompany(companyFormData)
            : this.addCompany(companyFormData)
        }
      })
  }

  @ToasterStore.handle()
  openContactDrawer(isModify?: boolean, contact?: IContact) {
    return this.contactDrawerStore.open(isModify, contact)
      .then(({ useOnly, ...contactFormData }) => {
        this.updateLastContactFormData(contactFormData)
        if (!useOnly) {
          return contactFormData.id
            ? this.modifyContact(contactFormData)
            : this.addContact(contactFormData)
        }
      })
  }

  updateOrderAndDomainState(order: IOrderDetail) {
    this.updateOrder(order)
    this.updateOriginOrder(order)
    this.updateDomainState(getDomainFormData(order))
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.GetOrder)
  async fetchOrder(orderId: string, type: string) {
    const order = await this.sslApis.fetchOrderPrepareInfo(orderId)
    if (type === CompleteType.Renew && order.orderParentId) {
      let parentOrder = await this.sslApis.fetchOrderPrepareInfo(order.orderParentId)

      parentOrder = {
        ...parentOrder,
        // 以下数据使用当前订单的
        years: order.years,
        auto_renew: order.auto_renew
      }

      // 补全证书里待录入的 `auth_method` 要根据订单状态重新生成
      parentOrder.auth_method = getDefaultAuthMethod(parentOrder)

      // 查询是否有重颁发订单，若无，则需要更新dnsNames
      if ([SSLDomainType.MultipleWildcard, SSLDomainType.Multiple].includes(parentOrder.product_type)) {
        const list = await this.sslApis.fetchReplaceOrders(order.orderParentId)
        const dnsNames = getLatestDnsNames(list)
        if (dnsNames.length > 0) {
          this.updateOrderAndDomainState({ ...parentOrder, dns_names: dnsNames.join(',') })
        } else {
          this.updateOrderAndDomainState(parentOrder)
        }
      } else {
        this.updateOrderAndDomainState(parentOrder)
      }
    } else {
      this.updateOrderAndDomainState(order)
    }
  }

  @ToasterStore.handle('补全信息成功！')
  @Loadings.handle(LoadingType.CompleteInformation)
  saveOrder(order: ISaveOrderInfo) {
    return this.sslApis.saveOrder(order)
  }

  @Loadings.handle(LoadingType.AddCompany)
  addCompany(option: IBaseCompany) {
    return this.sslApis.addCompany(option)
  }

  @Loadings.handle(LoadingType.ModifyCompany)
  modifyCompany(option: ICompany) {
    return this.sslApis.modifyCompany(option)
  }

  @Loadings.handle(LoadingType.AddContact)
  addContact(option: IBaseContact) {
    return this.sslApis.addContact(option)
  }

  @Loadings.handle(LoadingType.ModifyContact)
  modifyContact(option: IContact) {
    return this.sslApis.modifyContact(option)
  }

  @ToasterStore.handle()
  setDefaultCompany() {
    return this.sslApis.getCompanyList().then(({ list }) => {
      const defaultCompany = list.find(item => item.isDefault)!
      this.updateLastCompanyFormData(defaultCompany)
    })
  }

  @ToasterStore.handle()
  setDefaultContact() {
    return this.sslApis.getContactList().then(({ list }) => {
      const defaultContact = list.find(item => item.isDefault)!
      this.updateLastContactFormData(defaultContact)
    })
  }

  reset() {
    this.updateOrder(this.originOrder)
    this.updateDomainState(getDomainFormData(this.originOrder!))
    if (this.props.type === CompleteType.First) {
      this.setDefaultCompany()
      this.setDefaultContact()
    } else {
      this.updateLastCompanyFormData(this.companyFormData)
      this.updateLastContactFormData(this.contactFormData)
    }
  }

  @ToasterStore.handle()
  validateCompanyAndContact() {
    if (!validateCompanyData(getCompanyFormData(this.order!))) {
      return Promise.reject('公司信息不能为空')
    }
    if (!validateContactData(getContactFormData(this.order!))) {
      return Promise.reject('联系人信息不能为空')
    }
    return Promise.resolve()
  }

  confirm() {
    this.validateCompanyAndContact()
      .then(() => this.domainState.validate())
      .then(res => {
        if (res.hasError) {
          return
        }
        const domainFormApi = domainFormData2Api(this.domainState.value)
        const order = { ...this.order!, ...domainFormApi, orderid: this.props.id }
        const orderOption = orderDetail2SaveOrder(order)
        this.saveOrder({ ...orderOption, toBeDeployedDomains: this.domainsToDeploy })
          .then(() => {
            // 之前的逻辑哈，感觉是为让提示框多显示一会儿，显得更自然
            setTimeout(() => {
              const { orderid, product_short_name } = order
              const certInfo = shortNameToInfo(product_short_name!)
              if (this.needConfirmation) {
                this.routerStore.push(`${basename}/confirmation/${orderid}`)
              } else if (isDVSSLType(certInfo.certType)) {
                this.routerStore.push(`${basename}/ssl/detail/${orderid}/order`)
              } else {
                this.routerStore.push(`${basename}/ssl`)
              }
            }, 1000)
          })
      })
  }

  init() {
    // type, id 变化时都需要重新拉取数据
    this.addDisposer(reaction(
      () => ({ id: this.props.id, type: this.props.type }),
      ({ id, type }) => {
        this.fetchOrder(id, type)
      },
      {
        fireImmediately: true
      }
    ))

    // 需要先拉取订单数据
    this.addDisposer(reaction(
      () => this.order && this.props.type,
      type => {
        if (type === CompleteType.First) {
          this.setDefaultCompany()
          this.setDefaultContact()
        }
      },
      {
        fireImmediately: true
      }
    ))

    this.addDisposer(reaction(
      () => this.domainState && domainFormData2Api(this.domainState.value),
      domainFormApi => {
        const order = { ...this.order!, ...domainFormApi }
        this.updateOrder(order)
      }
    ))

    this.addDisposer(reaction(
      () => this.lastCompanyFormData && companyFormData2Api(this.lastCompanyFormData),
      companyFormApi => {
        this.updateOrder({ ...this.order!, ...companyFormApi })
      }
    ))

    this.addDisposer(reaction(
      () => this.lastContactFormData && contactFormData2Api(this.lastContactFormData),
      contactFormApi => {
        this.updateOrder({ ...this.order!, ...contactFormApi })
      }
    ))
  }
}

export function getCertFormData(data: IOrderDetail): ICertFormValue {
  // 获取证书品牌、类型
  const certBaseInfo = shortNameToInfo(data.product_short_name)
  // 判断域名类型
  const domainType = data.product_type === SSLDomainType.SingleWildcard ? SSLDomainType.Wildcard : data.product_type
  // 判断实际显示的域名个数
  const normalLimit = domainType !== SSLDomainType.Wildcard ? data.limit + 1 : 0

  let wildcardLimit: number
  if (domainType === SSLDomainType.Single || domainType === SSLDomainType.Multiple) {
    wildcardLimit = 0
  } else if (domainType === SSLDomainType.Wildcard) {
    wildcardLimit = 1
  } else {
    wildcardLimit = data.wildcard_limit
  }

  const domain: ICertFormDomain = {
    type: domainType,
    min: 0,
    max: normalLimit + wildcardLimit,
    normal: normalLimit,
    wildcard: wildcardLimit
  }

  return {
    certName: certBaseInfo.brand,
    certType: certBaseInfo.certType,
    validYear: data.years,
    domain,
    autoRenew: data.auto_renew
  }
}

export function getDefaultAuthMethod(data: IOrderDetail): AuthMethodType {
  const { certType } = shortNameToInfo(data.product_short_name)
  return isDVSSLType(certType) && data.years === 2 ? AuthMethodType.DnsProxy : AuthMethodType.Dns
}

export function getDomainFormData(data: IOrderDetail): IDomainValue {
  return {
    domain: data.common_name,
    remarkName: data.cert_name,
    dnsNames: data.dns_names ? data.dns_names.split(',') : [],
    authMethod: data.auth_method || getDefaultAuthMethod(data),
    encrypt: data.encrypt as EncryptType
  }
}

export interface IDomainFormApi {
  common_name: string
  cert_name: string
  dns_names: string
  auth_method: AuthMethodType
  encrypt: string
}

export function domainFormData2Api(formData: IDomainValue): IDomainFormApi {
  return {
    common_name: formData.domain,
    cert_name: formData.remarkName,
    dns_names: formData.dnsNames.join(','),
    auth_method: formData.authMethod,
    encrypt: formData.encrypt
  }
}

export function getCompanyFormData(data: IOrderDetail): CompanyFormValue {
  return {
    name: data.org_organization_name,
    remarkName: '',
    division: data.org_division,
    country: data.org_country,
    province: data.org_region,
    city: data.org_city,
    address: data.org_addressLine1,
    postCode: data.org_postalCode,
    phone: data.org_phone,
    isDefault: false
  }
}

export interface ICompanyFormApi {
  org_organization_name: string,
  org_division: string,
  org_country: string,
  org_region: string,
  org_city: string,
  org_addressLine1: string,
  org_postalCode: string,
  org_phone: string,
}

export function companyFormData2Api(formData: CompanyFormValue): ICompanyFormApi {
  return {
    org_organization_name: formData.name,
    org_division: formData.division,
    org_country: formData.country,
    org_region: formData.province,
    org_city: formData.city,
    org_addressLine1: formData.address,
    org_postalCode: formData.postCode,
    org_phone: formData.phone
  }
}

export function getContactFormData(data: IOrderDetail): ContactFormValue {
  return {
    remarkName: '',
    lastName: data.admin_lastName,
    firstName: data.admin_firstName,
    position: data.admin_title,
    phone: data.admin_phone,
    email: data.admin_email,
    isDefault: false
  }
}

export interface IContactFormApi {
  admin_lastName: string,
  admin_firstName: string,
  admin_title: string,
  admin_phone: string,
  admin_email: string
}

export function contactFormData2Api(formData: ContactFormValue): IContactFormApi {
  return {
    admin_lastName: formData.lastName,
    admin_firstName: formData.firstName,
    admin_title: formData.position,
    admin_phone: formData.phone,
    admin_email: formData.email
  }
}

export function orderDetail2SaveOrder(order: IOrderDetail): ISaveOrderInfo {
  return {
    common_name: order.common_name,
    org_addressLine1: order.org_addressLine1,
    org_city: order.org_city,
    org_region: order.org_region,
    org_country: order.org_country,
    org_postalCode: order.org_postalCode,
    org_organization_name: order.org_organization_name,
    org_division: order.org_division,
    org_phone: order.org_phone,
    admin_firstName: order.admin_firstName,
    admin_lastName: order.admin_lastName,
    admin_phone: order.admin_phone,
    admin_email: order.admin_email,
    orderid: order.orderid,
    auth_method: order.auth_method,
    admin_title: order.admin_title,
    dns_names: order.dns_names,
    cert_name: order.cert_name,
    encrypt: order.encrypt
  }
}

export function orderDetailForCompare(order: IOrderDetail): Partial<ISaveOrderInfo> {
  const { encrypt, cert_name, auth_method, ...orderCompare } = orderDetail2SaveOrder(order)
  return orderCompare
}
