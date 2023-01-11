/**
 * @description image fullscreen preview
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { Loading } from 'react-icecream-2'

import {
  getStyleQuality,
  getStyleOutputFormat,
  getStyleAbbreviationType
} from 'kodo/transforms/image-style'
import { humanizeStorageSize } from 'kodo/transforms/unit'

import { MediaStyle } from 'kodo/apis/bucket/image-style'
import { BlobInfo } from '../Content'

import styles from './style.m.less'

type Dimension = {
  width: number
  height: number
}

interface Props {
  blobInfo?: BlobInfo | null
  style?: MediaStyle
  onError?: () => void
  loading: boolean
}

export default function Image({ blobInfo, loading, style, onError }: Props) {
  const [dimension, setDimension] = React.useState<Dimension | null>(null)

  const imageInfoView = React.useMemo(() => (
    <>
      <div className={styles.gap}>图片大小：<span>{blobInfo ? humanizeStorageSize(blobInfo.size) : '-'}</span></div>
      <div className={styles.gap}>分辨率：<span>{dimension ? `${dimension.width} * ${dimension.height}` : '-'}</span></div>
    </>
  ), [blobInfo, dimension])

  const descView = React.useMemo(() => {
    // 有样式时显示样式信息
    if (style) {
      const scaleType = getStyleAbbreviationType(style.commands)
      const outputFormat = getStyleOutputFormat(style.commands)
      const quality = getStyleQuality(style.commands)
      return (
        <div className={styles.desc}>
          <div className={styles.gap}>样式名称：<span>{style.name || '未定义'}</span></div>
          {!!scaleType && <div className={styles.gap}>缩略方式：<span>{scaleType}</span></div>}
          {!!outputFormat && <div className={styles.gap}>图片格式：<span>{outputFormat}</span></div>}
          {!!quality && <div>图片质量：<span>{quality}</span></div>}
          {!scaleType && !outputFormat && !quality && imageInfoView}
        </div>
      )
    }

    return <div className={styles.desc}>{imageInfoView}</div>
  }, [style, imageInfoView])

  const handleLoad = React.useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setDimension({
      width: e.currentTarget.naturalWidth,
      height: e.currentTarget.naturalHeight
    })
  }, [])

  return (
    <Loading loading={loading}>
      {!loading ? descView : null}
      <div className={styles.skeleton}>
        <img src={blobInfo?.dataURL} onLoad={handleLoad} onError={onError} />
      </div>
    </Loading>
  )
}
