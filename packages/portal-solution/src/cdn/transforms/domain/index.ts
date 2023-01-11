/*
 * @file domain-relative transforms
 * @author nighca <nighca@live.cn>
 */

import { cloneDeep } from 'lodash'
import moment from 'moment'
import { zones } from 'portal-base/kodo/bucket'
import { ICertSearchByDomain } from 'portal-base/fusion'
import { ICertInfo } from 'portal-base/certificate'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { IamPermissionStore } from 'portal-base/user/iam'

import { and, textRequired, textPattern, numberMin, numberMax, lengthMin } from 'cdn/transforms/form'

import { unknown as unknownMsg } from 'cdn/locales/messages'

import IamInfo from 'cdn/constants/iam-info'
import { isOEM, isQiniu, oemConfig } from 'cdn/constants/env'
import {
  DomainType,
  domainTypeTextMap,
  geoCoverTextMap,
  protocolTextMap,
  certInputTypeTextMap,
  platformTextMap,
  sourceURLSchemeTextMap,
  sourceTypeOptionTextMap,
  SourceType,
  CacheType,
  cacheTypeTextMap,
  CacheControlType,
  cacheControlTypeTextMap,
  cacheControlTimeunitTextMap,
  defaultCacheControl,
  defaultCacheControlForPlatformWeb,
  cacheControlForM3u8NoCache,
  recommendedCacheControlsMap,
  slimTypeTextMap,
  Platform,
  cacheControlTimeunits,
  operatingStateTextMap,
  operationTypeTextMap,
  Protocol,
  OperatingState,
  OperationType,
  domainSuffixesShouldBeRecycled,
  FreezeType,
  ResponseHeaderControlOp,
  responseHeaderControlOpTextMap,
  ResponseHeaderControlKey,
  responseHeaderControlKeyTextMap,
  IpTypes,
  ipTypesTextMap,
  SourceURLScheme,
  CertInputType
} from 'cdn/constants/domain'

import { IBucketSimplified } from 'cdn/apis/bucket'
import { ICacheControl, IDomain, IDomainDetail } from 'cdn/apis/domain'

export function humanizeType(type: string) {
  return domainTypeTextMap[type as DomainType] || unknownMsg
}

export function humanizeGeoCover(geoCover: string) {
  return geoCoverTextMap[geoCover] || unknownMsg
}

export function humanizeProtocol(protocol: Protocol) {
  return protocolTextMap[protocol] || '未知'
}

export function humanizeCertInputType(inputType: CertInputType) {
  return certInputTypeTextMap[inputType] || '未知'
}

export function humanizePlatform(platform: Platform) {
  return platformTextMap[platform] || unknownMsg
}

export function humanizeSourceURLScheme(sourceURLScheme: string) {
  return sourceURLSchemeTextMap[sourceURLScheme as SourceURLScheme] || '未知'
}

export function humanizeSourceTypeAsOption(sourceType: string) {
  return sourceTypeOptionTextMap[sourceType as SourceType] || '未知'
}

export function shouldForbidSourceTypeAndPlatform(sourceType: SourceType, platform: Platform) {
  if (platform === Platform.Dynamic && sourceType === SourceType.QiniuBucket) {
    return '动态加速不支持七牛云存储'
  }
  if (platform === Platform.Dynamic && sourceType === SourceType.Advanced) {
    return '动态加速不支持源站高级设置'
  }
  return null
}

// 是否应该禁用 “泛子域名” 类型
export function shouldForbidTypePan(sourceType: string, hasBucket: boolean): string | undefined {
  if (sourceType !== SourceType.QiniuBucket) {
    return `源站类型为 ${humanizeSourceTypeAsOption(SourceType.QiniuBucket)} 才能使用泛子域名`
  }
  if (!hasBucket) {
    return '没有可用 bucket'
  }
}

export function joinMessages(...messages: string[]): string {
  return messages.filter(msg => !!msg).join('，')
}

// 判断是否是二级域名
export function isSecondLevelDomain(domain: string) {
  const splitDomain = domain.split('.')

  if (splitDomain.length === 2) {
    return true
  }

  if (splitDomain.length === 3
    && (domain.endsWith('com.cn')
      || domain.endsWith('net.cn')
      || domain.endsWith('org.cn')
      || domain.endsWith('gov.cn'))) {
    return true
  }

  return false
}

