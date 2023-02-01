/**
 * @description slider wrapper of player component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { Slider, SliderProps } from 'react-icecream-2'

import { useEvent } from 'kodo/hooks'

interface Props {
  onBeforeChange?: () => void // 实际上 rc-slider 是有这个属性
  onAfterChange?: () => void
}

export default function SliderWrapper(props: SliderProps & Props) {
  const { className, onBeforeChange, onAfterChange, ...restProps } = props

  const domRef = React.useRef<HTMLDivElement>(null)

  const isDraggingRef = React.useRef(false)

  // 以防按住滑动的时候移出 slider，在 document 上监听兜底
  const addDocumentAfterHandler = useEvent(() => {
    const doc = domRef.current?.ownerDocument
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    doc?.addEventListener('mouseup', handleAfterChange)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    doc?.addEventListener('touchend', handleAfterChange)
  })

  const removeDocumentAfterHandler = useEvent(() => {
    const doc = domRef.current?.ownerDocument
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    doc?.removeEventListener('mouseup', handleAfterChange)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    doc?.removeEventListener('touchend', handleAfterChange)
  })

  const handleBeforeChange = useEvent(() => {
    if (isDraggingRef.current) {
      return
    }
    isDraggingRef.current = true
    addDocumentAfterHandler()
    onBeforeChange?.()
  })

  const handleAfterChange = useEvent(() => {
    if (!isDraggingRef.current) return
    onAfterChange?.()
    removeDocumentAfterHandler()
    isDraggingRef.current = false
  })

  return (
    <div
      ref={domRef}
      className={className}
      onMouseDownCapture={handleBeforeChange}
      onTouchStartCapture={handleBeforeChange}
      onMouseUp={handleAfterChange}
      onTouchEnd={handleAfterChange}
      onFocusCapture={e => e.stopPropagation()} // slider 内部会监听 focus，且会触发一次 onChange
    >
      <Slider {...restProps} onAfterChange={handleAfterChange} />
    </div>
  )
}
