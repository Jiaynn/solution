/**
 * @file domain functions for transform
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import psl from 'psl'
import sha from 'sha.js'
import { InjectFunc } from 'qn-fe-core/di'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import { KodoIamStore } from 'kodo/stores/iam'
import { ConfigStore } from 'kodo/stores/config'
import { ICDNDomain } from 'kodo/stores/domain'

import {
  CDNDomainBucketType, CDNDomainOperationType, CDNDomainStatus, CDNDomainType, CDNDomainTypeTextMap, countryTextMap,
  DomainFreezeType, DomainType
} from 'kodo/constants/domain'

import { ICDNDomainInfo } from 'kodo/apis/domain'

/**
 * 生成域名校验信息
 * TODO：目前的 token 是使用用户输入的域名生成的，可能包含端口信息，后面可以考虑根据根域名生成，需要后端支持
 * @param domain 要绑定/解绑的域名
 */
export function generateOwnerVerificationData(domain: string) {
  const rootDomain = psl.get(domain) || domain
  if (!rootDomain) { return { rootDomain: null, token: null, host: null } }
  const token = sha('sha1').update(domain.toLowerCase()).digest('hex')
  const host = token ? token + '.' + rootDomain : null
  return { rootDomain, token, host }
}

export function isFrozeDomain(freezeTypes: DomainFreezeType[] | undefined): boolean {
  return Array.isArray(freezeTypes) && freezeTypes.length > 0
}

export function isICPExpiredDomain(freezeTypes: DomainFreezeType[]): boolean {
  return isFrozeDomain(freezeTypes) && freezeTypes.includes(DomainFreezeType.ICPExpired)
}

export function isViolationDomain(freezeTypes: DomainFreezeType[]): boolean {
  return isFrozeDomain(freezeTypes) && freezeTypes.includes(DomainFreezeType.Violation)
}

/**
 * 判断域名类型是否为 源站域名
 * @param domainType 域名类型
 */
export function isDomainType(domainType: DomainType[] | undefined, target: DomainType) {
  return !!domainType && domainType.includes(target)
}

/**
 * 判断解绑域名的操作是否被禁止
 * - 当域名未冻结时，不禁止解绑操作
 * - 当域名冻结类型仅为 `ICP 备案过期` 时，不禁止解绑域名
 * - 当域名冻结类型包含其它类型时，禁止解绑域名
 * @param freezeTypes 域名冻结类型
 */
export function isForbiddenOfUnbindingDomain(freezeTypes?: DomainFreezeType[]): boolean {
  if (freezeTypes && isFrozeDomain(freezeTypes)) {
    return freezeTypes.length === 1 ? !isICPExpiredDomain(freezeTypes) : true
  }

  return false
}

export function humanizeCDNDomainCountry(domainInfo: ICDNDomain) {
  if (
    domainInfo.operatingState === CDNDomainStatus.Processing
    && domainInfo.operationType === CDNDomainOperationType.CreateDomain
  ) {
    return '创建域名中，请稍后查看'
  }

  return countryTextMap[domainInfo.geoCover]
}

export function humanizeCDNDomainType(type: CDNDomainType) {
  return type ? CDNDomainTypeTextMap[type] : '七牛域名'
}

export function getCDNDomainBucketType(domain: ICDNDomainInfo) {
  switch (domain.type) {
    case CDNDomainType.Test:
      if (/qbox.me$/.test(domain.name)) {
        return CDNDomainBucketType.KodoHttps
      }
      if (/qnssl.com$/.test(domain.name)) {
        return CDNDomainBucketType.FusionHttps
      }
      if (/pili.qiniucdn.com$/.test(domain.name)) {
        return CDNDomainBucketType.PiliTest
      }
      if (/bkt.clouddn.com$/.test(domain.name)) {
        return CDNDomainBucketType.KodoBktTest
      }
      return CDNDomainBucketType.KodoTest
    case CDNDomainType.Pan:
      if (/qbox.me$/.test(domain.name)) {
        return CDNDomainBucketType.KodoHttps
      }
      if (/qnssl.com$/.test(domain.name)) {
        return CDNDomainBucketType.FusionHttps
      }
      return CDNDomainBucketType.PanCustomer
    case CDNDomainType.Wildcard:
      return CDNDomainBucketType.WildcardCustomer
    default:
      return CDNDomainBucketType.FusionCustomer
  }
}

export function getCDNDomainPrompt(domain: ICDNDomain): string | null {
  const { domainBucketType } = domain
  if (domainBucketType === CDNDomainBucketType.KodoHttps) {
    return (
      '*.qbox.me 域名是传统 HTTPS 托管，支持 xp ie7 Android2.3以下访问，但是速度较慢，建议你创建 SNI 托管的 qnssl HTTPS 域名。覆盖范围：'
      + humanizeCDNDomainCountry(domain)
    )
  }

  if (domainBucketType === CDNDomainBucketType.FusionHttps) {
    return '七牛提供的 SNI 托管的 HTTPS 域名。覆盖范围：' + humanizeCDNDomainCountry(domain)
  }

  if (domainBucketType === CDNDomainBucketType.FusionCustomer) {
    return null
  }

  if (domainBucketType === CDNDomainBucketType.WildcardCustomer) {
    return '可任意指定前缀进行访问；可基于该泛域名创建多个泛子域名来指定不同源站'
  }

  if (domainBucketType === CDNDomainBucketType.PanCustomer) {
    return '此域名为泛子域名，是基于泛域名创建的子域名，配置继承于泛域名。覆盖范围：' + humanizeCDNDomainCountry(domain)
  }

  return null
}

