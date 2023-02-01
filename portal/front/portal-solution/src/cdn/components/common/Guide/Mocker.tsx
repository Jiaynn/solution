/**
 * @desc component for GuideMocker
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React, { PropsWithChildren } from 'react'
import { observer } from 'mobx-react'

import { useInjection } from 'qn-fe-core/di'
import { LocalStorageStore } from 'portal-base/common/utils/storage'

import { getLocalStorageKey } from './Group'

export interface IGuideMockerProps {
  name: string // points to GuideGroup name
  mocked: React.ReactNode
}

export const GuideMocker = observer(function _GuideMocker(props: PropsWithChildren<IGuideMockerProps>) {
  const { mocked: mockedComponent, children } = props
  const localStorageStore = useInjection(LocalStorageStore)

  if (!localStorageStore.getItem(getLocalStorageKey(props.name))) {
    return <>{React.Children.only(mockedComponent)}</>
  }

  if (children) {
    return <>{children}</>
  }

  return null
})
