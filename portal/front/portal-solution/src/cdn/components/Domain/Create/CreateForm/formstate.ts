/**
 * @file Create Domain FormState
 * @author linchen <gakiclin@gmail.com>
 */

import { toV2 } from 'formstate-x-v3/adapter'

import { FormState, Validator } from 'formstate-x'

import { cacheConfigForm2Api } from 'cdn/transforms/domain/cache'
import { bsAuthConfigForSubmit } from 'cdn/transforms/domain/bs-auth'
import { sourceConfigForSubmit } from 'cdn/transforms/domain/source'

import AbilityConfig from 'cdn/constants/ability-config'
import { DomainType, GeoCover, IpTypes, Platform, SourceType } from 'cdn/constants/domain'
import { isOEM, oemVendor } from 'cdn/constants/env'

import * as typeInput from 'cdn/components/Domain/Inputs/TypeInput'
import * as subAccountSelectInput from 'cdn/components/Domain/Inputs/OEMSubAccountInput'
import * as panWildcardInput from 'cdn/components/Domain/Inputs/PanWildcardInput'
import * as panNameInput from 'cdn/components/Domain/Inputs/PanNameInput'
import * as panBucketInput from 'cdn/components/Domain/Inputs/PanBucketInput'
import * as nameInput from 'cdn/components/Domain/Inputs/NameInput'
import * as registerNoInput from 'cdn/components/Domain/Inputs/RegisterNoInput'
import * as geoCoverInput from 'cdn/components/Domain/Inputs/GeoCoverInput'
import * as httpsConfigInput from 'cdn/components/Domain/Inputs/HttpsConfigInput/ForCreate'
import * as platformInput from 'cdn/components/Domain/Inputs/PlatformInput'
import * as sourceConfigInput from 'cdn/components/Domain/Inputs/SourceConfigInput/ForBatch'
import * as cacheConfigInput from 'cdn/components/Domain/Inputs/CacheConfigInput'
import * as bsAuthConfigInput from 'cdn/components/Domain/Inputs/BsAuthConfigInput'
import * as ipTypesInput from 'cdn/components/Domain/Inputs/IpTypesInput'

import DomainApis, {
  ISource,
  IDomainDetail,
  ICreateDomainReq,
  ICreatePanDomainReq
} from 'cdn/apis/domain'

