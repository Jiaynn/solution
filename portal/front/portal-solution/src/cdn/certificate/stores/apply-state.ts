/*
* @file component ApplyState
* @author Yao Jingtian <yncst233@gmail.com>
*/

import { observable, action, makeObservable } from 'mobx'
import { RadioChangeEvent } from 'react-icecream/lib/radio'

import { SSLApplyProps, getSSLDomainTypeFromParam } from '../components/SSLApply'
import { sslMap, SSLDomainType, DomainType, SslBrand, CertType, CertDomain, CertDomainItem } from '../constants/ssl'
import SslApis, { IOrderDetail, PeakOrderResponse } from '../apis/ssl'
import { shortNameToInfo } from '../utils/certificate'

export interface IDomainType {
  name: SSLDomainType,
  limit: CertDomainItem,
  normal: number,
  wildcard: number
}

const defaultDomainType: IDomainType = {
  name: SSLDomainType.Single,
  limit: {
    min: 0,
    max: 0,
    normal: { min: 0, max: 0 },
    wildcard: { min: 0, max: 0 }
  },
  normal: 0,
  wildcard: 0
}

type Value = {
  sslBrand: SslBrand
  sslType: CertType
  year: number
  domainType: IDomainType
}

export type DiscountsType = { [key: number]: number }

export default class ApplyState {
  @observable currentValues: Value = {
    sslBrand: SslBrand.DigiCert,
    sslType: CertType.DV,
    year: 1,
    domainType: defaultDomainType
  }

  @observable sslTypes: CertType[] = []
  @observable years: number[] = []
  @observable.ref discounts: DiscountsType = {}
  @observable domainTypes!: CertDomain
  @observable orderid = ''
  @observable certid = ''

  @observable price = {
    origin: '-',
    actual: '-',
    isOnSale: false,
    salePrice: '-'
  }

  inputChangeSt?: number

  constructor(private sslApis: SslApis) {
    makeObservable(this)
    this.setYears = this.setYears.bind(this)
    this.setDomainTypes = this.setDomainTypes.bind(this)
    this.setPrice = this.setPrice.bind(this)
    this.updatePrice = this.updatePrice.bind(this)
    this.setDefaultCert = this.setDefaultCert.bind(this)
    this.getSslTypesByBrand = this.getSslTypesByBrand.bind(this)
    this.initYearsDomainTypes = this.initYearsDomainTypes.bind(this)

    this.handleBrandChange = this.handleBrandChange.bind(this)
    this.handleBrandTypeChange = this.handleBrandTypeChange.bind(this)
    this.handleYearChange = this.handleYearChange.bind(this)
    this.handleDomainTypeChange = this.handleDomainTypeChange.bind(this)

    this.handleUp = this.handleUp.bind(this)
    this.handleDown = this.handleDown.bind(this)
    this.handleNumberChange = this.handleNumberChange.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.canInputNumberChange = this.canInputNumberChange.bind(this)
  }

  @action setYears(newYears: number[]) {
    this.years = newYears
  }

  @action setDomainTypes(newDomainTypes: any) {
    this.domainTypes = newDomainTypes
  }

  @action setOrderId(orderid: string) {
    this.orderid = orderid
  }

  @action setCertId(certid: string) {
    this.certid = certid
  }

  // 设置默认品牌以及相关选项
  @action setDefaultCert(options: Omit<SSLApplyProps, 'renew'>) {
    if (!options.shortName) {
      return
    }
    const { brand, certType } = shortNameToInfo(options.shortName)
    if (brand && certType) {
      this.currentValues.sslBrand = brand
      this.currentValues.sslType = certType
    }
    this.getSslTypesByBrand(brand || this.currentValues.sslBrand, certType)
    if (options.years) {
      this.currentValues.year = options.years
    }
    const sslDomainType = getSSLDomainTypeFromParam(options.limit!, options.wildcardLimit!)

    if (this.currentValues.domainType != null) {
      if (sslDomainType != null) {
        this.currentValues.domainType.name = sslDomainType
        if (this.domainTypes != null) {
          this.currentValues.domainType.limit = this.domainTypes[sslDomainType]!
        }
      }
      if (options.limit != null) {
        this.currentValues.domainType.normal = options.limit
      }
      if (options.wildcardLimit != null) {
        this.currentValues.domainType.wildcard = options.wildcardLimit
      }
    }

    this.updatePrice()
    if (options.certid) {
      this.setCertId(options.certid)
    }
    if (options.orderid) {
      this.setCertId(options.orderid)
    }
  }

  // 根据品牌更新其他选项
  @action getSslTypesByBrand(brand: SslBrand, certType?: CertType) {
    this.sslTypes = Object.keys(sslMap[brand])
      .filter((sslType: CertType) => sslMap[brand][sslType]!.isSelling) as CertType[]
    this.currentValues.sslType = certType || this.sslTypes[0]
    this.initYearsDomainTypes()
  }

