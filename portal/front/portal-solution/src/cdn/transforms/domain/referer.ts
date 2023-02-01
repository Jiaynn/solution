
import { uniq } from 'lodash'

import { trimAndFilter, splitLines } from 'cdn/transforms'

import {
  listOf, and, or, not,
  textBlank, textPattern, lengthMax, notSameWith, lengthMin
} from 'cdn/transforms/form'

import { refererTypeTextMap, refererTypes, maxRefererItemNum } from 'cdn/constants/domain'
import { referer as refererPattern } from 'cdn/constants/pattern'

import { IReferer } from 'cdn/apis/domain'

export function humanizeRefererType(refererType: string): string {
  return refererTypeTextMap[refererType] || '未知'
}

export function splitRefererValue(refererValue: string): string[] {
  if (!refererValue) {
    return []
  }
  return trimAndFilter(splitLines(refererValue))
}

export const includeCapitalLetterPattern = /([A-Z])+/

export const matchReferer = or(
  textBlank,
  textPattern(refererPattern)
)

export const notLocalhost = and(
  notSameWith('localhost'),
  notSameWith('127.0.0.1')
)

export const noCapitalLetter = not(textPattern(includeCapitalLetterPattern))

export const validateRefererValues = (refererValuesInput: string[]) => and<string[]>(
  refererValues => lengthMin(1)(refererValues, '不可为空'),
  refererValues => listOf(matchReferer)(refererValues, '请正确填写域名'),
  refererValues => listOf(noCapitalLetter)(refererValues, '域名中包含大写英文，请输入小写英文字符'),
  refererValues => listOf(notLocalhost)(refererValues, '防盗链暂不能设置 `localhost` 和 `127.0.0.1`'),
  refererValues => lengthMax(maxRefererItemNum)(refererValues, `防盗链个数最多 ${maxRefererItemNum} 个`),
  refererValues => (uniq(refererValues).length !== refererValues.length ? '不能重复' : null)
)(trimAndFilter(refererValuesInput))

export function refererEnabledToRefererType(refererEnabled: boolean, defaultRefererType: string): string {
  return refererEnabled ? defaultRefererType : refererTypes.empty
}

export function refererTypeToRefererEnabled(refererType: string): boolean {
  return refererType !== refererTypes.empty
}

export function isEnabled(referer: IReferer) {
  if (!referer) {
    return false
  }
  return refererTypeToRefererEnabled(referer.refererType)
}
