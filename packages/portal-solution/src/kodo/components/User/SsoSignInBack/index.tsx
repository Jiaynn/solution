/**
 * @file SsoSignInBack
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { Button } from 'react-icecream'
import { useInjection } from 'qn-fe-core/di'
import { SVGIcon } from 'portal-base/common/utils/svg'

import { ConfigStore } from 'kodo/stores/config'
import { SignInStore } from 'kodo/stores/sign-in'

import { GuestLayout } from 'kodo/components/common/Layout/GuestLayout'

import errorIcon from './error.svg'

import style from './style.m.less'

enum SsoBackError {
  RequestSsoFailed = 400001, // 请求参数错误，目前是指一次性 tokenSso 为空
  GetSsoLoginTokenFailed = 500001, // 获取 logintoken 失败
  GetSsoUserInfoFailed = 500002, // 通过 logintoken 获取用户信息失败
  UserForbidden = 403, // uid 被禁用
  InternalError = 500, // 内部错误
  DatabaseError = 598 // 数据库错误
}

const errorDescription = {
  [SsoBackError.RequestSsoFailed]: '获取登录信息失败，请尝试重新登录',
  [SsoBackError.GetSsoLoginTokenFailed]: '获取登录信息失败，请尝试重新登录',
  [SsoBackError.GetSsoUserInfoFailed]: '获取用户信息失败，请尝试重新登录',
  [SsoBackError.UserForbidden]: '当前账号已被禁用',
  [SsoBackError.InternalError]: '发生未知内部错误',
  [SsoBackError.DatabaseError]: '发生未知内部错误'
}

export interface IProps {
  error?: number
  redirect?: string
}

export function SsoSignInBack(props: IProps) {
  const configStore = useInjection(ConfigStore)

  const rootPath = configStore.rootPath
  const { error, redirect = rootPath } = props

  const signInStore = useInjection(SignInStore)

  const allowReSignIn = error && [
    SsoBackError.RequestSsoFailed,
    SsoBackError.GetSsoLoginTokenFailed,
    SsoBackError.GetSsoUserInfoFailed
  ].includes(error)

  React.useEffect(() => {
    if (error) return
    window.location.href = redirect
  }, [error, redirect])

  const signInButtonView = allowReSignIn && (
    <Button
      type="default"
      className={style.button}
      onClick={() => signInStore.gotoSignIn({ redirect: `${window.location.origin}${configStore.rootPath}` })}
    >
      重新登录
    </Button>
  )

  return (
    <GuestLayout>
      {error && (
        <div className={style.main}>
          <SVGIcon className={style.icon} src={errorIcon} />
          <h2 className={style.title}>
            登录失败
          </h2>
          {error && (
            <p className={style.description}>
              {errorDescription[error]}
            </p>
          )}
          {signInButtonView}
        </div>
      )}
    </GuestLayout>
  )
}
