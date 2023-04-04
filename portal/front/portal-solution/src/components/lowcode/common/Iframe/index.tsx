import React, { useEffect, useMemo, useState } from 'react'

interface LowcodeIframeProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  isAdaptive?: boolean;
  url?: string;
}

const iframeWebPageWidth = 1280
const iframeWidth = 1040

export const LowcodeIframe: React.FC<LowcodeIframeProps> = props => {
  const {
    url, width, height, isAdaptive,
    ...restProps
  } = props

  const [scaleValue, setScaleValue] = useState<number>(iframeWidth / iframeWebPageWidth)
  const adaptWidth = useMemo(() => `${1 / scaleValue * 100}%`, [scaleValue])

  useEffect(() => {
    const calculateWidth = () => {
      const container = document.querySelector<HTMLDivElement>('.lowcode-main-right-content-main')
      if (container && isAdaptive) {
        const value = container.clientWidth / iframeWebPageWidth
        setScaleValue(value)
      }
    }
    calculateWidth()
    window.addEventListener('resize', calculateWidth)
    return () => {
      window.removeEventListener('resize', calculateWidth)
    }
  }, [isAdaptive])

  useEffect(() => {
    const right = document.querySelector('.lowcode-main-right-content')
    if (right) {
      right.scrollTop = 0
    }
  }, [])

  if (isAdaptive) {
    return (
      <iframe
        src={url}
        width={adaptWidth}
        height={adaptWidth}
        style={{ transformOrigin: 'left top', transform: `scale(${scaleValue})` }}
        {...restProps}
      />
    )
  }
  return <iframe src={url} width={width} height={height} />
}
