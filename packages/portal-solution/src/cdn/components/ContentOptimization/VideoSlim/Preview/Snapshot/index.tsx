/**
 * @desc component for 截帧的图片和描述
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'

import { IPicture } from '../VideoPlayer'

import './style.less'

export enum SnapshotType {
  Before = 'before',
  After = 'after'
}

export interface IProps {
  picture: IPicture
  type: SnapshotType
  onClick?: () => void
}

// 缩略图
export const SnapshotThumb = observer(function _SnapshotThumb(props: IProps) {
  const { picture, type } = props

  return (
    <div className="comp-snapshot-thumb" onClick={props.onClick}>
      <img
        src={picture.content}
        className="snapshot-image"
      />

      <p className={`snapshot-title snapshot-title-${type}`}>
        瘦身{type === SnapshotType.After ? '后' : '前'}视频截帧 - {transformTime(picture.time)}
      </p>
    </div>
  )
})

// 大图
export const Snapshot = observer(function _Snapshot(props: IProps) {
  const { picture, type } = props

  return (
    <div className="comp-snapshot" onClick={props.onClick}>
      <p className={`snapshot-title snapshot-title-${type}`}>
        瘦身{type === SnapshotType.After ? '后' : '前'}视频截帧 - {transformTime(picture.time, true)}
      </p>
      <img
        src={picture.content}
        className="snapshot-image"
      />
    </div>
  )
})

export function transformTime(time: number, isDetail?: boolean) {
  const duration = moment.duration(time, 's')
  const hours = String(duration.hours()).padStart(2, '0')
  const minutes = String(duration.minutes()).padStart(2, '0')
  const seconds = String(duration.seconds()).padStart(2, '0')
  const milliSeconds = String(duration.milliseconds().toFixed(0)).padStart(3, '0')

  return `${hours}:${minutes}:${seconds}${isDetail ? '.' + milliSeconds : ''}`
}
