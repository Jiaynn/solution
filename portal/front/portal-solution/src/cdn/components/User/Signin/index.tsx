/**
 * @file OEM 登录
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'
import { SignIn as BaseSignIn } from 'portal-base/user/account'

import { oemConfig } from 'cdn/constants/env'

import './style.less'

export default observer(function SignIn() {
  const email = useInjection(RouterStore).query.email

  return (
    <BaseSignIn
      logo={oemConfig.logo}
      username={email as string | undefined}
      title={oemConfig.hideLoginTitle ? undefined : oemConfig.title}
      copyright={oemConfig.copyright}
    />
  )
})
