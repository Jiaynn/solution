import { useCallback, useEffect, useRef, useState } from 'react'

export function useSafeState<T = undefined>(initialState: T) {
  const [innerState, setInnerState] = useState<T>(initialState)
  const mountRef = useRef(true)
  useEffect(() => () => {
    mountRef.current = false
  }, [])
  const setState = useCallback((nextState: T) => {
    if (mountRef.current) {
      setInnerState(nextState)
    }
  }, [])
  return [innerState, setState] as const
}