// 判断 bucket 是否可被用于指定的域名类型
export function shouldForbidBucketUsedByDomain(
  bucket: IBucketSimplified,
  domainType: string,
  panWildcardPrivate?: boolean,
  hasIcp?: boolean,
  isOverseasUser?: boolean
) {

  if (isOverseasUser && !isBucketOversea(bucket.zone)) {
    return '海外用户只能选择海外的 Bucket'
  }

  if (hasIcp === false) {
    return isBucketOversea(bucket.zone) ? undefined : '未备案域名不支持国内的 Bucket'
  }

  if (domainType === DomainType.Normal) {
    return bucket.share ? '不支持共享空间' : undefined
  }
  if (domainType === DomainType.Wildcard || domainType === DomainType.Pan) {
    // FIXME: 替换成 humanizeType
    const domainTypeText = domainTypeTextMap[domainType as DomainType] || '未知'
    if (bucket.share) {
      return `${domainTypeText}不支持共享空间`
    }
  }

  if (domainType === DomainType.Pan && panWildcardPrivate != null) {
    return !!bucket.private !== panWildcardPrivate ? '泛子域名与对应泛域名空间公私有需保持一致' : undefined
  }
}

// 判断 bucket 是否是海外 bucket
export function isBucketOversea(bucketZone: string): boolean {
  return (
    bucketZone === zones.na0
    || bucketZone === zones.as0
    || bucketZone === zones.apNortheast1
    || bucketZone === zones.apSoutheast2
  )
}

// 根据 cache controls 信息，推断当前的 cache type
export function cacheControlsToCacheType(cacheControls: ICacheControl[]): CacheType {
  if (cacheControls && cacheControls.length === 1) {
    const cacheControl = cacheControls[0]
    if (cacheControl.type === CacheControlType.Follow) {
      return CacheType.Follow
    }
  }
  return CacheType.Customize
}

export function humanizeCacheType(cacheType: CacheType) {
  return cacheTypeTextMap[cacheType] || '未知'
}

export function humanizeCacheControlType(cacheControlType: CacheControlType) {
  return cacheControlTypeTextMap[cacheControlType] || '未知'
}

export function isM3u8CacheControl(cacheControl: ICacheControl): boolean {
  return cacheControl.type === CacheControlType.Suffix && cacheControl.rule === '.m3u8'
}

export function getRecommendedCacheControls(platform: Platform, isQiniuPrivate: boolean) {
  const recommendedCacheControls = cloneDeep(
    recommendedCacheControlsMap[platform as keyof typeof recommendedCacheControlsMap] || []
  )
  if (!isQiniuPrivate) {
    return recommendedCacheControls
  }
  // 对于七牛私有 bucket，推荐配置中的 m3u8 后缀项替换为 no cache 的版本
  return recommendedCacheControls.map(
    cacheControl => (
      isM3u8CacheControl(cacheControl)
      ? cacheControlForM3u8NoCache
      : cacheControl
    )
  )
}

export function getDefaultCacheControlForTypeCustomize(platform: Platform) {
  return cloneDeep(
    platform === Platform.Web
    ? defaultCacheControlForPlatformWeb
    : defaultCacheControl
  )
}

export function humanizeCacheControlTimeunit(cacheControlTimeunit: number) {
  return cacheControlTimeunitTextMap[cacheControlTimeunit] || '未知'
}

export function getMaxCacheControlTime(cacheControlTimeunit: number): number {
  switch (cacheControlTimeunit) {
    case cacheControlTimeunits.second:
      return 365 * 24 * 60 * 60
    case cacheControlTimeunits.minute:
      return 365 * 24 * 60
    case cacheControlTimeunits.hour:
      return 365 * 24
    case cacheControlTimeunits.day:
      return 365
    case cacheControlTimeunits.week:
      return 51
    case cacheControlTimeunits.month:
      return 12
    case cacheControlTimeunits.year:
      return 1
    default:
      return 0
  }
}

