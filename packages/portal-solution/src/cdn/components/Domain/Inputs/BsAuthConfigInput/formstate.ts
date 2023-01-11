/**
 * @file BsAuthConfigInput formstate
 * @author linchen <gakiclin@gmail.com>
 */

import { FormState, FieldState } from 'formstate-x'

import { ArrayFormState } from 'cdn/utils/form/formstate-x'

import {
  validateReqConfObjectKey,
  validateReqConfObjectType,
  validateReqConfObjectValue,
  validateReqConfListForSameKey,
  validateTimeLimit,
  validateFailureStatusCode,
  validateSuccessStatusCode,
  validateParameters,
  validateUserAuthUrl
} from 'cdn/transforms/domain/bs-auth'

import { IReqConfObject, IUserBsauthResultCacheConf, IBsAuthConfig } from '.'

export type State = FormState<{
  enable: FieldState<boolean>
  userAuthUrl: FieldState<string>
  method: FieldState<string>
  parameters: FieldState<string[]>
  successStatusCode: FieldState<number>
  failureStatusCode: FieldState<number>
  timeLimitText: FieldState<string>
  timeLimit: FieldState<number>
  strict: FieldState<boolean>
  path: FieldState<string[]>
  userAuthContentType: FieldState<string>
  userAuthReqConf: FormState<{
    header: ArrayFormState<UserAuthReqConfState, IReqConfObject>
    urlquery: ArrayFormState<UserAuthReqConfState, IReqConfObject>
    body: ArrayFormState<UserAuthReqConfState, IReqConfObject>
  }>
  userBsauthResultCacheConf: FieldState<IUserBsauthResultCacheConf>
  backSourceWithResourcePath: FieldState<boolean>
}>

export type Value = IBsAuthConfig

export function createState(conf: IBsAuthConfig, isQiniuPrivate: () => boolean): State {
  const enable = new FieldState(conf.enable)

  const successStatusCode = new FieldState(conf.successStatusCode).validators(
    validateSuccessStatusCode
  )

  const userAuthReqConf = new FormState({
    header: createUserAuthReqConfListState(conf.userAuthReqConf.header || []),
    body: createUserAuthReqConfListState(conf.userAuthReqConf.body || []),
    urlquery: createUserAuthReqConfListState(conf.userAuthReqConf.urlquery || [])
  })

  return new FormState({
    enable,
    userAuthUrl: new FieldState(conf.userAuthUrl).validators(validateUserAuthUrl),
    method: new FieldState(conf.method),
    parameters: new FieldState(conf.parameters).validators(validateParameters),
    successStatusCode,
    failureStatusCode: new FieldState(conf.failureStatusCode).validators(
      v => validateFailureStatusCode(successStatusCode.value)(v)
    ),
    timeLimitText: new FieldState(conf.timeLimitText),
    timeLimit: new FieldState(conf.timeLimit).validators(validateTimeLimit),
    strict: new FieldState(conf.strict),
    path: new FieldState(conf.path || []),
    userAuthReqConf,
    userAuthContentType: new FieldState(conf.userAuthContentType),
    userBsauthResultCacheConf: new FieldState(conf.userBsauthResultCacheConf),
    backSourceWithResourcePath: new FieldState(conf.backSourceWithResourcePath)
  }).disableValidationWhen(() => (
    !enable.value || isQiniuPrivate()
  ))
}

type UserAuthReqConfState = FormState<{
  key: FieldState<string>
  type: FieldState<string>
  value: FieldState<string>
}>

export function createUserAuthReqConfListState(
  confList: IReqConfObject[]
): ArrayFormState<UserAuthReqConfState, IReqConfObject> {
  return new ArrayFormState(
    confList,
    createUserAuthReqConfState
  ).validators(validateReqConfListForSameKey)
}

export function createUserAuthReqConfState(
  conf: IReqConfObject
): UserAuthReqConfState {

  const type = new FieldState(conf.type).validators(
    validateReqConfObjectType
  )

  return new FormState({
    type,
    key: new FieldState(conf.key).validators(
      validateReqConfObjectKey
    ),
    value: new FieldState(conf.value).validators(
      (v => validateReqConfObjectValue(type.value)(v))
    )
  })
}

export function getValue(state: State): Value {
  return state.value
}
