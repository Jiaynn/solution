/*
 * @file component certificate utils
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import { sortBy, last, without, uniq, values } from 'lodash'

import { OrderType } from '../../apis/ssl'
import {
  sslMap, canBeClosedStatuses, SSLDomainType, CertType,
  OrderStatus, ProductShortName, SslBrand, isDVSSLType
} from '../../constants/ssl'
import { isOEM } from '../../constants/env'
import { isStatusDone, isStatusPending } from './status'

interface ICertBrandInfo {
  brand: SslBrand
  certType: CertType
}

// 根据 productShortName 获取证书品牌、类型
export function shortNameToInfo(productShortName?: ProductShortName): ICertBrandInfo {
  let brand: SslBrand
  let certType: CertType
  Object.keys(sslMap).some((sslBrand: SslBrand) => Object.keys(sslMap[sslBrand]).some((sslType: CertType) => {
    if (sslMap[sslBrand][sslType]!.shortName === productShortName) {
      brand = sslBrand
      certType = sslType
      return true
    }
    if (productShortName && sslMap[sslBrand][sslType]!.domainShortNameMap) {
      const names = values(sslMap[sslBrand][sslType]!.domainShortNameMap)
      if (names.indexOf(productShortName) > -1) {
        brand = sslBrand
        certType = sslType
        return true
      }
    }
    return false
  }))
  return {
    brand: brand!,
    certType: certType!
  }
}

export function getLatestDnsNames(replaceOrders: any[], dnsNames?: string[]): string[] {
  if (!replaceOrders || replaceOrders.length === 0) {
    return dnsNames || []
  }
  const list = sortBy(replaceOrders, 'create_time')
    .filter(order => order.state === 1)
  if (list.length > 0) {
    return last(list).dnsnames.split(',')
  }
  return dnsNames || []
}

export function hasRepeatItem(arr: any[], compareArr?: any[]) {
  if (arr && compareArr) {
    return without(arr.slice(), ...compareArr.slice()).length !== arr.length
  }
  return uniq(arr.slice()).length !== arr.length
}

/**
 * 从后端接口字段 renewable 来判断
 * 历史前端逻辑：已签发/已重颁发 过期前 30 天的非重颁发订单，显示【续费】(若 notAfter <= 0，则根据 providerRenewable 字段)
 */
export function canRenew(renewable: boolean) {
  return isOEM ? false : renewable
}

interface ICanAddDomainParams {
  notAfter: number,
  state: number,
  productType: SSLDomainType,
  orderType: OrderType
}

// 已签发/已重颁发 非重颁发 未过期的多域名、多域名泛域名订单，显示【添加域名】
export function canAddDomain(params: ICanAddDomainParams) {
  const { notAfter, state, productType, orderType } = params
  const now = Date.now()
  if (!state || !isStatusDone(state)) {
    return false
  }
  if ([SSLDomainType.Multiple, SSLDomainType.MultipleWildcard].indexOf(productType) === -1) {
    return false
  }
  if (orderType === OrderType.Replace) {
    return false
  }
  if (!notAfter) {
    return false
  }
  return (
    notAfter <= 0
    || now < notAfter * 1000
  )
}

interface ICanUploadConfirmationParams {
  state: number,
  productShortName: ProductShortName,
  uploadConfirmLetter: boolean
}

// 非 DV 且待确认状态才显示【上传确认函】
export function canUploadConfirmation(params: ICanUploadConfirmationParams) {
  const { state, productShortName, uploadConfirmLetter } = params
  if (!state || !isStatusPending(state)) {
    return false
  }

  const sslInfo = shortNameToInfo(productShortName)

  return !uploadConfirmLetter && !isDVSSLType(sslInfo.certType)
}

export function canClose(state: number): boolean {
  return canBeClosedStatuses.indexOf(state) !== -1
}

// 过期 7 天前的证书都能够部署
export function canCertDeploy(notAfter: number): boolean {
  return !isOEM && ((notAfter - 7 * 24 * 3600) > (Date.now() / 1000))
}

// 判断证书类型是否为私有证书
export function isPrivateCert(productShortName: ProductShortName) {
  return !productShortName
}

// 已经完成的订单，并且满足证书部署条件的订单能够部署
export function canOrderDeploy(notAfter: number, state: OrderStatus): boolean {
  return isStatusDone(state) && canCertDeploy(notAfter)
}

// 2 年的续期证书需要补充文案
export function getCertYearTipsByYear(year: number): string {
  return year === 2 ? '续期证书' : ''
}

// 自动续期的证书、订单需要补充文案
export function getCertYearTipsByAutoRenew(autoRenew: boolean): string {
  return autoRenew ? '续期证书' : ''
}
