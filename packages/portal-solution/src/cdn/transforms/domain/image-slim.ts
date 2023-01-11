import { and, textNotBlank, textPattern } from 'cdn/transforms/form'

import { cachePathPattern, slimTypes } from 'cdn/constants/domain'

import { IImageSlimConfig } from 'cdn/components/Domain/Inputs/ImageSlimConfigInput'

export const validatePrefixImageSlims = (slimType: number) => (prefixImageSlims: string) => (
  slimType === slimTypes.prefix
  ? and(
    textNotBlank,
    textPattern(cachePathPattern)
  )(prefixImageSlims)
  : null
)

export const validateRegexpImageSlims = (slimType: number) => (regexpImageSlims: string) => (
  slimType === slimTypes.regexp
  ? textNotBlank(regexpImageSlims)
  : null
)

export function deriveSlimTypeFromValue(config: IImageSlimConfig) {
  if (config.slimType != null) {
    return config.slimType
  }
  if (config.prefixImageSlims) {
    return slimTypes.prefix
  }
  if (config.regexpImageSlims) {
    return slimTypes.regexp
  }
  return slimTypes.defaults
}

export const imageSlimSep = ';'

export function splitImageSlims(imageSlims: string): string[] {
  return (
    imageSlims
    ? imageSlims.split(imageSlimSep).filter(
      item => !!item
    )
    : []
  )
}

export function joinImageSlims(imageSlims: string[]): string {
  return (
    imageSlims
    ? imageSlims.join(imageSlimSep)
    : ''
  )
}
