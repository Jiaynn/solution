
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { FeatureConfigStore as FeatureConfig } from 'portal-base/user/feature-config'

import { splitLines, trimAndFilter } from 'cdn/transforms'

import { assertUnreachable } from 'cdn/utils'

import { SourceType, SourceURLScheme, Protocol, SourceIgnoreParamsType, sourceIgnoreParamsTypeTextMap, Platform,
  sourceHostConfigOptionTextMap, SourceHostConfigType, sourceHostConfigTextMap, DomainType, sourceUrlRewriteFeatureConfigKey } from 'cdn/constants/domain'

import { ISourceConfig, ISourceHost, getDefaultSourceHost } from 'cdn/components/Domain/Inputs/SourceConfigInput'
import { IAdvancedSource as IAdvancedSourceForForm } from 'cdn/components/Domain/Inputs/AdvancedSourcesInput'
import { IValue as ISourceIgnoreParamsConfigForForm } from 'cdn/components/Domain/Inputs/SourceIgnoreParamsConfigInput'

import { ISource, IAdvancedSource as IAdvancedSourceForSubmit, IDomainDetail } from 'cdn/apis/domain'

export function advancedSourceForSubmit(forForm: IAdvancedSourceForForm): IAdvancedSourceForSubmit {
  const host = forForm.host.trim()
  const port = forForm.port.trim()
  return {
    addr: port ? `${host}:${port}` : host,
    weight: forForm.weight,
    backup: forForm.backup
  }
}

export function advancedSourceForForm(forSubmit: IAdvancedSourceForSubmit): IAdvancedSourceForForm {
  const [host, port] = forSubmit.addr.split(':')
  return {
    host,
    port: port || '',
    weight: forSubmit.weight,
    backup: forSubmit.backup
  }
}

export interface ISourceIgnoreParamsConfigForApi {
  sourceIgnoreAllParams: boolean
  sourceIgnoreParams: string[]
}

export function sourceIgnoreParamsConfigForm2Api(
  value: ISourceIgnoreParamsConfigForForm
): ISourceIgnoreParamsConfigForApi {
  const { enabled, type, params } = value
  return {
    sourceIgnoreAllParams: enabled && type === SourceIgnoreParamsType.All,
    sourceIgnoreParams: enabled && type === SourceIgnoreParamsType.Customize ? splitLines(params) : []
  }
}

export function sourceIgnoreParamsConfigApi2Form(
  config: ISourceIgnoreParamsConfigForApi
): ISourceIgnoreParamsConfigForForm {
  const { sourceIgnoreAllParams: ignoreAllParams, sourceIgnoreParams: ignoreParams } = config
  const hasIgnoreParams = ignoreParams && ignoreParams.length > 0
  const enabled = ignoreAllParams || hasIgnoreParams
  const type = (
    !ignoreAllParams && hasIgnoreParams
    ? SourceIgnoreParamsType.Customize
    : SourceIgnoreParamsType.All
  )
  return {
    enabled,
    type,
    params: (ignoreParams || []).join('\n')
  }
}

export function sourceConfigForSubmit(
  sourceConfig: ISourceConfig,
  type: DomainType,
  protocol: string,
  domainName: string,
  isSourceUrlRewriteForbidden: boolean
): ISource {
  const advancedSources = (
    sourceConfig.sourceType === SourceType.Advanced
    ? sourceConfig.advancedSources.map(advancedSourceForSubmit)
    : []
  )
  const sourceIPs = (
    sourceConfig.sourceType === SourceType.Ip
    ? trimAndFilter(sourceConfig.sourceIPs)
    : []
  )
  const sourceQiniuBucket = (
    sourceConfig.sourceType === SourceType.QiniuBucket
    ? sourceConfig.sourceQiniuBucket
    : null
  )
  const sourceDomain = (
    sourceConfig.sourceType === SourceType.Domain
    ? sourceConfig.sourceDomain.trim()
    : null
  )
  const sourceHost = (
    sourceConfig.sourceType !== SourceType.QiniuBucket
    ? sourceHostForm2Api({ ...sourceConfig.sourceHost, domainValue: domainName })
    : null
  )

  const testSourceHost = testSourceHostForm2Api(sourceConfig, type)

  const sourceURLScheme = (
    protocol === Protocol.Http || sourceConfig.sourceType === SourceType.QiniuBucket
    ? SourceURLScheme.Follow
    : sourceConfig.sourceURLScheme
  )

  const {
    sourceIgnoreParams,
    sourceIgnoreAllParams
  } = sourceIgnoreParamsConfigForm2Api(sourceConfig.sourceIgnoreParamsConfig)

  const config = {
    sourceType: sourceConfig.sourceType,
    sourceHost,
    sourceURLScheme,
    sourceQiniuBucket,
    sourceDomain,
    sourceIPs,
    advancedSources,
    testSourceHost,
    testURLPath: sourceConfig.testURLPath,
    sourceIgnoreAllParams,
    sourceIgnoreParams
  }

  // 当前只有部分用户有权限修改 URL 改写规则。所以对于修改源站的接口：
  // 如果请求数据里面有 urlRewrites 字段，则使用前端传递的数据，否则使用 db 默认的数据。
  return isSourceUrlRewriteForbidden
    ? config as ISource
    : { ...config, urlRewrites: sourceConfig.urlRewrites } as ISource
}