// 全局配置没有 rule
export function cacheControlHasRule(cacheControl: ICacheControl): boolean {
  return cacheControl.type !== CacheControlType.All
}

// 未指定类型的规则项不允许修改
export function shouldDisableCacheControlEdit(cacheControl: ICacheControl): boolean {
  return cacheControl.type === CacheControlType.Unknown
}

export const pathPattern = /^(?:\/[\w\d-]+)+(?:;(?:\/[\w\d-]+)+)*$/
export const suffixPattern = /^\.[a-zA-Z\d]+(?:;\.[a-zA-Z\d]+)*$/
const maxLength = 10

export function validateCacheControlRule(cacheControlRule: string, cacheControlType: CacheControlType) {
  const cacheTypeText = humanizeCacheControlType(cacheControlType)
  const requiredErrorText = `${cacheTypeText}是必填项`
  const patternErrorText = `请正确填写${cacheTypeText}`
  const maxLengthErrorText = `超过数量限制，单条规则仅限 ${maxLength} 个${cacheTypeText}`

  switch (cacheControlType) {
    case CacheControlType.Path:
      return and<string>(
        rule => textRequired(rule, requiredErrorText),
        rule => textPattern(pathPattern)(rule, patternErrorText),
        rule => (rule.split(';').length > maxLength ? maxLengthErrorText : null)
      )(cacheControlRule)
    case CacheControlType.Suffix:
      return and<string>(
        rule => textRequired(rule, requiredErrorText),
        rule => textPattern(suffixPattern)(rule, patternErrorText),
        rule => (rule.split(';').length > maxLength ? maxLengthErrorText : null)
      )(cacheControlRule)
    default:
      return null
  }
}

export function validateCacheControlTime(
  cacheControlTime: number,
  cacheControlTimeunit: number,
  cacheControlType: string
) {
  if (
    cacheControlType === CacheControlType.Follow
    || cacheControlType === CacheControlType.Unknown
  ) {
    return null
  }

  const maxTime = getMaxCacheControlTime(cacheControlTimeunit)
  const cacheControlTimeunitText = humanizeCacheControlTimeunit(cacheControlTimeunit)
  return and<number>(
    v => numberMin(0)(v, '缓存时间不可为负'),
    v => numberMax(maxTime)(v, `缓存时间最长为 ${maxTime} ${cacheControlTimeunitText}`)
  )(cacheControlTime)
}

export const validateCustomizeCacheControl = and<ICacheControl>(
  v => validateCacheControlRule(v.rule!, v.type),
  v => validateCacheControlTime(v.time!, v.timeunit!, v.type)
)

export function validateStaticCacheControlTime(
  cacheControlTime: number,
  cacheControlTimeunit: number
) {
  const maxTime = getMaxCacheControlTime(cacheControlTimeunit)
  const cacheControlTimeunitText = humanizeCacheControlTimeunit(cacheControlTimeunit)
  return and<number>(
    v => numberMin(1)(v, '缓存时间需要大于 0'),
    v => numberMax(maxTime)(v, `缓存时间最长为 ${maxTime} ${cacheControlTimeunitText}`)
  )(cacheControlTime)
}

export const validateStaticCacheControl = and<ICacheControl>(
  v => validateCacheControlRule(v.rule!, v.type),
  v => validateStaticCacheControlTime(v.time!, v.timeunit!)
)

export const validateStaticCacheControls = and<ICacheControl[]>(
  v => lengthMin(1)(v, '不可为空')
)

export function tipForCacheControlTime(cacheControlTime: number) {
  if (cacheControlTime !== 0) {
    return null
  }

  return '缓存时间为 0 的即是不缓存该类型资源，所有访问都将回到您的源站，会对您的源站造成较大的压力。'
}

export function humanizeSlimType(slimType: number): string {
  return slimTypeTextMap[slimType] || '未知'
}

const noIcpFrozenMsg = {
  cn: '未备案冻结',
  en: 'No icp frozen'
}

export function humanizeOperatingState(state: string, freezeType?: FreezeType) {
  // 没有找到备案信息域名冻结
  if (isNotIcpFrozen(state, freezeType)) {
    return noIcpFrozenMsg
  }
  return operatingStateTextMap[state as keyof typeof operatingStateTextMap] || { cn: state, en: state }
}

