import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'

import { useRequest } from 'ahooks'

import { CommonApi } from 'apis/common'
import { lowcodePath } from 'utils/router'

interface Props {
  children: React.ReactNode;
}

export const Auth: React.FC<Props> = props => {
  const { children } = props
  const commonApi = useInjection(CommonApi)
  const routerStore = useInjection(RouterStore)
  const { loading } = useRequest(() => commonApi.getLiveWhitelistCheck().then(result => {
    if (!result.res) {
      routerStore.push(`${lowcodePath}/prompt`)
    }
  }))

  return (
    loading ? <div>loading...</div> : <>{children}</>
  )
}
