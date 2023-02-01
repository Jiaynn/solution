/**
 * @desc component for video player
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { reaction, action, observable, makeObservable } from 'mobx'
import { includes } from 'lodash'

import Disposable from 'qn-fe-core/disposable'

import './style.less'

export enum PlayerStatus {
  Paused = 'paused',
  Playing = 'playing',
  Waiting = 'waiting'
}

export enum PlayerEvent {
  Play = 'play', // 播放
  Pause = 'pause',  // 暂停
  Seeking = 'seeking', // 正在跳转到时间点
  Seeked = 'seeked' // 已跳转到时间点
}

export interface IProps {
  src: string
  onUpdateVideo?: (video: HTMLVideoElement) => void
  currentTime: number
  status: PlayerStatus
  onEvent: (event: PlayerEvent, time: number) => void
  preload?: boolean
  height?: number
}

@observer
export default class VideoPlayer extends React.Component<IProps> {
  disposable = new Disposable()

  @observable.ref video?: HTMLVideoElement

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @action.bound updateRef(ref: HTMLVideoElement) {
    this.video = ref

    if (this.props.onUpdateVideo) {
      this.props.onUpdateVideo(ref)
    }
  }

  componentDidMount() {
    // 重新加载 video
    this.disposable.addDisposer(reaction(
      () => this.props.src,
      src => {
        if (src && this.video) {
          this.video.load()
        }
      }
    ))

    // 绑定 video 事件，触发 Player 事件
    this.disposable.addDisposer(reaction(
      () => this.video,
      video => {
        if (!video) { return }
        this.bindEvents()
      },
      { fireImmediately: true }
    ))

    // 响应时间的变化
    this.disposable.addDisposer(reaction(
      () => this.props.currentTime,
      time => {
        if (this.current !== time && this.video) {
          this.video.currentTime = time
        }
      }
    ))

    // 响应 status 变化
    this.disposable.addDisposer(reaction(
      () => this.props.status,
      status => {
        // 只对外部指定的 playing/paused 状态作出响应
        if (this.video && status === PlayerStatus.Playing && this.status === PlayerStatus.Paused) {
          this.video.play()
        }
        if (this.video && status === PlayerStatus.Paused && this.status !== PlayerStatus.Paused) {
          this.video.pause()
        }
      }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    const { src, height, preload } = this.props

    return (
      <div className="comp-video-player">
        <video
          ref={this.updateRef}
          controls
          preload={preload ? 'auto' : 'none'}
          height={height || 350}
          crossOrigin="annoymous"
        >
          <source src={src || undefined} />
        </video>
      </div>
    )
  }

  // ============== Video 相关状态 =================

  get status(): PlayerStatus | undefined {
    if (!this.video) {
      return
    }
    if (this.video.paused) {
      return PlayerStatus.Paused
    }
    if (this.video.seeking) {
      return PlayerStatus.Waiting
    }
    return PlayerStatus.Playing
  }

  get current() {
    return this.video?.currentTime
  }

  // ============== Video 状态同步的逻辑 =================

  dispatchOn(event: PlayerEvent, statuses: PlayerStatus[]) {
    // 如果外部指定的状态是 statuses 中的一种，则触发对应事件通知外部
    if (includes(statuses, this.props.status) && this.current != null) {
      this.props.onEvent(event, this.current)
    }
  }

  // 响应 video 的事件，并根据状态向外部触发相关事件
  bindEvents() {
    // eventListener + dispatchOn + 使用方的 handlePlayerEvent、getPlayerStatus 最终构成了一个类似于状态机的东西（虽然可能不是最完美的）。
    // 一般情况下是 `seeking` <-> `seeked` -> `playing` <-> `pause` -> `seeking`。
    // 比较特殊的是点击播放或改变播放位置时需要加载，就会出现：
    //   `seeking` -> `pause` -> `seeked`(若原本是 play 状态，则可能还会继续触发 `playing`)
    // 中间经历了一个短暂的 paused 状态

    // 因此，根据上述事件流转的情况，以及对应状态的计算方式，总结出以下的逻辑。
    this.video?.addEventListener(
      'playing',
      () => this.dispatchOn(PlayerEvent.Play, [PlayerStatus.Paused])
    )

    this.video?.addEventListener(
      'pause',
      () => this.dispatchOn(PlayerEvent.Pause, [PlayerStatus.Playing])
    )

    this.video?.addEventListener(
      'seeking',
      () => this.dispatchOn(PlayerEvent.Seeking, [PlayerStatus.Playing, PlayerStatus.Paused])
    )

    this.video?.addEventListener(
      'seeked',
      () => this.dispatchOn(PlayerEvent.Seeked, [PlayerStatus.Waiting]) // seeked 事件必定跟在 seeking 事件 (waiting 状态) 之后
    )
  }
}

// 截帧
function isReady(video: HTMLVideoElement): boolean {
  return video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !video.seeking
}

const checkInterval = 500

function canCapture(video: HTMLVideoElement): Promise<void> {
  return new Promise(resolve => {
    if (isReady(video)) {
      resolve()
      return
    }
    const timer = setInterval(() => {
      if (!isReady(video)) {
        return
      }
      clearInterval(timer)
      resolve()
    }, checkInterval)
  })
}

export interface IPicture {
  time: number
  content: string
}

export async function getSnapshot(
  video: HTMLVideoElement,
  time: number,
  size: { height?: number, width?: number} = {}
): Promise<IPicture> {
  // 同步指定时间以截帧。这里会触发 seeking -> seeked 事件。
  // 以及因为 getPlayerStatus 的缘故，所以会自动 pause 一下
  // 当执行完截帧时，自动恢复本来的状态
  await (video.currentTime = time)
  await canCapture(video)

  const canvas = document.createElement('canvas')
  canvas.width = size.width || video.videoWidth
  canvas.height = size.height || video.videoHeight

  canvas.getContext('2d')
    ?.drawImage(video, 0, 0, canvas.width, canvas.height)

  return {
    time: video.currentTime,
    content: canvas.toDataURL('image/png')
  }
}