export function createState({
  type,
  bucket,
  platform,
  domainApis,
  panWildcard,
  geoCover,
  sourceType,
  sourceDomain,
  testURLPath,
  getDomains,
  shouldForbidBucket,
  isQiniuPrivate,
  isOverseasUser,
  abilityConfig,
  shouldForbidRegisterNo
}: {
  domainApis: DomainApis
  type?: DomainType
  bucket?: string
  panWildcard?: string
  platform?: Platform
  geoCover?: GeoCover
  sourceType?: SourceType
  sourceDomain?: string
  testURLPath?: string
  getDomains: () => IDomainDetail[]
  shouldForbidBucket: Validator<string>
  isQiniuPrivate: () => boolean
  isOverseasUser: boolean
  abilityConfig: AbilityConfig,
  shouldForbidRegisterNo: () => boolean
}) {
  const domainType = type != null ? type : DomainType.Normal
  const typeField = typeInput.createState(domainType)
  const { useStaticCacheConfig } = abilityConfig
  const defaultPlatform = platform != null
    ? platform
    : abilityConfig.domainPlatforms[0] // 使用场景的第一项作为默认值
  const cacheConfig = useStaticCacheConfig
    ? cacheConfigInput
      .createStaticCacheState(cacheConfigInput.getDefaultStaticCacheConfig())
      .disableWhen(() => typeField.value === DomainType.Pan)
    : cacheConfigInput
      .createState(cacheConfigInput.getDefaultCacheConfig())
      .disableWhen(() => typeField.value === DomainType.Pan)
  const defaultSourceType = sourceType || sourceConfigInput.getDefaultSourceType(defaultPlatform)

  const geoCoverField = geoCoverInput.createState(isOverseasUser ? GeoCover.Foreign : geoCover)

  return new FormState({
    type: typeField,
    uid: subAccountSelectInput.createState(),
    panWildcard: panWildcardInput.createState(panWildcard!).disableValidationWhen(
      () => typeField.value !== DomainType.Pan
    ),
    panNames: panNameInput.createState(['']).disableValidationWhen(
      () => typeField.value !== DomainType.Pan
    ),
    panBucket: panBucketInput.createState(bucket!, { domainApis, getDomains, modify: false }).disableValidationWhen(
      () => typeField.value !== DomainType.Pan
    ),
    names: nameInput.createState(domainApis, [''], () => typeField.value).disableValidationWhen(
      () => typeField.value !== DomainType.Normal && typeField.value !== DomainType.Wildcard
    ),
    registerNo: registerNoInput.createState().disableValidationWhen(shouldForbidRegisterNo),
    geoCover: geoCoverField,
    httpsConfig: httpsConfigInput.createState(httpsConfigInput.getDefaultHttpsConfig()),
    platform: platformInput.createState(defaultPlatform),
    ipTypes: ipTypesInput.createState(geoCoverField.value === GeoCover.Foreign ? IpTypes.IPv4 : IpTypes.IPv6),
    sourceConfig: sourceConfigInput.createState(
      domainApis,
      false,
      {
        ...sourceConfigInput.getDefaultSourceConfig(defaultSourceType),
        sourceQiniuBucket: bucket!,
        sourceDomain: sourceDomain || '',
        testURLPath: testURLPath || ''
      },
      getDomains,
      shouldForbidBucket
    ).disableValidationWhen(() => typeField.value === DomainType.Pan),
    cacheConfig: toV2(cacheConfig),
    bsAuthConfig: bsAuthConfigInput.createState(bsAuthConfigInput.getDefaultBsAuthConfig(), isQiniuPrivate)
  })
}

export function createBsAuthState(isQiniuPrivate: boolean, enable = false) {
  return bsAuthConfigInput.createState({
    ...bsAuthConfigInput.getDefaultBsAuthConfig(),
    enable
  }, () => isQiniuPrivate)
}

export type State = ReturnType<typeof createState>

export type ConfigInputType = keyof State['$']

export type Value = ICreateDomainReq

export function getValue(
  state: State,
  domainName: string,
  isQiniuPrivate: boolean,
  isSourceUrlRewriteForbidden: boolean,
  abilityConfig: AbilityConfig,
  isRegisterNoForbidden: boolean
): Value {
  const { protocol, ...https } = state.$.httpsConfig.value
  const type = state.$.type.value
  const sourceConfig = sourceConfigInput.getValue(state.$.sourceConfig)
  const source: ISource = sourceConfigForSubmit(sourceConfig, type, protocol, domainName, isSourceUrlRewriteForbidden)

  const cacheConfig = cacheConfigForm2Api(
    state.$.cacheConfig.value,
    abilityConfig.useStaticCacheConfig
  )
  const bsAuthConfig = bsAuthConfigForSubmit(bsAuthConfigInput.getValue(state.$.bsAuthConfig), isQiniuPrivate)
  const platform = state.$.platform.value

  const options = {
    name: domainName,
    type,
    geoCover: state.$.geoCover.value,
    qiniuPrivate: isQiniuPrivate,
    platform,
    protocol,
    source,
    https,
    uid: isOEM ? (state.$.uid.value || oemVendor) : undefined,
    registerNo: isRegisterNoForbidden ? undefined : state.$.registerNo.value,
    ipTypes: state.$.ipTypes.value,
    cache: cacheConfig
  }

  if (platform !== Platform.Dynamic) {
    return {
      ...options,
      bsauth: bsAuthConfig
    }
  }

  return options
}

export function getPanDomainValue(state: State): ICreatePanDomainReq {
  return {
    pareDomain: state.$.panWildcard.value,
    bucket: state.$.panBucket.value
  }
}
