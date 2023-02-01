/**
 * @description preview component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { Accept } from 'kodo-base/lib/components/ObjectManager/ObjectList/Picker'
import { Button } from 'react-icecream-2'

import { getKodoResourceProxyUrl } from 'kodo/utils/resource'

import { getImagePreviewUrl } from 'kodo/transforms/image-style'

import { useEvent, useModalState } from 'kodo/hooks'

import Prompt from 'kodo/components/common/Prompt'
import { ObjectPickerStore, isUploadResult } from 'kodo/components/common/ObjectPickerModal/store'
import { getCommandsWithoutSourceFormat, truncateVideo } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/command'

import { MediaStyle } from 'kodo/apis/bucket/image-style'

import { allowPickAccept as watermarkAllowPickAccept } from '../../video/Watermark/constants'
import { allowPickAccept as transcodeAllowPickAccept } from '../../video/Transcode/constants'
import { allowPickAccept as imageAllowPickAccept } from '../../image/constants'
import { allowPickAccept as videoAllowPickAccept } from '../../video/utils'
import { appendPreviewParams } from '../../video/Transcode/command'
import { MediaStyleType, videoTypes } from '../constants'
import { useMediaStyleImageConfig, useMediaStyleVideoConfig } from '../hooks'

import AccessUrl, { getExampleFileKey } from './AccessUrl'
import FullScreenPreviewModal from './Fullscreen'
import Content, { FileInfo, IoType } from './Content'
import TimeSliceModal, { TimeSlice } from './TimeSliceModal'

import styles from './style.m.less'

function getMimeTypeList(styleType: MediaStyleType | null, videoEnabled: boolean): Accept[] {
  if (styleType === MediaStyleType.Image) {
    return [imageAllowPickAccept]
  }

  if (styleType === MediaStyleType.VideoCover) {
    return [videoAllowPickAccept]
  }

  if (styleType === MediaStyleType.VideoWatermark) {
    return [watermarkAllowPickAccept]
  }

  if (styleType === MediaStyleType.VideoTranscode) {
    return [transcodeAllowPickAccept]
  }

  if (videoEnabled) {
    // 无法定位具体类型且 video 配置开启的情况下允许选择支持的全部类型
    return [
      imageAllowPickAccept,
      {
        ...videoAllowPickAccept,
        mimeTypes: Array.from(new Set([
          ...videoAllowPickAccept.mimeTypes,
          ...watermarkAllowPickAccept.mimeTypes,
          ...transcodeAllowPickAccept.mimeTypes
        ]))
      }
    ]
  }

  return [imageAllowPickAccept]
}

function getObjectPickTitle(styleType: MediaStyleType | null): string {
  if ([
    MediaStyleType.VideoCover,
    MediaStyleType.VideoTranscode,
    MediaStyleType.VideoWatermark
  ].includes(styleType!)) return '请选择视频文件'

  if (styleType === MediaStyleType.Image) return '请选择图片文件'

  return '请选择图片或视频文件'
}

export function useObjectPick(bucketName: string, mediaStyleType: MediaStyleType | null) {
  const objectPickerStore = useInjection(ObjectPickerStore)
  const mediaStyleVideoConfig = useMediaStyleVideoConfig(bucketName)
  const [file, setFile] = React.useState<FileInfo | undefined>()

  const pick = useEvent(async (accepts?: Accept[]) => {
    // 重新打开选择文件要清空一下错误信息
    const picked = await objectPickerStore.pick({
      bucket: bucketName,
      accepts: accepts || getMimeTypeList(mediaStyleType, !!mediaStyleVideoConfig?.enable),
      title: getObjectPickTitle(mediaStyleType)
    })

    if (picked == null) return

    const pickedFile = isUploadResult(picked)
      ? {
        key: picked.key,
        size: picked.fsize,
        bucket: bucketName,
        mimeType: picked.mimeType
      }
      : {
        key: picked.fullPath,
        size: picked.details.fsize,
        bucket: bucketName,
        mimeType: picked.details.mimeType
      }

    setFile(pickedFile)
  })

  const reset = useEvent(async () => {
    objectPickerStore.setPicketed(undefined)
    setFile(undefined)
  })

  return React.useMemo(() => ({
    pick, reset, file, store: objectPickerStore
  }), [pick, reset, file, objectPickerStore])
}

export function useOutputPreviewUrl(file: string | FileInfo, commands?: string) {
  const fileKey = typeof file === 'string' ? file : file.key

  // 针对 avhls 的特殊处理
  const newCommands = commands ? appendPreviewParams(fileKey, commands) : commands

  const getPreviewUrl = () => (
    typeof file === 'string'
      ? file && getImagePreviewUrl(file, newCommands) // 空字符串原样返回
      : getKodoResourceProxyUrl({ ...file, q: getCommandsWithoutSourceFormat(newCommands) })
  )

  const [previewUrl, setPreviewUrl] = React.useState(getPreviewUrl())
  const [refreshKey, setRefreshKey] = React.useState(0)

  const refresh = useEvent(() => {
    if (file) {
      setPreviewUrl(getPreviewUrl())
    }

    setRefreshKey(pre => pre + 1)
  })

  return [
    previewUrl,
    refreshKey,
    refresh
  ] as const
}

export interface Props {
  style?: MediaStyle
  bucketName: string
  defaultPreviewFile?: FileInfo // 默认选中此文件预览
  type: MediaStyleType | null
  onFileKeyChange?: (value: string) => void
}

export default observer(function Preview(props: Props) {
  const {
    type,
    style,
    bucketName,
    onFileKeyChange,
    defaultPreviewFile
  } = props

  const fullscreenModalState = useModalState()
  const timeSliceModalState = useModalState()
  const objectPick = useObjectPick(bucketName, type)
  const mediaStyleImageConfig = useMediaStyleImageConfig(bucketName)
  const [isPreviewingOutput, setIsPreviewingOutput] = React.useState(false)
  const [currentFullscreenTarget, setCurrentFullscreenTarget] = React.useState<IoType | null>(null)
  const [timeSlice, setTimeSlice] = React.useState({ start: 0, duration: 60 })
  const [videoDuration, setVideoDuration] = React.useState(0)

  // 配置的默认预览链接（只针对图片，视频必须用户自己选择）
  const defaultSourceUrl = (!videoTypes.includes(type!) && mediaStyleImageConfig?.defaultImageUrl) || ''

  const sourcePreviewFile = props.defaultPreviewFile || objectPick.file || defaultSourceUrl

  const sourcePreviewUrl = typeof sourcePreviewFile === 'object'
    ? getKodoResourceProxyUrl(sourcePreviewFile)
    : defaultSourceUrl

  const truncatedResult = truncateVideo(type, style?.commands || '', timeSlice.start, timeSlice.duration)

  const truncatedCommands = typeof truncatedResult === 'boolean'
    ? style?.commands || ''
    : truncatedResult

  const [outputPreviewUrl, refreshKey, refreshOutputPreviewUrl] = useOutputPreviewUrl(
    sourcePreviewFile,
    truncatedCommands
  )

  const exampleFileKey = getExampleFileKey(type, sourcePreviewFile, mediaStyleImageConfig?.defaultImageUrl)

  const handleOpenFullScreen = useEvent((ioType: IoType) => {
    fullscreenModalState.open()
    setCurrentFullscreenTarget(ioType)
  })

  const contentNoticeView = React.useMemo(() => (
    // 没有预览文件且选择文件没有发生错误时告知用户选择文件（选择文件可能会有域名相关的错误，此时是有 fileKey 的）
    !sourcePreviewFile ? '请选择样例文件' : null
  ), [sourcePreviewFile])

  const handlePicked = useEvent(() => {
    if (!onFileKeyChange) return

    // 用户自己的文件
    if (objectPick.file) {
      onFileKeyChange(objectPick.file.key)
      // 刷新一下预览
      // refreshOutputPreviewUrl()
    }
  })

  const handlePick = () => objectPick.pick().then(handlePicked)

  // 初始化时，同步一下使用默认系统文件的情况
  // mark: 其实为了语义更明确，可以用 useEvent 包一下，可以进一步减少 deps
  React.useEffect(() => {
    if (onFileKeyChange && exampleFileKey) onFileKeyChange(exampleFileKey)
  }, [exampleFileKey, onFileKeyChange])

  const handleTimeSliceChange = (slice: TimeSlice) => {
    setTimeSlice(slice)
    timeSliceModalState.close()
    Promise.resolve().then(refreshOutputPreviewUrl)
  }

  const shouldShowTruncate = !!truncatedResult && !!outputPreviewUrl

  const fullscreenStyle: MediaStyle = React.useMemo(
    () => ({ ...style!, commands: truncatedResult || style?.commands || '' }),
    [style, truncatedResult]
  )

  const fullscreenPreviewInfo = currentFullscreenTarget === 'input'
    ? { src: sourcePreviewUrl, fileInfo: objectPick.file } // 输入是已经有了获取文件信息
    : { src: outputPreviewUrl } // 输出是不带文件信息的

  return (
    <div className={styles.preview}>
      <Content
        type="input"
        mediaStyleType={type}
        src={sourcePreviewUrl}
        bucketName={bucketName}
        refreshKey={sourcePreviewUrl}
        notice={contentNoticeView}
        onOpenFullScreen={handleOpenFullScreen}
        fileInfo={objectPick.file || defaultPreviewFile}
        onMetaDataLoad={truncatedResult ? setVideoDuration : undefined}
      />
      <div className={styles.buttonGroup}>
        {!defaultPreviewFile && (
          <Button
            onClick={handlePick}
            disabled={!objectPick.store.hasPermission(props.bucketName)}
          >
            选择样例文件
          </Button>
        )}
        <Button
          type="secondary"
          loading={isPreviewingOutput}
          onClick={refreshOutputPreviewUrl}
        >预览</Button>
      </div>
      <AccessUrl
        type={type}
        style={style}
        bucketName={bucketName}
        defaultPreviewFile={defaultPreviewFile}
        sourcePreviewFile={sourcePreviewFile}
        pickedFile={objectPick.file}
      />
      <Content
        type="output"
        mediaStyleType={type}
        style={style}
        src={outputPreviewUrl}
        refreshKey={refreshKey}
        bucketName={bucketName}
        notice={contentNoticeView}
        onLoadingChange={setIsPreviewingOutput}
        onOpenFullScreen={handleOpenFullScreen}
      />
      {shouldShowTruncate && (
        <Prompt className={styles.truncate}>
          <span>处理结果由源文件截取 {timeSlice.duration}s 生成。</span>
          <Button type="link" onClick={timeSliceModalState.open}>调整截取时段</Button>
        </Prompt>
      )}
      <FullScreenPreviewModal
        bucketName={bucketName}
        defaultPreviewInfo={fullscreenPreviewInfo}
        onClose={fullscreenModalState.close}
        visible={fullscreenModalState.visible}
        style={currentFullscreenTarget === 'output' ? fullscreenStyle : undefined}
      />
      <TimeSliceModal
        videoDuration={videoDuration}
        timeSlice={timeSlice}
        visible={timeSliceModalState.visible}
        onOk={handleTimeSliceChange}
        onCancel={timeSliceModalState.close}
      />
    </div>
  )
})
