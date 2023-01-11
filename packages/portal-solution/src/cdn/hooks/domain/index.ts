/**
 * @file Domain Relative Hooks
 * @author linchen <gakilcin@gmail.com>
 */

import React, { useEffect } from 'react'
import { useInjection } from 'qn-fe-core/di'

import { useApiWithToaster } from 'cdn/hooks/api'

import DomainApis from 'cdn/apis/domain'

export function useDomainIcp(domain: string | undefined, shouldCheckIcp: boolean) {
  const [icpError, setIcpError] = React.useState<string | undefined>()

  const domainApis = useInjection(DomainApis)

  useEffect(() => {
    let didCancel = false

    const loadDomainIcp = async (target: string) => {
      const result = await domainApis.checkDomainIcp(target)
      if (!didCancel) {
        setIcpError(result)
      }
    }

    if (shouldCheckIcp && domain) {
      loadDomainIcp(domain)
    }

    return () => {
      didCancel = true
    }
  }, [domain, shouldCheckIcp, domainApis])

  return icpError
}

export function useBatchCheckUcDomainState(domainNames: string[]) {
  const domainApis = useInjection(DomainApis)

  const { result, isLoading, isSuccess } = useApiWithToaster(
    domainApis.batchCheckUcDomainState,
    {
      args: [domainNames],
      autorun: true
    }
  )

  return {
    isSuccess,
    isLoading,
    domainStateMap: result
  } as const
}
