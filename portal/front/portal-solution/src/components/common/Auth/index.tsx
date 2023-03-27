import React, { useEffect, useState } from 'react'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'

import { CommonApi } from 'apis/common'
import { lowcodePath } from 'utils/router'
import { isElectron } from 'constants/is'

interface Props {
  children: React.ReactNode;
}

export const Auth: React.FC<Props> = props => {
  const { children } = props
  const commonApi = useInjection(CommonApi)
  const routerStore = useInjection(RouterStore)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    commonApi.getLiveWhitelistCheck().then(result => {
      setLoading(false)
      if (!result.res) {
        routerStore.push(`${lowcodePath}/prompt`)
        return
      }
      if (isElectron) {
        routerStore.push(`${lowcodePath}/welcome`)
      }
    })
  }, [commonApi, routerStore])

  return (
    loading ? null : <>{children}</>
  )
}
