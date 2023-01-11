/**
 * @file api relative hooks
 * @author linchen <gakiclin@gmail.com>
 */

import { useReducer, useRef, useEffect, useCallback } from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { useSafeDispatch } from './misc'

enum Status {
  Idle = 'idle',
  Pending = 'pending',
  Resolved = 'resolved',
  Rejected = 'rejected'
}

type State<T> = {
  status: Status
  result?: T
  error?: unknown
}

export function useAsync<T = unknown>(initialData?: T) {
  const initialDataRef = useRef<State<T>>({
    result: initialData,
    status: Status.Idle
  })

  const [state, dispatch] = useReducer(
    (s: State<T>, a: State<T>) => ({ ...s, ...a }),
    initialDataRef.current
  )

  const safeDispatch = useSafeDispatch(dispatch)

  const reset = useCallback(() => {
    safeDispatch(initialDataRef.current)
  }, [safeDispatch])

  const setPending = useCallback(
    () => {
      safeDispatch({ status: Status.Pending })
    },
    [safeDispatch]
  )

  const setRejected = useCallback(
    (error: unknown) => {
      safeDispatch({ status: Status.Rejected, error })
    },
    [safeDispatch]
  )

  const setResolved = useCallback(
    (result: T) => {
      safeDispatch({ status: Status.Resolved, result })
    },
    [safeDispatch]
  )

  const run = useCallback(async (promise: Promise<T>) => {
    setPending()
    try {
      const result = await promise
      setResolved(result)
    } catch (err) {
      setRejected(err)
    }
  }, [setPending, setRejected, setResolved])

  return {
    isIdle: state.status === Status.Idle,
    isLoading: state.status === Status.Pending,
    isError: state.status === Status.Rejected,
    isSuccess: state.status === Status.Resolved,
    error: state.error,
    result: state.result,
    reset,
    run
  }
}

interface ApiOptions<T, Args> {
  initialData?: T
  autorun?: boolean
  args?: Args
  onOk?: (result?: T) => void
  onError?: (error: unknown) => void
}

export function useApi<T = unknown, Args extends unknown[] = []>(
  action: (...rest: Args) => Promise<T>,
  options?: ApiOptions<T, Args>
) {
  const {
    onOk,
    onError,
    initialData,
    autorun,
    args
  } = {
    autorun: false,
    // FIXME: never ？
    args: [] as any as Args,
    ...options
  }
  const {
    isLoading,
    isIdle,
    isError,
    error,
    isSuccess,
    run,
    result
  } = useAsync<T>(initialData)

  const call = useCallback((...innerArgs: Args) => (
    run(action(...innerArgs))
  ), [run, action])

  useEffect(() => {
    if (autorun) {
      call(...args)
    }
  }, [call, autorun, ...args]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isError && onError) {
      onError(error)
    }
  }, [error, isError, onError])

  useEffect(() => {
    if (isSuccess && onOk) {
      onOk(result)
    }
  }, [result, isSuccess, onOk])

  return {
    isLoading,
    isIdle,
    isError,
    error,
    isSuccess,
    call,
    result
  }
}

interface ApiWithToasterOptions<T, Args> extends ApiOptions<T, Args> {
  errMsg?: string
  okMsg?: string
}

export function useApiWithToaster<T = unknown, Args extends unknown[] = []>(
  action: (...rest: Args) => Promise<T>,
  options?: ApiWithToasterOptions<T, Args>
) {
  const { errMsg, okMsg, onOk, onError, ...restArgs } = { ...options }

  const toaster = useInjection(Toaster)
  const handleError = useCallback((error: unknown) => {
    toaster.exception(errMsg ?? error)
    if (onError) {
      onError(error)
    }
  }, [toaster, errMsg, onError])

  const handleOk = useCallback((result: T) => {
    if (okMsg) {
      toaster.success(okMsg)
    }
    if (onOk) {
      onOk(result)
    }
  }, [toaster, okMsg, onOk])

  return useApi(action, {
    ...restArgs,
    onError: handleError,
    onOk: handleOk
  })
}
