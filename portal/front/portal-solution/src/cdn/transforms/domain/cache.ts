
import { cloneDeep } from 'lodash'

import { trimAndFilter } from 'cdn/transforms'

import { lengthMin } from 'cdn/transforms/form'

import { defaultCacheControl, CacheControlType } from 'cdn/constants/domain'
import { ignoreParamsTypes, ignoreParamsTypeTextMap } from 'cdn/constants/domain/cache'

import { ICacheConfig } from 'cdn/components/Domain/Inputs/CacheConfigInput'

import { ICache } from 'cdn/apis/domain'

export function humanizeIgnoreParamsType(ignoreParamsType: string) {
  return ignoreParamsTypeTextMap[ignoreParamsType] || '未知'
}

export function getIgnoreParamsEnabled(cacheConfig: ICache) {
  return (
    cacheConfig.ignoreParam
    || (cacheConfig.ignoreParams && cacheConfig.ignoreParams.length > 0)
  )
}

export function getIgnoreParamsType(cacheConfig: ICache) {
  const hasIgnoreParams = cacheConfig.ignoreParams && cacheConfig.ignoreParams.length > 0
  return (
    !cacheConfig.ignoreParam && hasIgnoreParams
    ? ignoreParamsTypes.customize
    : ignoreParamsTypes.all
  )
}

export function getIgnoreParamsTypeText(cacheConfig: ICache) {
  return humanizeIgnoreParamsType(getIgnoreParamsType(cacheConfig))
}

export function getDefaultCacheConfig(): ICacheConfig {
  return {
    enabled: true,
    cacheControls: [cloneDeep(defaultCacheControl)],
    ignoreParamsEnabled: false,
    ignoreParamsType: 'all',
    ignoreParams: []
  }
}

export function getDefaultStaticCacheConfig(): ICacheConfig {
  return {
    enabled: false,
    cacheControls: [],
    ignoreParamsEnabled: false,
    ignoreParamsType: 'all',
    ignoreParams: []
  }
}

export function getPlaceHolder(cacheControlType: CacheControlType) {
  switch (cacheControlType) {
    case CacheControlType.Path:
      return '/a;/b/c;/d/e/f'
    case CacheControlType.Suffix:
      return '.jpg;.png;.zip'
    default:
      return ''
  }
}

export function cacheConfigForm2Api(cacheConfig: ICacheConfig, useStaticCacheConfig: boolean): ICache {
  if (useStaticCacheConfig && !cacheConfig.enabled) {
    return {
      cacheControls: [],
      ignoreParam: false,
      ignoreParams: []
    }
  }

  return {
    cacheControls: cacheConfig.cacheControls,
    ignoreParam: cacheConfig.ignoreParamsEnabled && cacheConfig.ignoreParamsType === ignoreParamsTypes.all,
    ignoreParams: (
      cacheConfig.ignoreParamsEnabled && cacheConfig.ignoreParamsType === ignoreParamsTypes.customize
      ? trimAndFilter(cacheConfig.ignoreParams)
      : []
    )
  }
}

export function cacheConfigApi2Form(cacheConfig: ICache): ICacheConfig {
  const cacheControls = cacheConfig.cacheControls || []
  return {
    enabled: cacheControls.length > 0,
    cacheControls,
    ignoreParamsEnabled: getIgnoreParamsEnabled(cacheConfig),
    ignoreParamsType: getIgnoreParamsType(cacheConfig),
    ignoreParams: cacheConfig.ignoreParams || []
  }
}

export function validateIgnoreParams(ignoreParams: string[]) {
  return lengthMin(1)(trimAndFilter(ignoreParams), '不可为空')
}

// export function validateCacheConfig(cacheConfig: ICacheConfig) {
//   return mapOf<ICacheConfig>({
//     cacheControls: listOf(validateCustomizeCacheControl),
//     ignoreParams: (
//       cacheConfig.ignoreParamsEnabled && cacheConfig.ignoreParamsType === ignoreParamsTypes.customize
//       ? validateIgnoreParams
//       : null
//     )
//   })(cacheConfig)
// }
