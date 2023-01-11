/**
 * @file global provide & init
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React, { PropsWithChildren } from 'react'
import { observer } from 'mobx-react'
import { Provides } from 'qn-fe-core/di'
import LocaleProvider from 'react-icecream/lib/locale-provider'
import zh_CN from 'react-icecream/lib/locale-provider/zh_CN'
import BaseBootProvider from 'portal-base/common/components/BootProvider'

import { SslClient, SslProxyClient, SslHttpClient } from '../../apis/client'
import SslApis from '../../apis/ssl'
import DomainApis from '../../apis/domain'

export const defaultProvides: Provides = [
  SslClient,
  SslProxyClient,
  SslHttpClient,
  SslApis,
  DomainApis
]

export default observer(function BootProvider({ children }: PropsWithChildren<{}>) {
  return (
    <BaseBootProvider provides={defaultProvides}>
      <LocaleProvider locale={zh_CN}>
        {children}
      </LocaleProvider>
    </BaseBootProvider>
  )
})
