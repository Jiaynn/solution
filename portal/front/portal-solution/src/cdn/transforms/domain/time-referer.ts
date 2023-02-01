
import { Validator as FormStateValidator } from 'formstate-x'

import { checkUrlByKey, checkUrlPattern } from 'cdn/utils/domain/time-referer'

import { and, textRequired, textPattern } from 'cdn/transforms/form'

import { timeACLKeyPattern } from 'cdn/constants/domain'

import { ITimeRefererConfig } from 'cdn/components/Domain/Inputs/TimeRefererConfigInput'

import { ITimeACL } from 'cdn/apis/domain'

export const validateTimeACLKey = and<string>(
  textRequired,
  v => textPattern(timeACLKeyPattern)(v, '请输入24-40位的小写字母与数字组合')
) as FormStateValidator<string>

export const validateDuplicateTimeACLKey = (key1: string, key2: string) => {
  if (key1 === key2) {
    return '不能与主 KEY 相同'
  }
  return null
}

export const validateCheckUrl = (timeACLKeys: string[]) => and(
  textRequired,
  checkUrl => (
    checkUrlPattern(checkUrl) ? null : 'URL 格式错误'
  ),
  checkUrl => (
    (checkUrlByKey(checkUrl, timeACLKeys[0]) || checkUrlByKey(checkUrl, timeACLKeys[1])) ? null : '签名错误'
  )
) as FormStateValidator<string>

export function timeRefererConfigForSubmit(timeRefererConfig: ITimeRefererConfig): ITimeACL {
  const timeACLKeys = (
    timeRefererConfig.timeACL
    ? timeRefererConfig.timeACLKeys
    : []
  )
  return {
    enable: timeRefererConfig.timeACL,
    timeACLKeys,
    checkUrl: timeRefererConfig.checkUrl
  }
}

export function isEnabled(timeACL: ITimeACL) {
  return !!(timeACL && timeACL.enable)
}
