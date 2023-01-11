/**
 * @description video player component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import classNames from 'classnames'
import { throttle } from 'lodash'
import { Icon } from 'react-icecream'
import { Slider, Loading } from 'react-icecream-2'

import { humanizeDuration } from 'kodo/transforms/date-time'

import { useEvent } from 'kodo/hooks'

import HlsPlayer, { Props as HlsPlayerProps } from 'kodo/components/common/HlsPlayer'
import SliderWrapper from './Slider'

import VolumeIcon from './volume.svg'

import styles from './style.m.less'

interface VolumeProps {
  value: number
  onChange: (v: number) => void
  onAfterChange?: (v: number) => void
}

function Volume({ value, onChange, onAfterChange }: VolumeProps) {
  return (
    <div className={styles.volume}>
      <VolumeIcon className={styles.volumeIcon} />
      <div className={styles.volumeSliderWrapper}>
        <div className={styles.value}>{value}</div>
        <Slider
          className={styles.slider}
          vertical
          value={value}
          min={0}
          max={100}
          onChange={onChange}
          onAfterChange={onAfterChange}
          tipFormatter={null}
        />
      </div>
    </div>
  )
}

export interface Props {
  src?: string
  isPlaying?: boolean
  onIsPlayingChange?: (isPlaying: boolean) => void
  hlsConfig?: HlsPlayerProps['hlsConfig']

  className?: string
  onDurationChange?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void // 资源加载时会周期性触发，及时更新 duration
  onError?: () => void
}

function useIsPlaying(props: Pick<Props, 'isPlaying' | 'onIsPlayingChange'>) {
  const [playing, setPlaying] = React.useState(props.isPlaying)

  const state = React.useMemo(() => props.isPlaying ?? playing, [props.isPlaying, playing])

  const dispatch = React.useMemo(() => props.onIsPlayingChange ?? setPlaying, [props.onIsPlayingChange])

  return [state, dispatch] as const
}

export default function Player(props: Props) {
  const { src, hlsConfig, className, onDurationChange, onError } = props

  const [playing, setPlaying] = useIsPlaying(
    { isPlaying: props.isPlaying, onIsPlayingChange: props.onIsPlayingChange }
  )
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolume] = React.useState(80)
  const [isWaiting, setIsWaiting] = React.useState(false)
  // 点击 slider 滑动的时候，上锁，mouseUp 就解锁，目的是为了阻止 onUpdateTime 中断 currentTime
  // 表示当前正在滚动进度条，只更新 view，不更新 dom
  const [isSyncForbidden, setIsSyncForbidden] = React.useState(false)

  const videoRef = React.useRef<HTMLVideoElement>(null)

  const currentTimeView = React.useMemo(() => humanizeDuration(currentTime), [currentTime])
  const durationView = React.useMemo(() => humanizeDuration(duration), [duration])

  const syncToVideoDom = useEvent(() => {
    if (!videoRef.current) return

    const replay = !!videoRef.current?.ended && videoRef.current.currentTime === currentTime

    const targetTime = replay ? 0 : currentTime

    if (playing) {
      videoRef.current.currentTime = targetTime
      videoRef.current.play().catch(() => setPlaying(false))
    } else {
      videoRef.current.pause()
      // 必须把 currentTime 的更新放在 pause 后面，否则 pause 了，依然会有 waiting 事件
      videoRef.current.currentTime = currentTime
    }
  })

  const handleVolumeChange = React.useCallback((v: number) => {
    if (videoRef.current) {
      videoRef.current.volume = v / 100
    }
    setVolume(v)
  }, [])

  const handleDurationChange = React.useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      if (e.currentTarget.duration != null) setDuration(e.currentTarget.duration)
      if (onDurationChange) onDurationChange(e)
    },
    [onDurationChange]
  )

  const handlePlay = useEvent(() => {
    if (!duration) return
    setPlaying(!playing)
  })

  const handleCurrentTimeChangeStart = React.useCallback(() => {
    setIsSyncForbidden(true) // 上锁
  }, [])

  const handleCurrentTimeChangeEnd = useEvent(() => {
    setPlaying(currentTime !== duration) // 如果到了终止时刻，自然是要暂停的
    setIsSyncForbidden(false) // 解锁
  })

  // 节流一下，过于频繁
  const throttledTimeUpdate = useEvent(
    throttle(() => {
      // 锁住了就说明都不干
      if (isSyncForbidden) return
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime)
      }
    }, 50)
  )

  const handleEnded = useEvent(() => {
    setPlaying(false)
  })

  const handleWaiting = useEvent(() => {
    setIsWaiting(true)
  })

  const cancelWaiting = useEvent(() => {
    setIsWaiting(false)
  })

  React.useEffect(() => {
    if (!isSyncForbidden) {
      syncToVideoDom()
    }
  }, [syncToVideoDom, playing, isSyncForbidden])

  const videoProps = {
    src: src!,
    onProgress: handleDurationChange,
    onDurationChange: handleDurationChange,
    onError,
    onTimeUpdate: throttledTimeUpdate,
    onEnded: handleEnded,
    onLoadStart: handleWaiting,
    onWaiting: handleWaiting,
    onPlaying: cancelWaiting,
    onCanPlayThrough: cancelWaiting
  }

  const playerView = hlsConfig
    ? <HlsPlayer hlsConfig={hlsConfig} {...videoProps} videoRef={videoRef} />
    : <video {...videoProps} ref={videoRef} />

  return (
    <div className={`${styles.player} ${className}`}>
      <Loading loading={isWaiting}>
        <div className={classNames(styles.media, !duration && styles.disabled)} onClick={handlePlay}>
          {playerView}
        </div>
      </Loading>
      <div className={styles.controller}>
        <Icon
          className={classNames(styles.playIcon, !duration && styles.disabled)}
          type={playing ? 'pause' : 'caret-right'}
          onClick={handlePlay}
        />
        <SliderWrapper
          className={classNames(styles.progress, !duration && styles.disabled)}
          disabled={!duration}
          max={duration}
          step={0.0001}
          value={currentTime}
          onBeforeChange={handleCurrentTimeChangeStart}
          onChange={setCurrentTime}
          onAfterChange={handleCurrentTimeChangeEnd}
          tipFormatter={humanizeDuration}
        />
        <div className={styles.time}>
          <span>{currentTimeView}</span> / <span>{durationView}</span>
        </div>
        <Volume value={volume} onChange={handleVolumeChange} />
      </div>
    </div>
  )
}