export function isNotIcpFrozen(state: string, freezeType?: FreezeType) {
  return state === OperatingState.Frozen && freezeType === FreezeType.NotIcp
}

// FIXME: 因为 humanizeOperationType 使用比较广泛，暂时不对所有涉及的页面进行改造所以临时加了该函数，
// 后续其他页面进行改造之后去掉该函数
export function humanizeOperationTypeMessage(operationType: string) {
  return operationTypeTextMap[operationType as keyof typeof operationTypeTextMap] || {
    cn: `${operationType}操作`,
    en: `${operationType} operation`
  }
}

export function humanizeOperationType(operationType: string) {
  return humanizeOperationTypeMessage(operationType).cn
}

const toggleTypeMsgs = {
  online: {
    cn: '启用',
    en: 'Enable'
  },
  offline: {
    cn: '停用',
    en: 'Disable'
  }
}

export function humanizeToggleType(type: 'online' | 'offline') {
  switch (type) {
    case 'online':
      return toggleTypeMsgs.online
    case 'offline':
      return toggleTypeMsgs.offline
    default:
      throw new Error('unknown toggle type:' + type)
  }
}

export function shouldForbidModifyAccessControl(domain: IDomainDetail, certInfo?: ICertInfo) {
  return shouldForbidConfigurationWithCertExpired(domain, certInfo)
}

export function shouldForbidModifyIpTypes(domain: IDomainDetail, certInfo?: ICertInfo) {
  return shouldForbidConfigurationWithCertExpired(domain, certInfo)
}

export function shouldForbidModifyGeoCover(domain: IDomainDetail, userInfo: UserInfo, certInfo?: ICertInfo) {
  if (userInfo.isOverseasUser) {
    return '海外用户不允许修改覆盖区域'
  }
  return shouldForbidConfigurationWithCertExpired(domain, certInfo)
}

/** 域名公用的操作限制判断，比如批量操作、单域名上下线、域名配置修改等 */
export function shouldForbidOperation(domain: IDomain) {
  if (!domain) {
    return '域名不存在'
  }

  if (domain.operatingState === OperatingState.Processing) {
    return `${humanizeOperationType(domain.operationType)}处理中`
  }
}

/** 判断修改域名配置限制 */
export function shouldForbidConfiguration(domain: IDomain, okWithFailure = false) {
  const forbidOperationText = shouldForbidOperation(domain)
  if (forbidOperationText) {
    return forbidOperationText
  }

  if (!okWithFailure && domain.operatingState === OperatingState.Failed) {
    return `${humanizeOperationType(domain.operationType)}处理失败，请创建工单联系我们`
  }
  if (domain.operatingState === OperatingState.Offlined) {
    return '域名已被停用'
  }
  if (domain.operatingState === OperatingState.Frozen) {
    return '域名已被冻结'
  }
  if (!domain.couldOperateBySelf) {
    return '该域名暂时不支持自助修改配置，请创建工单联系我们进行人工修改'
  }
}

/** 判断修改域名配置限制(除了修改 HTTPS 配置以外) */
export function shouldForbidConfigurationWithCertExpired(domain: IDomainDetail, certInfo?: ICertInfo) {
  const forbidConfigurationText = shouldForbidConfiguration(domain)
  if (forbidConfigurationText) {
    return forbidConfigurationText
  }
  return shouldForbidByCertExpired(domain, certInfo)
}

export function shouldForbidModifySource(domain: IDomainDetail, certInfo?: ICertInfo) {
  if (domain.type === DomainType.Test) {
    return '测试域名不支持修改配置'
  }

  return shouldForbidConfigurationWithCertExpired(domain, certInfo)
}

export function shouldForbidModifyCache(domain: IDomainDetail, isBucketMissing: boolean, certInfo?: ICertInfo) {
  if (isBucketMissing) {
    return '源站空间不存在'
  }
  return shouldForbidConfigurationWithCertExpired(domain, certInfo)
}

export function shouldForbidModifyHttpHeader(domain: IDomainDetail, certInfo?: ICertInfo) {
  return shouldForbidConfigurationWithCertExpired(domain, certInfo)
}

