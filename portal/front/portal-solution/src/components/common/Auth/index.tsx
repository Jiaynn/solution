import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'

import { useRequest } from 'ahooks'

import { Loading } from 'react-icecream-2'

import { CommonApi } from 'apis/common'
import { lowcodePath } from 'utils/router'
import { AuthStore } from 'components/common/Auth/store'

interface Props {
  children: React.ReactNode;
}

export const Auth: React.FC<Props> = props => {
  const { children } = props
  const commonApi = useInjection(CommonApi)
  const routerStore = useInjection(RouterStore)
  const authStore = useInjection(AuthStore)
  const { loading } = useRequest(() => commonApi.getLiveWhitelistCheck().then(result => {
    authStore.updateAuth(result.res)
    if (!result.res) {
      routerStore.push(`${lowcodePath}/prompt`)
    }
  }))

  if (loading) {
    return (
      <Loading
        style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />
    )
  }
  return (
    <>
      {children}
    </>
  )
}
