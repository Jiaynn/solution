/**
 * @description hooks
 * @author duli <duli@qiniu.com>
 */

import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { useInjection } from 'qn-fe-core/di'

import { getResourceProxyUrl } from 'kodo/transforms/bucket/resource'

import { ConfigStore } from 'kodo/stores/config'
import { BucketStore } from 'kodo/stores/bucket'

export function useModalState(initVisible = false) {
  const [visible, setVisible] = useState(initVisible)
  const open = useCallback(() => setVisible(true), [])
  const close = useCallback(() => setVisible(false), [])

  const ref = useRef({
    visible,
    open,
    close
  })

  ref.current.visible = visible

  return ref.current
}

/**
 * @warning don't use during render
 * @ref https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md#internal-implementation
 */
export function useEvent<I extends any[], O>(handler: (...args: I) => O) {
  const handlerRef = useRef<((...args: I) => O) | null>(null)

  // In a real implementation, this would run before layout effects
  useLayoutEffect(() => {
    handlerRef.current = handler
  })

  return useCallback<(...args: I) => O>((...args) => {
    // In a real implementation, this would throw if called during render
    const fn = handlerRef.current
    return fn!(...args)
  }, [])
}

export function useResourceProxyUrl(bucketName: string, src?: string) {
  const configStore = useInjection(ConfigStore)
  const bucketStore = useInjection(BucketStore)
  const bucketInfo = bucketStore.getDetailsByName(bucketName)
  return useMemo(() => {
    // http 不代理
    if (window.location.protocol === 'https' && src && bucketInfo) {
      return getResourceProxyUrl(configStore, src, bucketInfo.region)
    }

    return src
  }, [src, configStore, bucketInfo])
}

export function useMountedRef() {
  const mountedRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])
  return mountedRef
}
