/**
 * @file misc hooks
 * @author linchen <gakiclin@gmail.com>
 */

import ReactDOM from 'react-dom'
import { debounce } from 'lodash'
import { Dispatch, useMemo, useCallback, useRef, useLayoutEffect, useState, useEffect } from 'react'
import Disposable from 'qn-fe-core/disposable'

export function useDisposable() {
  const [disposable] = useState(() => new Disposable())

  useEffect(() => disposable.dispose, [disposable])

  return disposable
}

/**
 * @description 该 hook 用于自动滚动到指定的锚点，bindRef：用于设置滚动的目标位置，
 *  setScrollAnchor 用于修改滚动的锚点。注意：该 hook 不会响应 anchor 参数的变化
 *  外部所有的锚点变更应该通过 setScrollAnchor 操作
 */
export function useAutoScrollAnchor<T>(anchor?: T) {
  const [scrollAnchor, setScrollAnchor] = useState(anchor)

  const safeSetScrollAnchor = useSafeDispatch(setScrollAnchor)

  const [anchorRefs] = useState(() => new Map<T, HTMLElement>())
  const [refSize, setRefSize] = useState(anchorRefs.size)

  const handleScroll = useMemo(() => debounce(() => safeSetScrollAnchor(undefined), 300), [safeSetScrollAnchor])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const bindRef = useCallback((name: T) => (
    (node: React.ReactInstance | null) => {
      if (node == null) {
        anchorRefs.delete(name)
      } else {
        // eslint-disable-next-line react/no-find-dom-node
        anchorRefs.set(name, ReactDOM.findDOMNode(node) as HTMLElement)
      }
      setRefSize(anchorRefs.size)
    }
  ), [anchorRefs])

  useEffect(() => {
    if (scrollAnchor && anchorRefs.has(scrollAnchor)) {
      anchorRefs.get(scrollAnchor)?.scrollIntoView()
    }
  }, [scrollAnchor, anchorRefs, refSize])

  return [bindRef, setScrollAnchor] as const
}

export type BindRef<T = string> = (name: T) => (node: React.ReactInstance | null) => void

export function useIsMount() {
  const mountRef = useRef(false)

  useLayoutEffect(() => {
    mountRef.current = true
    return () => { mountRef.current = false }
  }, [])

  return mountRef
}

/**
 * 该 hook 主要用于解决：react-warning-cant-call-setState-on-an-unmounted-component 的问题
 * 参考：https://www.robinwieruch.de/react-warning-cant-call-setstate-on-an-unmounted-component
 */
export function useSafeDispatch<A = any>(dispatch: Dispatch<A>) {
  const mountRef = useIsMount()

  return useCallback(
    (arg: A) => { if (mountRef.current) dispatch(arg) },
    [mountRef, dispatch]
  )
}

/**
 * 该 hooks 用于辅助 effect 函数判断是否是第一次执行
 */
export function useIsFirst() {
  const firstRef = useRef(true)

  useLayoutEffect(() => () => { firstRef.current = false })

  return firstRef
}
