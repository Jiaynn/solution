/*
* @file Data InformationState
* @author Yao Jingtian <yncst233@gmail.com>
*/

import { observable, action, makeObservable } from 'mobx'

import { DnsRecordType } from '../constants/domain'
import { provinceData } from '../constants/province-city'
import { IOrderDetail } from '../apis/ssl'

export type Company = {
  name: string
  department: string
  landlinePhone: string
  area: {
    country: number
    province: number | string
    city: string
  }
  address: string
  zipCode: string
}

export type NewDomain = {
  commonName: string
  dnsNames: string[]
  memoName: string
  authMethod: string
  encrypt: string
  recordType?: DnsRecordType
}

export default class InformationState {
  // 补全的域名信息
  @observable.shallow newDomains: NewDomain = {
    commonName: '',
    dnsNames: [], // 域名（通用名称）
    memoName: '',    // 备注名
    authMethod: '', // TrustAsia证书 校验方式
    recordType: undefined, // authMethod 为 DNS 时的记录类型
    encrypt: '' // PRO类型和TrustAsia证书 加密方式
  }

  // 公司信息
  @observable company: Company = {
    name: '',
    department: '',
    landlinePhone: '',
    area: {
      country: -1,
      province: -1,
      city: ''
    },
    address: '',
    zipCode: ''
  }
  // 联系人（授权代表）信息
  @observable delegate = {
    name: {
      lastName: '', // 姓氏
      firstName: ''
    },
    position: '',
    telephone: '',
    email: ''
  }

  constructor() {
    makeObservable(this)
    this.updateCompanyContact = this.updateCompanyContact.bind(this)
  }

  @action updateCompanyContact(data: IOrderDetail) {
    if (!data.org_country) {
      data.org_country = 'CN'
    }
    const provinceId = data.org_country === 'CN' && data.org_region !== ''
                      ? provinceData.filter(province => province.pv === data.org_region)[0].pk
                      : data.org_region
    this.company = {
      name: data.org_organization_name,
      department: data.org_division,
      landlinePhone: data.org_phone,
      area: {
        country: data.org_country === 'CN' ? 1 : 2,
        province: provinceId,
        city: data.org_city
      },
      address: data.org_addressLine1,
      zipCode: data.org_postalCode
    }
    this.delegate = {
      name: {
        lastName: data.admin_lastName,
        firstName: data.admin_firstName
      },
      position: data.admin_title,
      telephone: data.admin_phone,
      email: data.admin_email
    }
  }

  @action updateNewDomains(data: IOrderDetail) {
    this.newDomains = {
      commonName: data.common_name,
      dnsNames: !data.dns_names
        ? []
        : data.dns_names.split(',').filter(
          domain => domain !== this.newDomains.commonName
        ),
      memoName: data.cert_name,
      authMethod: data.auth_method,
      recordType: data.record_type,
      encrypt: data.encrypt
    }
  }
}
