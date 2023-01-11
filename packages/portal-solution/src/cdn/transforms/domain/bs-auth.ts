
import { trimAndFilter } from 'cdn/transforms'

import {
  and, listOf, textRequired, textPattern,
  lengthMax, numberMin, numberMax, textNotBlank
} from 'cdn/transforms/form'
import { urlWithDomainOrIpHost as validateUrl } from 'cdn/transforms/validators'

import {
  parameterPattern, maxParametersNum,
  minTimeLimitInSecond, maxTimeLimitInSecond, defaultTimeLimit
} from 'cdn/constants/domain/bs-auth'
import { bsAuthMethods, userAuthReqObjectKeyOfTypes } from 'cdn/constants/domain'

import { IBsAuthConfig, IReqConfObject } from 'cdn/components/Domain/Inputs/BsAuthConfigInput'

import { IBsAuth } from 'cdn/apis/domain'

export function getDefaultBsAuthConfig(): IBsAuthConfig {
  return {
    enable: false,
    userAuthUrl: '',
    method: bsAuthMethods.head,
    parameters: [],
    successStatusCode: 200,
    failureStatusCode: 401,
    timeLimitText: null!,
    timeLimit: defaultTimeLimit,
    strict: false,
    userAuthContentType: '',
    userBsauthResultCacheConf: {
      cacheEnable: false,
      cacheDuration: 240
    },
    userAuthReqConf: {
      header: [],
      urlquery: [],
      body: []
    },
    backSourceWithResourcePath: false
  }
}

export const validateUserAuthUrl = and(
  textRequired,
  validateUrl
)

export const validateParameters = (parametersInput: string[]) => and<string[]>(
  v => lengthMax(maxParametersNum)(v, `不能超过 ${maxParametersNum} 条`),
  v => listOf(textPattern(parameterPattern))(v, '格式不正确')
)(trimAndFilter(parametersInput))

export const validateStatusCode = (v: number) => and(
  numberMin(100),
  numberMax(999)
)(v, '格式不正确')

export const validateSuccessStatusCode = validateStatusCode
export const validateFailureStatusCode = (successStatusCode: number) => and(
  validateStatusCode,
  v => (v !== successStatusCode ? null : '鉴权成功返回状态码与鉴权失败返回状态码相同')
)

export function timeLimitToTimeLimitText(timeLimit: number): string {
  return timeLimit / 1000 + ''
}

export function timeLimitTextToTimeLimit(timeLimitText: string): number {
  return parseFloat(timeLimitText) * 1000
}

export const validateTimeLimit = (v: number) => and(
  numberMin(minTimeLimitInSecond * 1000),
  numberMax(maxTimeLimitInSecond * 1000)
)(v, `最小 ${minTimeLimitInSecond}s，最大 ${maxTimeLimitInSecond}s`)

export const validateReqConfObjectKey = textNotBlank
export const validateReqConfObjectType = textNotBlank
export const validateReqConfObjectValue = (type: string) => (value: string) => {
  if (type !== userAuthReqObjectKeyOfTypes.custom) {
    return null
  }
  return textNotBlank(value)
}

// FIXME
export const validateReqConfListForSameKey = (reqConfObjectList: IReqConfObject[]) => {
  const results: string[] = []
  const keyList = reqConfObjectList ? reqConfObjectList.map(it => it.key) : []
  keyList.forEach((value, index, list) => {
    const targetIndex = list.indexOf(value, index + 1)
    if (targetIndex > -1) {
      (results[targetIndex] as any) = {
        ...results[targetIndex] as any,
        key: '不能相同'
      }
    }
  })
  return results[0]
}

export function bsAuthConfigForSubmit(bsAuthConfig: IBsAuthConfig, isQiniuPrivate: boolean): IBsAuth {
  if (!bsAuthConfig.enable) {
    return { enable: false }
  }
  if (isQiniuPrivate) {
    return { enable: bsAuthConfig.enable, isQiniuPrivate }
  }
  // eslint-disable-next-line
  const { parameters, timeLimitText, ...others } = bsAuthConfig
  return {
    ...others,
    parameters: trimAndFilter(parameters),
    isQiniuPrivate
  }
}

export function bsAuthConfigForForm(bsAuth: IBsAuth = { enable: false }): IBsAuthConfig {
  // eslint-disable-next-line
  const { isQiniuPrivate, ...others } = bsAuth
  return {
    ...getDefaultBsAuthConfig(),
    ...others,
    timeLimitText: timeLimitToTimeLimitText(others.timeLimit!)
  }
}

export function isEnabled(bsAuth: IBsAuth) {
  return !!(bsAuth && bsAuth.enable)
}