  // 根据品牌 种类 初始化其他选项
  @action initYearsDomainTypes() {
    const brand = this.currentValues.sslBrand
    const type = this.currentValues.sslType!
    const target = sslMap[brand][type]!

    this.years = target.years
    this.discounts = (target.discounts || {}) as DiscountsType
    this.domainTypes = target.domain

    this.currentValues.year = this.years[0]
    const domainType = Object.keys(this.domainTypes)[0] as SSLDomainType
    const certDomainItem = this.domainTypes[domainType]!

    if (domainType !== SSLDomainType.MultipleWildcard) {
      this.currentValues.domainType = {
        name: domainType,
        limit: certDomainItem,
        normal: certDomainItem.normal?.min ?? 0,
        wildcard: certDomainItem.wildcard?.min ?? 0
      }
    } else {
      const normalMin = certDomainItem.normal ? Math.max(certDomainItem.normal?.min ?? 0, certDomainItem.min ?? 0) : -1
      const wildcardMin = certDomainItem.normal ? Math.max((certDomainItem.min ?? 0) - normalMin, 0) : -1
      this.currentValues.domainType = {
        name: domainType,
        limit: certDomainItem,
        normal: certDomainItem.normal ? normalMin : 0,
        wildcard: certDomainItem.wildcard ? wildcardMin : 0
      }
    }
  }

  @action handleBrandChange(e: RadioChangeEvent) {
    this.currentValues.sslBrand = e.target.value
    this.getSslTypesByBrand(e.target.value)
    this.updatePrice()
  }

  @action handleBrandTypeChange(e: RadioChangeEvent) {
    this.currentValues.sslType = e.target.value
    this.initYearsDomainTypes()
    this.updatePrice()
  }

  @action handleYearChange(year: number) {
    this.currentValues.year = year
    this.updatePrice()
  }

  @action handleDomainTypeChange(e: RadioChangeEvent) {
    const domainType = e.target.value as SSLDomainType
    const certDomain = this.domainTypes[domainType]!

    if (e.target.value !== SSLDomainType.MultipleWildcard) {
      this.currentValues.domainType = {
        name: e.target.value,
        limit: certDomain,
        normal: certDomain.normal?.min ?? 0,
        wildcard: certDomain.wildcard?.min ?? 0
      }
    } else {
      const normalMin = certDomain.normal ? Math.max(certDomain.normal?.min ?? 0, certDomain.min ?? 0) : -1
      const wildcardMin = certDomain.normal ? Math.max((certDomain.min ?? 0) - normalMin, 0) : -1
      this.currentValues.domainType = {
        name: e.target.value,
        limit: certDomain,
        normal: certDomain.normal ? normalMin : 0,
        wildcard: certDomain.wildcard ? wildcardMin : 0
      }
    }
    this.updatePrice()
  }

  // InputNumber 相关逻辑
  @action handleUp(domainType: DomainType) {
    if (this.canInputNumberChange('up', domainType)) {
      this.currentValues!.domainType![domainType]++
      this.updatePrice()
    }
  }

  @action handleDown(domainType: DomainType) {
    if (this.canInputNumberChange('down', domainType)) {
      this.currentValues!.domainType![domainType]--
      this.updatePrice()
    }
  }

  @action handleNumberChange(domainType: DomainType, value: string) {
    if (this.canInputNumberChange('change', domainType, value)) {
      if (!Number.isNaN(parseInt(value, 10))) {
        this.currentValues!.domainType![domainType] = parseInt(value, 10)
      } else {
        this.currentValues!.domainType![domainType] = this.currentValues!.domainType!.limit![domainType]!.min ?? 0
      }
      this.updatePrice()
    } else {
      this.handleBlur(domainType, '')
    }
  }

  @action handleChange(domainType: DomainType, value: string) {
    if (value !== '' && !/^[0-9]+$/.test(value)) { return }
    this.currentValues.domainType[domainType] = Number(value)
    if (this.inputChangeSt) {
      window.clearTimeout(this.inputChangeSt)
    }
    this.inputChangeSt = window.setTimeout(() => this.handleNumberChange(domainType, value), 500)
  }

  @action handleBlur(domain: DomainType, value: string) {
    if (value === '' && this.currentValues.domainType) {
      if (this.currentValues.domainType.name !== SSLDomainType.MultipleWildcard) {
        this.currentValues.domainType[domain] = this.currentValues.domainType.limit![domain]!.min!
      } else {
        let defaultMin = this.currentValues.domainType.limit.min!
        if (domain === DomainType.Normal) {
          defaultMin = Math.max(defaultMin - this.currentValues.domainType.wildcard,
            this.currentValues.domainType.limit.normal!.min!)
        } else {
          defaultMin = Math.max(defaultMin - this.currentValues.domainType.normal,
            this.currentValues.domainType.limit.wildcard!.min!)
        }
        this.currentValues.domainType[domain] = defaultMin
      }
      this.updatePrice()
    }
  }

