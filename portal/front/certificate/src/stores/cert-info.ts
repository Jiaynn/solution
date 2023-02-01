import { observable, action, makeObservable } from 'mobx'
import { ICertInfo } from 'portal-base/certificate'

import { shortNameToInfo } from '../utils/certificate'
import { CertType, ProductShortName, SSLDomainType } from '../constants/ssl'

export default class CertInfo {
  constructor() {
    makeObservable(this)
    this.updateCertData = this.updateCertData.bind(this)
  }

  @observable memoName!: string
  @observable brand!: string
  @observable sslType!: CertType
  @observable domainType!: SSLDomainType
  @observable normalLimit!: number
  @observable wildcardLimit!: number
  @observable notAfter!: number
  @observable notBefore!: number
  @observable commonName!: string
  @observable dnsNames!: string[]
  @observable orderid!: string
  @observable encrypt!: string
  @observable enabled!: boolean
  @observable certid!: string
  @observable create_time!: number

  @action updateCertData(data: ICertInfo) {
    // 获取证书品牌、类型
    const certBaseInfo = shortNameToInfo(data.product_short_name as ProductShortName)
    // 判断域名类型
    const domainType = data.product_type === 'single_wildcard' ? 'wildcard' : data.product_type

    this.memoName = data.name
    this.brand = certBaseInfo.brand
    this.sslType = certBaseInfo.certType
    this.domainType = domainType as SSLDomainType
    this.normalLimit = -1
    this.wildcardLimit = -1
    this.notAfter = data.not_after
    this.notBefore = data.not_before
    this.commonName = data.common_name
    this.dnsNames = data.dnsnames ? data.dnsnames : []
    this.orderid = data.orderid
    this.encrypt = data.encrypt
    this.enabled = data.enable
    this.certid = data.certid
    this.create_time = data.create_time
  }
}
