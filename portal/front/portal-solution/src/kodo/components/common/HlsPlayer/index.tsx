/**
 * @description video player supported for hls
 * @author duli <duli@qiniu.com>
 */

import React, { useEffect, useMemo, useRef } from 'react'
import Hls, { HlsConfig as Config } from 'hls.js'

import { useEvent } from 'kodo/hooks'

export interface Props extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'onError'> {
  hlsConfig?: Partial<Config>
  src: string
  onError?: () => void
  videoRef?: React.RefObject<HTMLVideoElement>
}

export default function HlsPlayer({ hlsConfig, onError, videoRef, ...props }: Props) {
  const isHlsSupported = useMemo(() => Hls.isSupported(), [])

  const innerRef = useRef<HTMLVideoElement>(null)

  const ref = videoRef ?? innerRef

  const init = useEvent(() => {
    if (!isHlsSupported) {
      onError?.()
      return
    }

    const hls = new Hls({
      ...hlsConfig,
      enableWorker: false
    })

    if (ref.current) {
      hls.attachMedia(ref.current)
    }

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(props.src)
    })

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError()
            break
          default:
            onError?.()
        }
      }
    })

    return () => { hls.destroy() }
  })

  useEffect(() => init(), [init, props.src])

  return <video ref={ref} {...props} />
}
