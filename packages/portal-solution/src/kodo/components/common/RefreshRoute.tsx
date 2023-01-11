/**
 * @file component RefreshRoute
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'

import { GuestLayout } from './Layout/GuestLayout'

export function RefreshRoute() {
  React.useEffect(() => {
    window.location.reload()
  }, [])

  return <GuestLayout />
}
