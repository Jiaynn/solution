/*
 * @file domain transform
 * @author zhuhao <zhuhao@qiniu.com>
 */

import { IOrderDetail } from '../apis/ssl'
import { ICertFormValue, ICertFormDomain } from '../components/AddDomain'
import { sslType, humanizeSSLDomainType, SSLDomainType } from '../constants/ssl'
import { shortNameToInfo } from '../utils/certificate'
import { AuthMethodType, DnsRecordType, dnsRecordTypeTextMap, standardDomainRegx, wildcardDomainRegx } from '../constants/domain'
import { getDisplayData } from '../components/common/InfoBlock'

export function getDnsNames(dnsnames: string) {
  return dnsnames ? dnsnames.split(',') : []
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
    dnsNames: getDnsNames(data.dns_names),
    domain
  }
}

export function certFormData2Display(formData: ICertFormValue) {
  const domainTexts = []
  if (formData.domain.normal > 0) {
    domainTexts.push(`*标准域名 ${formData.domain.normal} 个`)
  }
  if (formData.domain.wildcard > 0) {
    domainTexts.push(`*泛域名 ${formData.domain.wildcard} 个`)
  }
  const wildcardNames = formData.dnsNames.filter(name => wildcardDomainRegx.test(name))
  const standardNames = formData.dnsNames.filter(name => standardDomainRegx.test(name))
  const boundedDomains = []
  if (standardNames.length > 0) {
    boundedDomains.push(`*标准域名 ${standardNames.length} 个`)
  }
  if (wildcardNames.length > 0) {
    boundedDomains.push(`*泛域名 ${wildcardNames.length} 个`)
  }
  const displayMap = {
    品牌: formData.certName || '--',
    证书类型: formData.certType ? `${sslType[formData.certType].text}(${sslType[formData.certType].code})` : '--',
    域名类型: formData.domain.type ? `${humanizeSSLDomainType(formData.domain.type)}` : '--',
    现有域名额度: domainTexts.length > 0 ? domainTexts.join(',') : '--',
    已绑域名数量: boundedDomains.length > 0 ? boundedDomains.join(',') : '--',
    有效期: formData.validYear ? `${formData.validYear}年` : '--'
  }
  return getDisplayData(displayMap)
}

export function transformAuthKey(authKey: string, authMethod: AuthMethodType, recordType?: DnsRecordType): string {
  return authMethod === AuthMethodType.File
    || (authMethod === AuthMethodType.Dns && recordType === DnsRecordType.Cname)
    ? authKey
    : `_dnsauth.${authKey}`
}

export function humanizeAuthKey(authKey: string, authMethod: AuthMethodType, recordType?: DnsRecordType) {
  let key = ''
  switch (authMethod) {
    case AuthMethodType.Dns: {
      key = `${dnsRecordTypeTextMap[recordType!]}名`
      break
    }
    case AuthMethodType.File: {
      key = '验证文件路径'
      break
    }
    case AuthMethodType.DnsProxy: {
      key = 'CNAME 记录名'
      break
    }
    default: {
      throw Error('Unknown authMethod: ' + authMethod)
    }
  }
  return key + '：' + transformAuthKey(authKey, authMethod, recordType)
}
