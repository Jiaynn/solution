/**
 * @file component GuestLayout
 * @description 所有环境通用的未登录前所使用的 Layout
 * @author yinxulai <me@yinxulai.me>
 */

import React from 'react'
import { Toaster } from 'portal-base/common/toaster'

// 这个只是临时的解决方案
// 具体请查看这个 issue: https://github.com/qbox/portal-base/issues/682
export function GuestLayout(props: React.PropsWithChildren<{}>) {
  return (
    <>
      <Toaster />
      {props.children}
    </>
  )
}
