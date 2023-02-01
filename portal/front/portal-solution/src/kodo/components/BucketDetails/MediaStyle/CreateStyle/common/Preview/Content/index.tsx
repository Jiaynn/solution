/**
 * @description content component of preview
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import * as qs from 'query-string'
import { useInjection } from 'qn-fe-core/di'
import { Exception } from 'qn-fe-core/exception'
import { Loading, Tooltip } from 'react-icecream-2'
import { CloseCircleFilledIcon, HelpIcon } from 'react-icecream-2/icons'
import { MiddleEllipsisSpan } from 'kodo-base/lib/components/common/Paragraph'
import { ToasterStore } from 'portal-base/common/toaster'
import { proxyPrefix } from 'portal-base/common/apis/proxy'

import { getKodoResourceProxyUrl, resourceProxyApiPath } from 'kodo/utils/resource'

import { humanizeStorageSize } from 'kodo/transforms/unit'
import { humanizeDuration } from 'kodo/transforms/date-time'

import { useEvent, useMountedRef, useResourceProxyUrl } from 'kodo/hooks'

import { ImageStyleApis, MediaStyle } from 'kodo/apis/bucket/image-style'
import TranscodeCmdTip from '../TranscodeCmdTip'
import { MediaStyleType } from '../../constants'
import { useMediaStyleVideoConfig } from '../../hooks'
import Player from './Player'

import FullScreenIcon from './full-screen-icon.svg'

import styles from './style.m.less'

export type BlobInfo = {
  dataURL: string
  mimeType: string
  size: number // byte
}

export interface FileInfo {
  key: string
  size: number
  bucket: string
  mimeType: string
}

type UseBlobStoreProps = Pick<Props, 'bucketName' | 'refreshKey' | 'onLoadingChange' | 'fileInfo'> & { src?: string, shouldToaster?: boolean }

// 封装了请求资源的逻辑
// 通常情况下，在 src 变化的情况下，就要产生一次请求的副作用
// 但在产品的要求下，src 变化，不变化，只有当主动 refresh 并且只有在上次失败的情况下，才去发送请求
// 为满足这个需求，内部有个 optimizedRefresh，处理了这种需求
// 返回的 refresh 则是无条件的刷新
// 如果有 fileInfo 则不需要通过副作用去获取 blobInfo
export function useBlobStore(props: UseBlobStoreProps) {
  const { bucketName, fileInfo, src, refreshKey, onLoadingChange, shouldToaster = true } = props
  const toasterStore = useInjection(ToasterStore)
  const imageStyleApis = useInjection(ImageStyleApis)

  const fetchIdRef = React.useRef(0)
  const srcRef = React.useRef(src)
  const mountedRef = useMountedRef()
  const [info, setInfo] = React.useState<BlobInfo | null>(null)
  const [errInfo, setErrInfo] = React.useState<string>()
  const [isLoading, setLoading] = React.useState(false)
  const proxyUrl = useResourceProxyUrl(bucketName, src)

  const refresh = useEvent(() => {
    if (!proxyUrl) return

    setLoading(true)
    onLoadingChange?.(true)

    fetchIdRef.current += 1

    const currentFetchId = fetchIdRef.current

    imageStyleApis.getResource(proxyUrl)
      .then(res => (mountedRef.current ? res.blob() : undefined))
      .catch(e => {
        if (!mountedRef.current) return
        // 其实不准确，没有处理 blob() 的异常，但问题不大
        setErrInfo(e instanceof Exception && e.message || '请求失败')
        if (shouldToaster) toasterStore.error('预览失败')
        setInfo(null)
      })

      .then(blob => {
        if (!blob || currentFetchId !== fetchIdRef.current) {
          return
        }
        const size = blob.size
        const mimeType = blob.type
        const needRawURL = (!isVideo(mimeType) && !isImage(mimeType)) || isHLSMimeType(mimeType)
        setInfo({ mimeType, size, dataURL: needRawURL ? proxyUrl : URL.createObjectURL(blob) })
        setErrInfo(undefined)
      })

      .finally(() => {
        onLoadingChange?.(false)
        if (fetchIdRef.current === currentFetchId) {
          setLoading(false)
        }
      })
  })

  // ref: https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md#extracting-an-event-from-an-effect
  const optimizedRefresh = useEvent(() => {
    // src 没有变动且请求是正常的，或者有文件信息，则不发送请求
    if ((srcRef.current === src && !errInfo && info) || fileInfo) {
      srcRef.current = src
      if (fileInfo) {
        setInfo({
          dataURL: proxyUrl!,
          mimeType: fileInfo.mimeType,
          size: fileInfo.size
        })
        setErrInfo(undefined)
      }
      return
    }

    refresh()
    srcRef.current = src
  })

  // 短时间内可能触发多次，防抖解决很多莫名其妙的问题（最初是在签名的逻辑跟其他状态不在同一个 tick，导致变化多次)
  React.useEffect(() => {
    // 排除初始的 key
    if (!refreshKey) return
    const id = setTimeout(optimizedRefresh, 50)
    return () => clearTimeout(id)
  }, [optimizedRefresh, refreshKey])

  // 回收内存
  React.useEffect(() => () => {
    if (info?.dataURL) URL.revokeObjectURL(info?.dataURL)
  }, [info?.dataURL])

  // 没有提供资源链接
  if (!proxyUrl) {
    return null
  }

  return {
    info,
    setInfo,
    errInfo,
    setErrInfo,
    isLoading,
    refresh: optimizedRefresh
  }
}

export function isVideo(mimeType: string) {
  return mimeType.startsWith('video/')
}

export function isImage(mimeType: string) {
  return mimeType.startsWith('image/')
}

export function isHLSMimeType(mimeType: string) {
  return ['application/vnd.apple.mpegurl', 'application/x-mpegurl', 'audio/mpegurl'].includes(mimeType)
}

type MediaInfo = {
  duration: number
  width: number
  height: number
} | {
  width: number
  height: number
}

export type IoType = 'input' | 'output'

export interface Props {
  type: IoType
  mediaStyleType: MediaStyleType | null
  src: string
  style?: MediaStyle
  fileInfo?: FileInfo
  refreshKey?: number | string // 建议刷新的 key，变动时，是建议刷新
  bucketName: string
  errorText?: string
  notice?: React.ReactNode

  onMetaDataLoad?: (duration: number) => void
  onOpenFullScreen?: (type: IoType) => void // 此组件可能选其他的预览文件，所以需要传递 baseUrl 参数给外面
  onLoadingChange?: (isLoading: boolean) => void // 预览状态的变化
}

export default function Content(props: Props) {
  const { type, mediaStyleType, fileInfo, errorText, notice, onMetaDataLoad, onOpenFullScreen } = props
  const filename = fileInfo?.key

  const videoConfig = useMediaStyleVideoConfig(props.bucketName)
  const { isLoading, errInfo, setErrInfo, info: blobInfo, setInfo: setBlobInfo } = useBlobStore(props) || {}
  const [mediaInfo, setMediaInfo] = React.useState<MediaInfo | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)

  const handleOpenFullScreen = useEvent(() => {
    if (onOpenFullScreen) {
      onOpenFullScreen(type)
      setIsPlaying(false)
    }
  })

  const handleDurationChange = React.useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    if (e.currentTarget.duration != null) {
      setMediaInfo({
        duration: e.currentTarget.duration,
        width: e.currentTarget.videoWidth,
        height: e.currentTarget.videoHeight
      })
    }
    onMetaDataLoad?.(e.currentTarget.duration)
  }, [onMetaDataLoad])

  const handleImageLoad = React.useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setMediaInfo({
      width: e.currentTarget.naturalWidth,
      height: e.currentTarget.naturalHeight
    })
  }, [])

  const handleLoadError = useEvent(() => {
    if (setErrInfo) {
      const mimeTypeText = blobInfo?.mimeType && (isVideo(blobInfo.mimeType) || isHLSMimeType(blobInfo.mimeType))
        ? '视频'
        : '图片'
      setErrInfo(`加载${mimeTypeText}失败`)
      setBlobInfo!(null)
    }
  })

  const xhrSetup = React.useCallback((xhr: XMLHttpRequest, url: string) => {
    if (url.startsWith(window.location.origin) && !url.startsWith(window.location.origin + resourceProxyApiPath)) {
      const removePrefix = url.startsWith(window.location.origin + proxyPrefix)
        ? window.location.origin + proxyPrefix + '/'
        : window.location.origin + '/'
      const keyWithSearch = qs.exclude(url, ['e', 'token']).replace(removePrefix, '')
      const [key, q] = keyWithSearch.split('?')
      const newUrl = getKodoResourceProxyUrl({ bucket: props.bucketName, key, q: q && decodeURIComponent(q) })
      xhr.open('GET', newUrl, true)
    }
    // m3u8 在转码的时候会实时更新，消除缓存的影响
    xhr.setRequestHeader('Cache-Control', 'no-cache')
  }, [props.bucketName])

  const fullscreenIcon = React.useMemo(() => (
    <Tooltip title="全屏">
      <FullScreenIcon
        width={24}
        height={24}
        onClick={handleOpenFullScreen}
        className={styles.fullscreenIcon}
      />
    </Tooltip>
  ), [handleOpenFullScreen])

  // 同步播放器变化
  React.useLayoutEffect(() => {
    setIsPlaying(false)
  }, [blobInfo?.dataURL])

  const bodyView = React.useMemo(() => {
    if (isLoading) return
    if (notice) {
      return (
        <div className={styles.centerWrapper}>
          <span>{notice || '请刷新预览'}</span>
        </div>
      )
    }

    if (errorText || errInfo) {
      return (
        <div className={styles.centerWrapper}>
          <CloseCircleFilledIcon
            width={30}
            height={30}
            className={styles.errorIcon}
          />
          <div>{errorText || errInfo}</div>
        </div>
      )
    }

    // 到这里说明既没有 errInfo 也没有 blobInfo，只能是需要刷新预览了
    if (!blobInfo) {
      return (
        <div className={styles.centerWrapper}>
          <span>请刷新预览</span>
        </div>
      )
    }

    if (isVideo(blobInfo.mimeType) || isHLSMimeType(blobInfo.mimeType)) {
      return (
        <div className={styles.playerWrapper}>
          <Player
            src={blobInfo.dataURL}
            isPlaying={isPlaying}
            hlsConfig={isHLSMimeType(blobInfo.mimeType) ? { xhrSetup } : undefined}
            onIsPlayingChange={setIsPlaying}
            onDurationChange={handleDurationChange}
            onError={handleLoadError}
          />
          {fullscreenIcon}
        </div>
      )
    }

    return (
      <div className={styles.imageWrapper}>
        <div className={styles.media}>
          {!!blobInfo.dataURL && <img src={blobInfo.dataURL} onLoad={handleImageLoad} onError={handleLoadError} />}
        </div>
        {fullscreenIcon}
      </div>
    )
  }, [
    isLoading, isPlaying, notice,
    blobInfo, errInfo, errorText, fullscreenIcon,
    handleImageLoad, handleLoadError, handleDurationChange, xhrSetup
  ])

  const videoDescView = !notice && !errInfo && !!(mediaInfo && 'duration' in mediaInfo) && (
    <span>（时长：{humanizeDuration(mediaInfo.duration)}，分辨率：{mediaInfo.width}*{mediaInfo.height}）</span>
  )

  const imgDescView = !notice && !errInfo && !!mediaInfo && !('duration' in mediaInfo) && (
    <span>（大小：{humanizeStorageSize(blobInfo?.size || 0)}，分辨率：{mediaInfo.width}*{mediaInfo.height}）</span>
  )

  const getH256TipView = () => {
    if (!mediaStyleType || mediaStyleType === MediaStyleType.Image) {
      return null
    }

    const view = (
      <Tooltip title="暂不支持 H.265 编码视频的预览" placement="top">
        <HelpIcon className={styles.helpIcon} />
      </Tooltip>
    )

    if (mediaStyleType === MediaStyleType.Manual) {
      return videoConfig?.enable && view
    }

    if (mediaStyleType === MediaStyleType.VideoCover) {
      return type === 'input' && view
    }

    return view
  }

  const headView = (
    <div className={styles.head}>
      <span>{type === 'input' ? '源文件' : '处理结果'}</span>
      {imgDescView}
      {videoDescView}
      {getH256TipView()}
    </div>
  )

  const tipView = type === 'output' && !!blobInfo?.mimeType && isHLSMimeType(blobInfo?.mimeType) && <TranscodeCmdTip />

  return (
    <Loading loading={!!isLoading}>
      {headView}
      <div className={styles.body}>{bodyView}</div>
      {!!filename && (
        <div className={styles.filename}>
          <MiddleEllipsisSpan
            key={filename}
            title={filename}
            text={filename}
            maxRows={2}
          />
        </div>
      )}
      {tipView}
    </Loading>
  )
}