export function shouldForbidImageOptimization(domain: IDomainDetail, isBucketMissing: boolean, certInfo?: ICertInfo) {
  if (isBucketMissing) {
    return '源站空间不存在'
  }
  return shouldForbidConfigurationWithCertExpired(domain, certInfo)
}

export function shouldForbidUnsslize(domain: IDomain, userInfo: UserInfo, certInfo: ICertInfo) {
  if (domain.type === DomainType.Test) {
    return '测试域名没有 HTTPS 配置'
  }

  if (domain.protocol === Protocol.Http) {
    return '当前域名协议是 HTTP'
  }

  if (isOEM && domain.oemMail !== userInfo.email) {
    return 'OEM 账号只能降级自己账号下域名的 HTTPS'
  }

  const forbidByOemSubAccount = shouldForbidOEMSubAccountOperation(userInfo)
  if (forbidByOemSubAccount) {
    return forbidByOemSubAccount
  }

  const forbidConfig = shouldForbidConfiguration(domain)
  if (forbidConfig) {
    return forbidConfig
  }

  if (!isCertExpired(certInfo)) {
    return '证书未过期，不能降级 HTTPS'
  }
}

export function shouldForbidSslize(domain: IDomain, userInfo: UserInfo) {
  if (domain.protocol === Protocol.Https) {
    return '已经是 HTTPS 协议'
  }

  if (domain.type === DomainType.Test) {
    return '测试域名不允许配置 HTTPS'
  }

  if (isOEM && domain.oemMail !== userInfo.email) {
    return 'OEM 账号只能修改自己帐户下域名的 HTTPS 配置'
  }

  const forbidByOemSubAccount = shouldForbidOEMSubAccountOperation(userInfo)
  if (forbidByOemSubAccount) {
    return forbidByOemSubAccount
  }

  return shouldForbidConfiguration(domain)
}

export function shouldForbidModifyHttpsCert(domain: IDomainDetail) {
  if (domain.protocol !== Protocol.Https) {
    return '域名不是 HTTPS 协议'
  }
  const shouldForbidIfNoFailure = shouldForbidConfiguration(domain, true)
  if (shouldForbidIfNoFailure) {
    return shouldForbidIfNoFailure
  }
  // 如果操作状态为失败，且操作为修改证书，则可以继续修改证书
  if (
    domain.operatingState === OperatingState.Failed
    && domain.operationType === OperationType.ModifyHttpsCert
  ) {
    return
  }
  return shouldForbidConfiguration(domain)
}

export function isCreateFailed(domain: IDomain) {
  return (
    domain.operationType === OperationType.CreateDomain
    && domain.operatingState === OperatingState.Failed
  )
}

/** 判断 OEM 子帐号限制操作域名 */
export function shouldForbidOEMSubAccountOperation(userInfo: UserInfo) {
  if (isOEM && oemConfig.hideSubAccountDomainOperations && userInfo.parent_uid !== 0) {
    return '该 OEM 子帐号不允许操作'
  }
}

export function shouldForbidRemove(domain: IDomain) {
  if (
    domain.operatingState === OperatingState.Offlined
    || domain.operatingState === OperatingState.Frozen
  ) {
    return
  }
  if (isCreateFailed(domain)) {
    return
  }
  return '当前状态不可执行删除操作'
}

export function shouldForbidEnable(domain: IDomain) {
  if (domain.operatingState !== OperatingState.Offlined) {
    return '仅已停用的域名才能启用'
  }
  if (isCreateFailed(domain)) {
    return '域名创建失败'
  }
}

export function shouldForbidUnfreeze(domain: IDomain) {
  if (!isNotIcpFrozen(domain.operatingState, domain.freezeType)) {
    return '非未备案冻结'
  }
}

export function shouldForbidDisable(domain: IDomain) {
  const forbidOperationText = shouldForbidOperation(domain)
  if (forbidOperationText) {
    return forbidOperationText
  }

  if (domain.operatingState === OperatingState.Offlined) {
    return '仅已启用的域名才能停用'
  }
  if (isCreateFailed(domain)) {
    return '域名创建失败'
  }
  if (domain.operatingState === OperatingState.Frozen) {
    return '域名已被冻结'
  }
  if (domain.operatingState === OperatingState.Failed) {
    return '域名状态为失败'
  }
  if (domain.type === DomainType.Test) {
    return '测试域名不能停用'
  }
}

