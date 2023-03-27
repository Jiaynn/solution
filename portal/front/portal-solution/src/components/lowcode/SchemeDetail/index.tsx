import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'qn-fe-core/router'
import React, { useEffect, useMemo, useState } from 'react'

export function LowcodeSchemeDetail() {
  const { query } = useInjection(RouterStore)
  const { url } = query
  const [scaleValue, setScaleValue] = useState<number>(1024 / 1280)
  const width = useMemo(() => `${1 / scaleValue * 100}%`, [scaleValue])

  useEffect(() => {
    const calculateWidth = () => {
      const container = document.querySelector<HTMLDivElement>('.lowcode-main-right-content-main')
      if (container) {
        const value = container.clientWidth / 1280
        setScaleValue(value)
      }
    }
    calculateWidth()
    window.addEventListener('resize', calculateWidth)
    return () => {
      window.removeEventListener('resize', calculateWidth)
    }
  }, [])

  useEffect(() => {
    const right = document.querySelector('.lowcode-main-right-content')
    if (right) {
      right.scrollTop = 0
    }

  }, [])

  return (
    <iframe
      src={url?.toString()}
      width={width}
      height={width}
      style={{
        transformOrigin: 'left top',
        transform: `scale(${scaleValue})`
      }}

    />
  )
}