export function getCDNDomainFailedDesc(operationType: string, operatingStateDesc: string): string {
  switch (operationType) {
    case CDNDomainOperationType.CreateDomain:
      if (operatingStateDesc === 'domain have no icp') {
        return '您使用的加速域名未备案，请使用已备案域名重新创建'
      }
      if (operatingStateDesc === 'conflict platform') {
        return '场景冲突'
      }
      if (operatingStateDesc === 'user got conflict domain') {
        return '您使用的加速域名已在第三方 CDN 设置过，请创建工单获取帮助'
      }
      return '创建域名失败'
    case CDNDomainOperationType.DeleteDomain:
      return '删除域名失败'
    case CDNDomainOperationType.ModifySource:
      return '修改域名失败'
    case CDNDomainOperationType.ModifyReferer:
      return '防盗链修改失败'
    case CDNDomainOperationType.ModifyBsauth:
      return '回源鉴权修改失败'
    case CDNDomainOperationType.Switch:
      if (operatingStateDesc === 'domain have no icp') {
        return '您使用的加速域名未备案，请使用已备案域名重新创建'
      }
      if (operatingStateDesc === 'conflict platform') {
        return '场景冲突'
      }
      if (operatingStateDesc === 'user got conflict domain') {
        return '您使用的加速域名已在第三方 CDN 设置过，请创建工单获取帮助'
      }
      return '修改访问控制失败'
    case CDNDomainOperationType.ModifyCache:
      return '修改缓存配置失败'
    case CDNDomainOperationType.Record:
      return '域名录入失败'
    case CDNDomainOperationType.ModifyHttpsCrt:
      if (operatingStateDesc === 'verify https crt fail') {
        return 'HTTPS 证书有误'
      }
      return '修改 HTTPS 证书失败'
    case CDNDomainOperationType.ModifyTimeAcl:
      return '修改时间戳防盗链失败'
    default:
      return '内部错误'
  }
}

export function getCDNDomainProcessingDesc(operationType: string) {
  const suffixWord = '，期间缓存配置、修改源站、防盗链、删除域名等操作域名功能不可用'
  let time = ' 3 小时'
  switch (operationType) {
    case CDNDomainOperationType.CreateDomain:
      return '创建域名处理中，最久需要' + time + suffixWord
    case CDNDomainOperationType.DeleteDomain:
      return '删除域名处理中，最久需要' + time + suffixWord
    case CDNDomainOperationType.ModifySource:
      return '修改源站处理中，最久需要' + time + suffixWord
    case CDNDomainOperationType.ModifyReferer:
      return '防盗链处理中，最久需要' + time + suffixWord
    case CDNDomainOperationType.ModifyBsauth:
      return '回源鉴权处理中，最久需要' + time + suffixWord
    case CDNDomainOperationType.OfflineBsauth:
      return '下线回源鉴权处理中，最久需要' + time + suffixWord
    case CDNDomainOperationType.ModifyCache:
      return '缓存配置修改中，最久需要' + time + suffixWord
    case CDNDomainOperationType.Record:
      return '域名录入中，最久需要' + time + suffixWord
    case CDNDomainOperationType.ModifyHttpsCrt:
      return '修改 HTTPS 证书中，最久需要' + time + suffixWord
    case CDNDomainOperationType.ModifyTimeAcl:
      return '修改时间戳防盗链中，最久需要' + time + suffixWord
    case CDNDomainOperationType.Sslize:
      return '域名升级 HTTPS 处理中，最久需要' + time + suffixWord
    case CDNDomainOperationType.ModifyHttpsConf:
      return '修改 HTTPS 配置中，最久需要' + time + suffixWord
    default:
      time = ' 12 小时'
      return '内部处理中，最久需要' + time + suffixWord
  }
}

export function getCDNDomainStateDesc(domainInfo: ICDNDomain, CNAMED: boolean) {
  const { operationType, operatingState, type, operatingStateDesc } = domainInfo
  switch (operatingState) {
    case CDNDomainStatus.Offlined:
      return '该域名已停用，点击域名到域名详情页面启用'
    case CDNDomainStatus.Frozen:
      return '该域名已冻结，点击域名到域名详情页面启用'
    case CDNDomainStatus.Failed:
      return getCDNDomainFailedDesc(operationType, operatingStateDesc)
    case CDNDomainStatus.Processing:
      return getCDNDomainProcessingDesc(operationType)
    default:
      if (CNAMED) {
        return '发布成功'
      }
      if (type === CDNDomainType.Wildcard || (!CNAMED && type === CDNDomainType.Pan)) {
        return '发布成功，可点击右边的图标配置'
      }
      if (!CNAMED && type === CDNDomainType.Normal) {
        return '请点击右边的图标配置'
      }
  }
}

// 检查 Domain 模块是否启用
export function isDomainEnabled(inject: InjectFunc, region: string) {
  if (region == null) {
    return false
  }

  const configStore = inject(ConfigStore)
  const featureStore = inject(FeatureConfigStore)

  const globalConfig = configStore.getFull()
  const regionConfig = configStore.getRegion({ region })

  const isSourceDomainEnable = (
    regionConfig.objectStorage.domain!.enable
    && !featureStore.isDisabled('KODO.KODO_SOURCE_DOMAIN')
  )

  const isCDNDomainEnable = (
    globalConfig.fusion.domain.enable
    && !featureStore.isDisabled('KODO.KODO_DOMAIN_SETTING')
  )

  if (!isSourceDomainEnable && !isCDNDomainEnable) {
    return false
  }

  return true
}

// 检查 Domain 模块是否可用（启用+权限）
export function isDomainAvailable(inject: InjectFunc, region: string) {
  const iamStore = inject(KodoIamStore)
  return isDomainEnabled(inject, region) && !iamStore.isIamUser
}
