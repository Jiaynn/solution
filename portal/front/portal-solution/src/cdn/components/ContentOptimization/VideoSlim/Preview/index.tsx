/**
 * @desc component for 视频瘦身结果预览
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { computed, observable, action, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'

import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Button from 'react-icecream/lib/button'
import Spin from 'react-icecream/lib/spin'
import { useLocalStore } from 'portal-base/common/utils/store'

import { transformStorageSize, humanizeBandwidth } from 'cdn/transforms/unit'

import { videoDefDescTextMap, VideoDef } from 'cdn/constants/video-slim'

import Snapshots from './Snapshots'
import VideoPlayer, { PlayerEvent, getSnapshot } from './VideoPlayer'
import { LocalStore, Loading, Status } from './store'

import './style.less'

export { LocalStore } from './store'

export interface IProps {
  taskId?: string
}

interface IVideoInfo {
  avType: string // 视频格式
  def: VideoDef // 视频规格（HD|SD|2K）
  size: number // 视频大小，单位 Byte
  br: number // 视频码率，单位 bps
}

const VideoInfo = observer((props: IVideoInfo) => (
  <ul className="comp-video-info">
    <li>格式：{props.avType && props.avType.toLowerCase()}</li>
    <li>文件大小：{props.size && `${transformStorageSize(props.size, { to: 'MB' }).toFixed(2)}MB`}</li>
    <li>码率：{props.br && humanizeBandwidth(props.br)}</li>
    <li>规格：{props.def && `${props.def.toUpperCase()} (${videoDefDescTextMap[props.def]})`}</li>
  </ul>
))

type PropsWithDeps = IProps & {
  store: LocalStore
}

@observer
export class VideoSlimPreviewInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
  }

  @autobind
  handlePlayerEvent(target: string, event: PlayerEvent, time: number) {
    const store = this.props.store
    switch (event) {
      case PlayerEvent.Pause:
        store.updateStatus(Status.Paused)
        break
      case PlayerEvent.Play:
        store.updateTime(time)
        store.updateStatus(Status.Playing)
        break
      case PlayerEvent.Seeking:
        store.loadings.start(target)
        break
      case PlayerEvent.Seeked:
        store.updateTime(time)
        store.loadings.stop(target)
        break
      default:
    }
  }

  @observable.ref beforeVideo?: HTMLVideoElement
  @action.bound handleUpdateBeforeVideo(video: HTMLVideoElement) {
    this.beforeVideo = video
  }

  @observable.ref afterVideo?: HTMLVideoElement
  @action.bound handleUpdateAfterVideo(video: HTMLVideoElement) {
    this.afterVideo = video
  }

  @computed get videosView() {
    const store = this.props.store
    const { task, loadings } = store

    return (
      <Row gutter={20}>
        <Col span={12}>
          <VideoPlayer
            src={task && task.resource || ''}
            onUpdateVideo={this.handleUpdateBeforeVideo}
            status={store.getPlayerStatus(Loading.VideoBefore)}
            currentTime={store.time}
            onEvent={(e, time) => this.handlePlayerEvent(Loading.VideoBefore, e, time)}
            preload
          />
          <div className="video-control-bar-wrapper">
            <Button
              className="capture-btn"
              size="small"
              loading={loadings.isLoading(Loading.CaptureSnapshot)}
              onClick={() => this.beforeVideo && this.handleCapture(this.beforeVideo.currentTime)}
            >截帧</Button>
          </div>
          <div className="video-info-wrapper">
            <h4 className="info-title">瘦身前视频文件参数</h4>
            <VideoInfo
              avType={task && task.avType}
              def={task && task.originDef}
              size={task && task.originSize}
              br={task && task.originBr}
            />
          </div>
        </Col>
        <Col span={12}>
          <VideoPlayer
            src={task && task.newUrl || ''}
            onUpdateVideo={this.handleUpdateAfterVideo}
            status={store.getPlayerStatus(Loading.VideoAfter)}
            currentTime={store.time}
            onEvent={(e, time) => this.handlePlayerEvent(Loading.VideoAfter, e, time)}
            preload
          />
          <div className="video-control-bar-wrapper">
            <Button
              className="capture-btn"
              size="small"
              loading={loadings.isLoading(Loading.CaptureSnapshot)}
              onClick={() => this.afterVideo && this.handleCapture(this.afterVideo.currentTime)}
            >截帧</Button>
          </div>
          <div className="video-info-wrapper">
            <h4 className="info-title">瘦身后视频文件参数</h4>
            <VideoInfo
              avType={task && task.avType}
              def={task && task.afterDef}
              size={task && task.afterSize}
              br={task && task.afterBr}
            />
          </div>
        </Col>
      </Row>
    )
  }

  @autobind
  handleCapture(time: number) {
    const store = this.props.store

    const promise = Promise.all([
      getSnapshot(this.beforeVideo!, time),
      getSnapshot(this.afterVideo!, time)
    ]).then(
      ([before, after]) => store.addSnapshots({ before, after })
    )

    return store.loadings.promise(Loading.CaptureSnapshot, promise)
  }

  render() {
    const store = this.props.store
    return (
      <div className="comp-video-slim-preview">
        <Spin size="large" spinning={!store.task || store.loadings.isLoading(Loading.GetTask)}>
          {this.videosView}
          <Snapshots list={store.snapshots} />
        </Spin>
      </div>
    )
  }
}

export default function VideoSlimPreview(props: IProps) {
  const store = useLocalStore(LocalStore, props)
  return (
    <VideoSlimPreviewInner {...props} store={store} />
  )
}