export function getNameForWildcardDomain(domainName?: string): string | null {
  return domainName ? '.' + domainName : null
}

export function shouldRecycle(domainName: string) {
  return domainSuffixesShouldBeRecycled.some(
    suffix => {
      suffix = '.' + suffix
      return domainName.slice(-suffix.length) === suffix
    }
  )
}

// 回收剩余时间的展示信息
export function humanizeRecycleLeftDays(leftDays: number): string {
  if (leftDays == null || leftDays < 0) {
    return '无'
  }
  return (
    leftDays > 0
    ? `${leftDays} 天`
    : '回收中'
  )
}

export function getProgressStatus(ratio: number, operatingState: string) {
  if (operatingState === OperatingState.Failed) {
    return '免费证书发布失败'
  }
  if (ratio <= 0.2) {
    return '域名检测中'
  }
  if (ratio <= 0.4) {
    return '免费证书申请中'
  }
  return '免费证书配置中'
}

export function getSupportDesc(ratio: number, operatingState: string) {
  if (operatingState === OperatingState.Failed) {
    return '免费证书发布失败'
  }
  if (ratio <= 0.2) {
    return '长时间处于域名检测环节'
  }
  if (ratio <= 0.4) {
    return '长时间处于免费证书申请环节'
  }
  return '长时间处于域名发布环节'
}

// TODO 放到 portal-base 下
export function convertCertInfoToCertSearchInfo(info: ICertInfo): ICertSearchByDomain {
  return {
    id: info.certid,
    cert_name: info.name,
    name: info.name,
    dnsnames: info.dnsnames,
    not_after: moment.unix(info.not_after).toISOString(),
    not_before: moment.unix(info.not_before).toISOString()
  }
}

export function isCertExpired(certInfo?: ICertInfo) {
  return !!certInfo && Date.now() > certInfo.not_after * 1000
}

// CDN 控制台，域名证书过期的情况下，客户可以修改对应域名的任何配置，但由于对应证书已过期，导致域名发布失败，一直卡顿。
export function shouldForbidByCertExpired(domain: IDomainDetail, certInfo?: ICertInfo) {
  if (domain.protocol === Protocol.Https && isCertExpired(certInfo)
  ) {
    return '证书已经过期，请修改 HTTPS 配置'
  }
}

export function forbidByCertExpiredAndForceHttps(domain: IDomainDetail, certInfo?: ICertInfo) {
  const shouldForbidIfCertExpired = shouldForbidByCertExpired(domain, certInfo)
  if (shouldForbidIfCertExpired && domain.https.forceHttps) {
    return true
  }
  return null
}

export function humanizeResponseHeaderControlOp(key: ResponseHeaderControlOp): string {
  return responseHeaderControlOpTextMap[key]
}

export function humanizeResponseHeaderControlKey(key: ResponseHeaderControlKey) {
  return responseHeaderControlKeyTextMap[key]
}

export function shouldForbidDomainTags(
  userInfo: UserInfo, iamPermissionStore: IamPermissionStore, iamInfo: IamInfo
) {
  if (isOEM && userInfo.isOem) {
    return 'OEM 子账号不支持域名标签功能'
  }
  if (isQiniu && userInfo.isIamUser && iamPermissionStore.shouldSingleDeny({
    product: iamInfo.iamService,
    actionName: iamInfo.iamActions.GetDomainTag
  })) {
    return 'IAM 账号没有域名标签功能的权限'
  }

  return null
}

export function humanizeIpTypes(ipTypes: IpTypes) {
  return ipTypesTextMap[ipTypes] || '未知'
}

export function shouldForbidCreateDomain(userInfo: UserInfo) {
  if (isOEM && oemConfig.hideCreateDomain) {
    return 'OEM 系统没有开启创建域名功能'
  }

  if (isOEM && userInfo.parent_uid !== 0 && oemConfig.hideSubAccountCreateDomain) {
    return 'OEM 子账号未开启创建域名的权限'
  }

  return null
}
