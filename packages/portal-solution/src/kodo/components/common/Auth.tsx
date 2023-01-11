/**
 * @file component Auth 权限控制
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { UserInfoStore } from 'portal-base/user/account'

import { FeatureKey } from 'kodo/types/feature'

import { BucketStore } from 'kodo/stores/bucket'
import { KodoIamStore, SingleIamInfo } from 'kodo/stores/iam'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'
import NoPermission from './NoPermission'

export interface IShareOptions {
  bucketName: string
  enableTypes: ShareType[]
}

// 当前的控制点不像 admin 里是通过来源 permission code 来控制，目前只有六个来源控制点且各自独立，鉴于此，不需要 deny 来做非判断
// 后期如果有其他新增控制，需要加到此处，但是需要区分业务逻辑显示和全局显示控制，业务逻辑控制不要放在此处
export interface IAuthOptions {
  bucketShare?: IShareOptions
  notIamUser?: boolean // iam 用户控制
  iamPermission?: SingleIamInfo | SingleIamInfo[] // iam 用户权限，多个条件之间是 & 的关系，只要有一条不满足，则不显示
  notProtectedUser?: boolean // 账号保护状态用户
  featureKeys?: FeatureKey[] // feature 控制 多个条件之间是 & 的关系，只要有一条不满足，则不显示
  // notReadonlyShareBucket?: string // 不能是只读分享空间
  // notReadWriteShareBucket?: string // 不能是读写权限分享空间
  // notOwnShareBucket?: string // 不能是自有分享空间 ？？？
  // notOverseasRegion?: ZoneType // 海外空间控制
}

export type IProps = IAuthOptions & ({
  children: React.ReactNode
  render?: never
} | {
  render: (disabled: boolean) => React.ReactElement
  children?: never
})

type DiProps = {
  iamStore: KodoIamStore
  bucketStore: BucketStore
  userInfoStore: UserInfoStore
  featureConfigStore: FeatureConfigStore
}
/**
 * @param deps
 * @param options
 * @returns 权限检查未通过则返回 false
 */
export function authCheck(deps: DiProps, options: IAuthOptions): boolean {
  const {
    iamStore,
    bucketStore,
    userInfoStore,
    featureConfigStore
  } = deps

  const {
    featureKeys,
    notIamUser, bucketShare,
    notProtectedUser, iamPermission
  } = options

  if (notIamUser && iamStore.isIamUser) {
    return false
  }

  if (iamPermission) {
    if (Array.isArray(iamPermission)) {
      return iamPermission.map(p => iamStore.isActionDeny(p)).every(v => !v)
    }

    return !iamStore.isActionDeny(iamPermission)
  }

  if (bucketShare) {
    const { bucketName, enableTypes } = bucketShare
    const bucketInfo = bucketStore.getDetailsByName(bucketName)
    if (!bucketInfo || !enableTypes.includes(bucketInfo.perm)) {
      return false
    }
  }

  if (notProtectedUser && userInfoStore.isBufferedUser) {
    return false
  }

  // 只要有一个 key 是 disabled ，就认为不符合
  if (featureKeys && featureKeys.some(key => featureConfigStore.isDisabled(key))) {
    return false
  }

  // if (notOverseasRegion && regionStore.isOverseasRegion(notOverseasRegion)) {
  //   return false
  // }

  // if (notReadonlyShareBucket && isReadonlyShareBucket(notReadonlyShareBucket)) {
  //   return false
  // }

  // if (notReadWriteShareBucket && isReadWriteShareBucket(notReadWriteShareBucket)) {
  //   return false
  // }

  // if (notOwnShareBucket && isOwnShareBucket(notOwnShareBucket)) {
  //   return false
  // }

  return true
}

// 不符合权限，如果有 render 则执行 render，否则就隐藏 children
export const Auth = observer(function _Auth(props: IProps) {
  const iamStore = useInjection(KodoIamStore)
  const bucketStore = useInjection(BucketStore)
  const userInfoStore = useInjection(UserInfoStore)
  const featureConfigStore = useInjection(FeatureConfigStore)

  const { children, render, ...options } = props

  const isDeny = !authCheck({
    iamStore,
    bucketStore,
    userInfoStore,
    featureConfigStore
  }, options)

  if (render) {
    return render(isDeny)
  }

  return isDeny ? null : <>{children}</>
})

// 对路由内的组件权限控制
export const AuthRoute = observer(function _AuthRoute(props: IAuthOptions & { children: React.ReactNode }) {
  const { children, ...options } = props
  return (
    <Auth render={isDeny => (isDeny ? <NoPermission /> : <>{children}</>)} {...options} />
  )
})