export function isSourcePrivateBucket(
  sourceInfo: { sourceType: string, sourceQiniuBucket: string },
  isBucketPrivate: (name: string) => boolean
) {
  return (
    sourceInfo.sourceType === SourceType.QiniuBucket
    && isBucketPrivate(sourceInfo.sourceQiniuBucket)
  )
}

export function getConfirmMessageForSourceConfigChange(
  domain: IDomainDetail,
  sourceConfig: ISourceConfig,
  isBucketPrivate: (name: string) => boolean
) {
  if (
    domain.source.sourceType !== SourceType.QiniuBucket
    || sourceConfig.sourceType !== SourceType.QiniuBucket
    || domain.source.sourceQiniuBucket === sourceConfig.sourceQiniuBucket
  ) {
    return null
  }

  const isPrevPrivate = isSourcePrivateBucket(domain.source, isBucketPrivate)
  const isNextPrivate = isSourcePrivateBucket(sourceConfig, isBucketPrivate)

  // 排除公私未变更的情况
  if (isPrevPrivate === isNextPrivate) {
    return null
  }

  const bsAuthEnabled = domain.bsauth && domain.bsauth.enable
  if (bsAuthEnabled) {
    return '你正在修改源站，此次操作会影响回源鉴权，建议操作完成后对应地修改回源鉴权配置，是否要继续操作？'
  }

  // 公 -> 私
  if (!isPrevPrivate && isNextPrivate) {
    return '你正在修改源站为七牛私有空间，建议操作完成后打开回源鉴权，是否要继续操作？'
  }
}

export function humanizeSourceIgnoreParamsType(type: string) {
  return sourceIgnoreParamsTypeTextMap[type as keyof typeof sourceIgnoreParamsTypeTextMap] || '未知'
}

export function shouldForbidSourceTypeByOEM(isOEM: boolean, sourceType: string) {
  if (isOEM && sourceType === SourceType.QiniuBucket) {
    return 'OEM 环境不支持 qiniu bucket 的源站类型'
  }
  return null
}

export function shouldForbidSourceUrlRewrite(
  domain: IDomainDetail,
  isOEM: boolean,
  userInfo: UserInfo,
  featureConfig: FeatureConfig
) {
  if (domain.platform === Platform.Dynamic) {
    return '动态加速的域名不支持回源改写'
  }

  if (isOEM) {
    return 'OEM 环境不支持回源改写'
  }

  if (userInfo.isIamUser) {
    return 'Iam 用户不支持回源改写'
  }

  if (featureConfig.isDisabled(sourceUrlRewriteFeatureConfigKey)) {
    return '当前用户不支持回源改写'
  }

  return null
}

export function humanizeSourceHostConfigOptionTextMap(sourceHostConfigType: SourceHostConfigType, sourceType: string) {
  if (sourceHostConfigType === SourceHostConfigType.Source) {
    return sourceHostConfigTextMap[sourceType as keyof typeof sourceHostConfigTextMap]
  }
  return sourceHostConfigOptionTextMap[sourceHostConfigType]
}

export function shouldProvideTestSourceHost(sourceHost: ISourceHost, sourceType: SourceType, type: DomainType) {
  if (type === DomainType.Wildcard
    && sourceType !== SourceType.QiniuBucket
    && sourceHost.type === SourceHostConfigType.Domain) {
    return '域名类型为泛域名且源站类型不等于七牛云存储、回源 HOST 为加速域名的时候需要测试回源 HOST'
  }

  return null
}

export function testSourceHostForm2Api(sourceConfig: ISourceConfig, type: DomainType) {
  return shouldProvideTestSourceHost(sourceConfig.sourceHost, sourceConfig.sourceType, type)
    ? sourceConfig.testSourceHost
    : null
}

export function sourceHostForm2Api(sourceHost: ISourceHost): string {
  switch (sourceHost.type) {
    case SourceHostConfigType.Domain:
      return getTrimValue(sourceHost.domainValue, '')
    case SourceHostConfigType.Source:
      return getTrimValue(sourceHost.sourceValue, '')
    case SourceHostConfigType.Custom:
      return getTrimValue(sourceHost.customValue, '')
    default: {
      assertUnreachable(sourceHost.type)
    }
  }
}

export function sourceHostApi2Form(sourceHostName: string, sourceDomain: string, domainName: string): ISourceHost {
  const sourceHost = getDefaultSourceHost()

  // 回源 host 为加速域名
  if (!sourceHostName || sourceHostName === domainName) {
    sourceHost.type = SourceHostConfigType.Domain
    sourceHost.domainValue = domainName
    return sourceHost
  }

  // 回源 host 为源站站域名
  if (sourceHostName === sourceDomain) {
    sourceHost.type = SourceHostConfigType.Source
    sourceHost.sourceValue = sourceDomain
    return sourceHost
  }

  // 回源 host 为自定义
  sourceHost.type = SourceHostConfigType.Custom
  sourceHost.customValue = sourceHostName
  return sourceHost
}

export function getTrimValue(value: string, defaultValue: string) {
  return value ? value.trim() : defaultValue
}
