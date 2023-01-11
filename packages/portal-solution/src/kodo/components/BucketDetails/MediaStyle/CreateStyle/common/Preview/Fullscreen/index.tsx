/**
 * @description media style image full screen preview
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React, { useEffect, useMemo, useRef } from 'react'
import { observer } from 'mobx-react'
import * as qs from 'query-string'
import { Modal, Button } from 'react-icecream-2'
import { CloseCircleFilledIcon } from 'react-icecream-2/icons'
import { useInjection } from 'qn-fe-core/di'
import { proxyPrefix } from 'portal-base/common/apis/proxy'

import { getKodoResourceProxyUrl, resourceProxyApiPath } from 'kodo/utils/resource'

import { getImagePreviewUrl } from 'kodo/transforms/image-style'

import { BucketStore } from 'kodo/stores/bucket'

import { MediaStyle } from 'kodo/apis/bucket/image-style'

import { allowPickAccept as videoAllowPickAccept } from '../../../video/utils'
import { allowPickAccept as imageAllowPickAccept } from '../../../image/constants'
import { allowPickAccept as transcodeAllowPickAccept } from '../../../video/Transcode/constants'
import { allowPickAccept as watermarkAllowPickAccept } from '../../../video/Watermark/constants'
import { getSourceFormat, getStyledFileKey, useCommands } from '../../command'
import { useMediaStyleImageConfig } from '../../hooks'
import { MediaStyleType, videoTypes } from '../../constants'
import { FileInfo, isHLSMimeType, isImage, isVideo, useBlobStore } from '../Content'
import { useObjectPick } from '..'

import Video from './Video'
import Image from './Image'

import styles from './style.m.less'

type Visible = {
  visible: boolean
  onClose(): void
}

interface Props {
  style?: MediaStyle
  // 默认预览信息
  defaultPreviewInfo?: { src: string, fileInfo?: FileInfo}
  bucketName: string

  // 某些入口打开的全屏预览不允许切换预览文件
  showPicker?: boolean
}

// 纯粹是想把 useBlobStore 延迟触发
function Body(props: Props & { url: string }) {
  const { style, url, bucketName, showPicker } = props
  const blobStore = useBlobStore({ bucketName, src: url, fileInfo: props.defaultPreviewInfo?.fileInfo })
  const [hasError, setHasError] = React.useState(false)

  const handleError = React.useCallback(() => setHasError(true), [])

  const xhrSetup = React.useCallback((xhr: XMLHttpRequest, oldUrl: string) => {
    if (
      oldUrl.startsWith(window.location.origin)
      && !oldUrl.startsWith(window.location.origin + resourceProxyApiPath)
    ) {
      const removePrefix = oldUrl.startsWith(window.location.origin + proxyPrefix)
        ? window.location.origin + proxyPrefix + '/'
        : window.location.origin + '/'
      const keyWithSearch = qs.exclude(oldUrl, ['e', 'token']).replace(removePrefix, '')
      const [key, q] = keyWithSearch.split('?')
      const newUrl = getKodoResourceProxyUrl({ bucket: props.bucketName, key, q: q && decodeURIComponent(q) })
      xhr.open('GET', newUrl, true)
    }
    // m3u8 在转码的时候会实时更新，消除缓存的影响
    xhr.setRequestHeader('Cache-Control', 'no-cache')
  }, [props.bucketName])

  // 初始化
  useEffect(() => {
    blobStore?.refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 实际上 url 为空的时候，blobStore 也为空
  if (!url || !blobStore) {
    return showPicker ? <div className={styles.skeleton}><span>请选择预览文件</span></div> : null
  }

  if (blobStore.isLoading) {
    return (
      <div className={styles.skeleton}>加载中...</div>
    )
  }

  if (blobStore.errInfo || hasError) {
    return (
      <div className={styles.skeleton}>
        <CloseCircleFilledIcon
          width={30}
          height={30}
          className={styles.errorIcon}
        />
        <div>{blobStore.errInfo ?? '加载资源失败'}</div>
      </div>
    )
  }

  if (blobStore.info?.mimeType && (isVideo(blobStore.info?.mimeType) || isHLSMimeType(blobStore.info?.mimeType))) {
    return (
      <Video
        loading={blobStore.isLoading}
        styleName={style?.name}
        src={blobStore?.info?.dataURL}
        hlsConfig={isHLSMimeType(blobStore.info.mimeType) ? { xhrSetup } : undefined}
        onError={handleError}
      />
    )
  }

  if (blobStore.info?.mimeType && isImage(blobStore.info?.mimeType)) {
    return (
      <Image
        loading={!!blobStore?.isLoading}
        style={style}
        blobInfo={blobStore?.info}
        onError={handleError}
      />
    )
  }

  return null
}

const Preview = observer((props: Props) => {
  const {
    style,
    defaultPreviewInfo,
    bucketName,
    showPicker = false
  } = props

  const commands = useCommands()
  const bucketStore = useInjection(BucketStore)
  const [type, setType] = React.useState<MediaStyleType | null>(null)
  const mediaStyleImageConfig = useMediaStyleImageConfig(props.bucketName)

  const separator = React.useMemo(() => {
    const list = bucketStore.getDetailsByName(bucketName)?.separator || ''
    return list.includes('-') ? '-' : list[0]
  }, [bucketName, bucketStore])

  React.useEffect(() => {
    if (!style) return setType(null)
    let ignore = false

    commands.getMediaStyleType(style)
      .then(newType => !ignore && setType(newType))

    return () => { ignore = true }
  }, [commands, style])

  const getConfigUrl = () => {
    // 只有非 video 的时候才读配置
    const url = (!videoTypes.includes(type!) && mediaStyleImageConfig?.defaultImageUrl) || ''
    return url ? getImagePreviewUrl(url, style?.commands) : ''
  }

  // 配置的预览链接
  const configUrl = getConfigUrl()

  const objectPick = useObjectPick(bucketName, type)
  const lastPicked = useRef<FileInfo>()
  const pickedTimes = useRef(0)
  const sourcePreviewFile = objectPick.file || defaultPreviewInfo?.src || configUrl

  // 判断是否重新选中了文件，注意即使跟上次选中的同一个文件，引用也是不一样的，虽然 key 一样
  if (lastPicked.current !== objectPick.file) {
    lastPicked.current = objectPick.file
    pickedTimes.current += 1
  }

  const outputPreviewUrl = React.useMemo(() => {
    if (typeof sourcePreviewFile === 'string') {
      return sourcePreviewFile
    }

    return getKodoResourceProxyUrl({
      bucket: sourcePreviewFile.bucket,
      key: style ? getStyledFileKey(sourcePreviewFile.key, style, separator) : sourcePreviewFile.key
    })
  }, [separator, sourcePreviewFile, style])

  const accepts = useMemo(() => {
    // 如果没有开启选择器或者还在解析命令中
    if (!showPicker || type == null) return

    // 只有在使用样式名方式预览时，才限制选择文件
    const suffix = style ? getSourceFormat(style.commands) : null

    const suffixes = suffix ? [`.${suffix}`] : undefined

    const imageAccept = { ...imageAllowPickAccept, suffixes }
    const videoAccept = { ...videoAllowPickAccept, suffixes }
    const transcodeAccept = { ...transcodeAllowPickAccept, suffixes }
    const watermarkAllowAccept = { ...watermarkAllowPickAccept, suffixes }

    switch (type) {
      case MediaStyleType.Image:
        return [imageAccept]
      case MediaStyleType.VideoCover:
        return [videoAccept]
      case MediaStyleType.VideoTranscode:
        return [transcodeAccept]
      case MediaStyleType.VideoWatermark:
        return [watermarkAllowAccept]
      default:
        return [imageAccept, videoAccept, transcodeAccept, watermarkAllowAccept]
    }
  }, [showPicker, type, style])

  const handlePick = () => objectPick.pick(accepts)

  const parsingView = <div className={styles.skeleton}>解析样式中...</div>

  const bodyView = (
    <Body
      {...props}
      key={outputPreviewUrl + pickedTimes.current} // 这样是避免 url 变化的时候，内部的 loading 是个状态，会延迟 url 的变化
      url={outputPreviewUrl}
    />
  )

  // 当有样式时，会有解析状态
  const isParsing = style && type === null

  return (
    <div className={styles.modalContent}>
      <div className={styles.modalTitle}>
        <span>{style ? '样式结果预览' : '源文件预览'}</span>
        {showPicker && (
          <Button
            type="link"
            className={styles.selectFileBtn}
            onClick={handlePick}
            disabled={!objectPick.store.hasPermission(props.bucketName)}
          >
            选择预览文件
          </Button>
        )}
      </div>
      {isParsing ? parsingView : bodyView}
    </div>
  )
})

export default observer(function FullScreenPreviewModal(props: Props & Visible) {
  const { visible, onClose } = props

  return (
    <Modal
      title={null}
      autoDestroy
      footer={null}
      visible={visible}
      onCancel={() => onClose()}
      className={styles.viewModal}
    >
      <Preview {...props} />
    </Modal>
  )
})
