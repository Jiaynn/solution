
import { uniq } from 'lodash'

import { trimAndFilter } from 'cdn/transforms'

import { isLocalIp } from 'cdn/utils/domain/ip-acl'

import {
  listOf, and, or,
  textBlank, textPattern, lengthMax, lengthMin
} from 'cdn/transforms/form'

import { ipACLTypeTextMap, ipACLTypes } from 'cdn/constants/domain'
import { ip as ipPattern, segment as segmentPattern } from 'cdn/constants/pattern'

import { IIpACL } from 'cdn/apis/domain'

export function humanizeIpACLType(ipACLType: string): string {
  return ipACLTypeTextMap[ipACLType] || '未知'
}

export const maxIpACLItemNum = 50

export const validateIpOrSegment = or(
  textBlank,
  textPattern(ipPattern),
  textPattern(segmentPattern)
)

export const validateLocalIp = (v: string) => (isLocalIp(v) ? '内网 IP' : null)

export const validateIpACLValues = (ipACLValuesInput: string[]) => and<string[]>(
  ipACLValues => lengthMin(1)(ipACLValues, '不可为空'),
  ipACLValues => listOf(validateIpOrSegment)(ipACLValues, '请输入正确的 IP 或网段'),
  ipACLValues => listOf(validateLocalIp)(ipACLValues, '请输入公网 IP 或网段'),
  ipACLValues => (uniq(ipACLValues).length !== ipACLValues.length ? 'IP 地址或网段重复' : null),
  ipACLValues => lengthMax(maxIpACLItemNum)(ipACLValues, `最多 ${maxIpACLItemNum} 行`)
)(trimAndFilter(ipACLValuesInput))

export function ipACLTypeToIpACLEnabled(ipACLType: string): boolean {
  return ipACLType !== ipACLTypes.empty
}

export function isEnabled(ipACL: IIpACL) {
  if (!ipACL) {
    return false
  }
  return ipACLTypeToIpACLEnabled(ipACL.ipACLType)
}

export function ipACLValueInputTips(ipACLValueNum: number): string {
  return ipACLValueNum === 0
    ? `可添加 ${maxIpACLItemNum} 条记录`
    : `还可添加 ${Math.max(maxIpACLItemNum - ipACLValueNum, 0)} 条记录`
}
