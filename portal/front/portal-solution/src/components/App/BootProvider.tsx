/**
 * @file global provide & init
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import React, { ReactNode } from 'react'
import { observer } from 'mobx-react'

import { Provides } from 'qn-fe-core/di'

import BaseBootProvider from 'portal-base/common/components/BootProvider'

import HelloStore from 'stores/hello'
import HelloApis from 'apis/hello'

export const defaultProvides: Provides = [
  HelloStore,
  HelloApis
]

export interface Props {
  children: ReactNode
}

export default observer(function BootProvider({ children }: Props) {
  return (
    <BaseBootProvider provides={defaultProvides}>
      {children}
    </BaseBootProvider>
  )
})
