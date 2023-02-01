/**
 * @description video fullscreen preview
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { Loading } from 'react-icecream-2'

import { humanizeDuration } from 'kodo/transforms/date-time'

import Player, { Props as PlayerProps } from '../Content/Player'

import styles from './style.m.less'

type VideoInfo = {
  duration: number
  width: number
  height: number
}

interface Props {
  src?: string
  hlsConfig?: PlayerProps['hlsConfig']
  styleName?: string
  onError?: () => void
  loading: boolean
}

export default function Video({ src, hlsConfig, styleName, onError, loading }: Props) {
  const [videoInfo, setVideoInfo] = React.useState<VideoInfo | null>(null)

  const handleDurationChange = React.useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setVideoInfo({
      duration: e.currentTarget.duration,
      width: e.currentTarget.videoWidth,
      height: e.currentTarget.videoHeight
    })
  }, [])

  return (
    <Loading loading={loading}>
      <div className={styles.desc}>
        {!!styleName && <div className={styles.gap}>样式名称：<span>{styleName}</span></div>}
        <div className={styles.gap}>时长：<span>{videoInfo ? humanizeDuration(videoInfo.duration) : '-'}</span></div>
        <div className={styles.gap}>分辨率：<span>{videoInfo ? `${videoInfo.width} * ${videoInfo.height}` : '-'}</span></div>
      </div>
      <Player
        className={styles.player}
        key={src}
        src={src}
        onDurationChange={handleDurationChange}
        hlsConfig={hlsConfig}
        onError={onError}
      />
    </Loading>
  )
}