  canInputNumberChange(direction: 'up' | 'down' | 'change', domain: DomainType, value?: string): boolean {
    const domainTypeObj = this.currentValues.domainType

    if (direction === 'up') {
      if (domainTypeObj.name !== SSLDomainType.MultipleWildcard) {
        if (!domainTypeObj.limit[domain]!.max
          || domainTypeObj[domain] < domainTypeObj.limit[domain]!.max!
        ) {
          return true
        }
      } else if (
        domainTypeObj.normal + domainTypeObj.wildcard < domainTypeObj.limit.max!
      ) {
        return true
      }
      return false
    }
    if (direction === 'down') {
      if (domainTypeObj.name !== SSLDomainType.MultipleWildcard) {
        if (domainTypeObj[domain] > domainTypeObj.limit[domain]!.min!) {
          return true
        }
      } else if (
        domainTypeObj[domain] > 0 && domainTypeObj.normal + domainTypeObj.wildcard > domainTypeObj.limit.min!
      ) {
        if (domain === DomainType.Normal) {
          if (domainTypeObj.normal > domainTypeObj.limit.normal!.min!) {
            return true
          }
        } else {
          return true
        }
      }
      return false
    }
    if (direction === 'change') {
      if (value === '') {
        return true
      }
      const count = parseInt(value!, 10)
      if (domainTypeObj.name !== SSLDomainType.MultipleWildcard) {
        if (count >= domainTypeObj.limit[domain]!.min!
          && count <= domainTypeObj.limit[domain]!.max!) {
          return true
        }
      } else {
        let sum = count
        if (domain === DomainType.Normal) {
          sum += domainTypeObj.wildcard
        } else {
          sum += domainTypeObj.normal
        }
        if (count > 0
          && sum >= domainTypeObj.limit.min!
          && sum <= domainTypeObj.limit.max!
        ) {
          if (domain === DomainType.Normal) {
            if (count >= domainTypeObj.limit.normal!.min!) {
              return true
            }
          } else {
            return true
          }
        }
      }
      return false
    }
    return false
  }

  @action setPrice(newPrice: PeakOrderResponse) {
    this.price.origin = (newPrice.prime_rmb * 100).toString()
    this.price.actual = (newPrice.rmb * 100).toString()
    this.price.isOnSale = !!newPrice.is_on_sale
    this.price.salePrice = (newPrice.sale_rmb * 100).toString()
  }

  getProduceShortName() {
    const brand = this.currentValues.sslBrand
    const type = this.currentValues.sslType

    const domainName = this.currentValues.domainType.name
    const defaultProductShortName = sslMap[brand][type]!.shortName
    const domainProductShortName = sslMap[brand][type]!.domainShortNameMap
      ? sslMap[brand][type]!.domainShortNameMap![domainName]
      : null

    return domainProductShortName || defaultProductShortName
  }

  @action resetPrice() {
    this.price.actual = '-'
    this.price.origin = '-'
    this.price.isOnSale = false
  }

  @action updatePrice() {
    this.resetPrice()
    const info = this.currentValues
    const wildcard_limit = (
      info.domainType.name === SSLDomainType.Single || info.domainType.name === SSLDomainType.Multiple
        ? info.domainType.wildcard - 1
        : info.domainType.wildcard
    )

    const prepareInfo = {
      product_short_name: this.getProduceShortName(),
      years: info.year,
      limit: info.domainType.normal - 1,
      wildcard_limit,
      product_type: info.domainType.name
    }
    this.sslApis.peekOrder(prepareInfo).then(this.setPrice)
  }

  @action updateCurrentValues(data: Pick<IOrderDetail, 'product_short_name' | 'product_type' | 'limit' | 'years' | 'wildcard_limit'>) {
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

    this.currentValues = {
      sslBrand: certBaseInfo.brand,
      sslType: certBaseInfo.certType,
      year: data.years,
      domainType: {
        name: domainType,
        limit: {
          min: 0,
          max: normalLimit + wildcardLimit
        },
        normal: normalLimit,
        wildcard: wildcardLimit
      }
    }
  }

  @action initOptionsByCurrentValues() {
    const currentBrand = this.currentValues.sslBrand
    const currentType = this.currentValues.sslType

    this.sslTypes = Object.keys(sslMap[currentBrand])
      .filter((sslType: CertType) => sslMap[currentBrand][sslType]!.isSelling) as CertType[]
    this.years = sslMap[currentBrand][currentType]!.years
    this.domainTypes = sslMap[currentBrand][currentType]!.domain

    this.updatePrice()
  }
}
