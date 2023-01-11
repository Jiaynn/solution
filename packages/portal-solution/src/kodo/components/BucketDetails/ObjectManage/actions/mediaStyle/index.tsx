/**
 * @description extra actions
 * @author duli <duli@qiniu.com>
 */

import React, { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { Button, Tooltip } from 'react-icecream-2'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { FileObject, SingleObjectAction } from 'kodo-base/lib/components/ObjectManager/common/types'
import { FileStatus, StorageType } from 'kodo-base/lib/constants'
import { ListItem, OnCreateSingleActions } from 'kodo-base/lib/components/ObjectManager'
import { ExternalUrlModalStore } from 'kodo-base/lib/components/common/ExternalUrlModal/store'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import { KodoIamStore } from 'kodo/stores/iam'
import { ConfigStore } from 'kodo/stores/config'
import { BucketStore } from 'kodo/stores/bucket'

import { useModalState } from 'kodo/hooks'

import { MediaStyle } from 'kodo/apis/bucket/image-style'
import { getCommandsWithoutSourceFormat } from '../../../MediaStyle/CreateStyle/common/command'
import { MediaStyleType, mediaStyleTypeNameMap } from '../../../MediaStyle/CreateStyle/common/constants'
import { CreateMediaStyleResult, MediaStyleDrawerStore } from '../../../MediaStyle/CreateStyle/common/Drawer/store'
import { allowPreviewMimeTypeList as imagePreViewTypeList } from '../../../MediaStyle/CreateStyle/image/constants'
import { allowPreviewMimeTypeList as videoCoverPreViewTypeList } from '../../../MediaStyle/CreateStyle/video/utils'
import { allowPreviewMimeTypeList as transcodePreViewTypeList } from '../../../MediaStyle/CreateStyle/video/Transcode/constants'
import StyleAccessUrlModal from './StyleAccessUrlModal'

import styles from './style.m.less'

const imageMaxSize = 1024 ** 2 * 20 // 20MB
const videoMaxSize = 1024 ** 2 * 500 // 500MB

/**
 * 禁用、归档、深度归档文件，大于 20MB 的图片文件和大于 500MB 的视频文件不可以预览
 */
function check(object: FileObject<ListItem>, maxSize: number) {
  if (
    object.details.status === FileStatus.Disabled
    || object.storageType === StorageType.Archive
    || object.storageType === StorageType.DeepArchive
  ) {
    return false
  }

  return object.details.fsize <= maxSize
}

const sensorStyleCreateKeyMap = {
  [MediaStyleType.Image]: 'portalKodo@resourceV2-fileOperate-image-styleCreate',
  [MediaStyleType.VideoCover]: 'portalKodo@resourceV2-fileOperate-videoCover-styleCreate',
  [MediaStyleType.VideoTranscode]: 'portalKodo@resourceV2-fileOperate-videoTranscode-styleCreate'
  // [MediaStyleType.VideoWatermark]: 'TODO',
}

const sensorGetStyleURLKeyMap = {
  [MediaStyleType.Image]: 'portalKodo@resourceV2-fileOperate-image-getStyleURL',
  [MediaStyleType.VideoCover]: 'portalKodo@resourceV2-fileOperate-videoCover-getStyleURL',
  [MediaStyleType.VideoTranscode]: 'portalKodo@resourceV2-fileOperate-videoTranscode-getStyleURL'
  // [MediaStyleType.VideoWatermark]: 'TODO',
}

interface OpenMediaStyleDrawerActionProps {
  bucketName: string
  type: MediaStyleType
  object: FileObject<ListItem>
  onSuccess?: (list: MediaStyle[]) => void
}

const OpenMediaStyleDrawerAction = observer((props: OpenMediaStyleDrawerActionProps) => {
  const { bucketName, type, object, onSuccess } = props
  const sensorStyleCreateKey = sensorStyleCreateKeyMap[type]
  const [savedStyleList, setSavedStyleList] = useState<MediaStyle[]>([])

  const styleAccessUrlModalState = useModalState()
  const mediaStyleDrawerStore = useInjection(MediaStyleDrawerStore)

  const handleMediaStyleDrawerClose = useCallback(
    (result: CreateMediaStyleResult) => {
      if (!result.success) return
      setSavedStyleList(result.newMediaStyleList || [])
      onSuccess?.(result.allMediaStyleList || [])
      if (result.newMediaStyleList) {
        styleAccessUrlModalState.open()
      }
    },
    [styleAccessUrlModalState, onSuccess]
  )

  const openMediaStyleDrawer = useCallback(() => {
    mediaStyleDrawerStore
      .open({
        initType: type,
        initFileObject: {
          bucket: bucketName,
          size: object.details.fsize,
          key: object.fullPath,
          mimeType: object.details.mimeType
        }
      })
      .then(handleMediaStyleDrawerClose)
  }, [handleMediaStyleDrawerClose, bucketName, mediaStyleDrawerStore, object, type])

  const styleAccessUrlModalView = (
    <StyleAccessUrlModal
      bucketName={bucketName}
      styleList={savedStyleList}
      visible={styleAccessUrlModalState.visible}
      onCancel={styleAccessUrlModalState.close}
      fileKey={mediaStyleDrawerStore.initFileObject?.key}
    />
  )

  return (
    <>
      <Button
        type="text"
        className={styles.extraAction}
        onClick={openMediaStyleDrawer}
        {...sensorsTagFlag(sensorStyleCreateKey)}
      >
        新建样式
      </Button>
      {styleAccessUrlModalView}
    </>
  )
})

interface OpenExternalUrlModalActionProps {
  type: MediaStyleType
  isPrivateBucket: boolean
  hasBaseUrl: boolean
  object: FileObject<ListItem>
  mediaStyleConfig?: {
    getList: (mimeType: string, extension: string) => Promise<MediaStyle[]>
    separatorList: Array<{ value: string; label: string }>
  }
}

const OpenExternalUrlAction = observer((props: OpenExternalUrlModalActionProps) => {
  const { type, isPrivateBucket, hasBaseUrl, object, mediaStyleConfig } = props
  const sensorGetStyleURLKey = sensorGetStyleURLKeyMap[type]

  const [isLoading, setIsLoading] = useState(false)
  const [mediaStyleList, setMediaStyleList] = useState<MediaStyle[]>([])

  const externalUrlModalStore = useInjection(ExternalUrlModalStore)

  const disabled = !mediaStyleList.length || !hasBaseUrl

  const cause = !mediaStyleList.length ? '无可用样式' : '无可用域名'

  useEffect(() => {
    if (!mediaStyleConfig) {
      return
    }

    const extension = object.basename.split('.').pop()
    mediaStyleConfig
      .getList(object.details.mimeType, extension || '')
      .then(list => {
        const newList = list.filter(mediaStyle => {
          const commands = getCommandsWithoutSourceFormat(mediaStyle.commands)
          switch (type) {
            case MediaStyleType.Image:
              return true // 在 getList 里已经筛选过了（在 store 里面）
            case MediaStyleType.VideoCover:
              return commands.startsWith('vframe')
            case MediaStyleType.VideoTranscode:
              return commands.startsWith('avhls')
            default:
              return true
          }
        })

        setMediaStyleList(newList)
      })
      .finally(() => setIsLoading(false))

    // 初始化
  }, [mediaStyleConfig, object.basename, object.details.mimeType, type])

  const openMediaStyleDrawer = () => {
    externalUrlModalStore.open({
      title: '获取样式链接',
      objects: {
        basename: object.basename,
        fullPath: object.fullPath,
        mimeType: object.details.mimeType
      },
      isPrivateBucket,
      mediaStyleConfig: mediaStyleConfig && {
        mediaStyleList,
        separatorList: mediaStyleConfig.separatorList
      }
    })
  }

  const btnView = (
    <Button
      type="text"
      loading={isLoading}
      disabled={disabled}
      className={styles.extraAction}
      onClick={openMediaStyleDrawer}
      {...sensorsTagFlag(sensorGetStyleURLKey)}
      style={disabled ? { pointerEvents: 'none' } : undefined}
    >
      获取样式链接
    </Button>
  )

  if (disabled) {
    // tooltip 搭配 disabled btn 工作不正常
    // ref: https://github.com/react-component/tooltip/issues/18#issuecomment-411476678
    return (
      <Tooltip title={cause} placement="left">
        <div style={{ cursor: 'not-allowed' }}>{btnView}</div>
      </Tooltip>
    )
  }

  return btnView
})

interface Props {
  bucketName: string
  region?: string
  hasBaseUrl?: boolean
  mediaStyleConfig?: OpenExternalUrlModalActionProps['mediaStyleConfig']
  updateMediaStyleList: (list: MediaStyle[]) => void
}

export function useMediaStyleActions(props: Props) {
  const { bucketName, region, hasBaseUrl, mediaStyleConfig, updateMediaStyleList } = props
  const configStore = useInjection(ConfigStore)
  const featureStore = useInjection(FeatureConfigStore)
  const bucketStore = useInjection(BucketStore)
  const iamStore = useInjection(KodoIamStore)

  function getIsMediaStyeVisible(video = false) {
    const regionConfig = region != null ? configStore.getRegion({ region }) : undefined

    if (!regionConfig || !regionConfig.dora.mediaStyle.enable) {
      return false
    }

    // 检查 feature
    if (featureStore.isDisabled('KODO.KODO_MEDIA_STYLE')) {
      return false
    }

    if (video && !regionConfig.dora.mediaStyle.video.enable) {
      return false
    }

    if (video && featureStore.isDisabled('KODO.KODO_MEDIA_STYLE_VIDEO')) {
      return false
    }

    // 检查 iam 权限
    if (
      iamStore.isActionDeny({ actionName: 'GetBucketStyle', resource: bucketName })
      && iamStore.isActionDeny({ actionName: 'PutImageStyle', resource: bucketName })
    ) {
      return false
    }

    return !bucketStore.isShared(bucketName)
  }

  const isPrivateBucket = !!bucketStore.getDetailsByName(bucketName)?.private

  const isMediaStyleVisible = getIsMediaStyeVisible()
  const isVideoMediaStyleVisible = getIsMediaStyeVisible(true)

  const isOpenMediaStyleDrawerActionHidden = iamStore.isActionDeny({ actionName: 'GetBucketStyle', resource: bucketName })
    || iamStore.isActionDeny({ actionName: 'PutImageStyle', resource: bucketName })

  const isOpenExternalUrlActionHidden = iamStore.isActionDeny({ actionName: 'GetBucketStyle', resource: bucketName })
    || iamStore.isActionDeny({ actionName: 'SetSeparator', resource: bucketName })

  const styleActionBuilder = useCallback(
    (type: MediaStyleType, allowTypeList: string[], maxSize: number, versionEnabled: boolean) => (
      // eslint-disable-next-line react/display-name
      (object: FileObject<ListItem>) => {
        if (isOpenMediaStyleDrawerActionHidden && isOpenExternalUrlActionHidden) {
          return null
        }

        if (!isMediaStyleVisible || object.type !== 'file' || versionEnabled) {
          return null
        }

        // 这几个要单独判断视频相关的控制
        if ([MediaStyleType.VideoCover, MediaStyleType.VideoTranscode, MediaStyleType.VideoWatermark].includes(type)) {
          if (!isVideoMediaStyleVisible) return null
        }

        const openMediaStyleDrawerActionView = !isOpenMediaStyleDrawerActionHidden && (
          <OpenMediaStyleDrawerAction
            bucketName={bucketName}
            type={type}
            object={object}
            onSuccess={updateMediaStyleList}
          />
        )

        const openExternalUrlActionView = !isOpenExternalUrlActionHidden && (
          <OpenExternalUrlAction
            type={type}
            object={object}
            isPrivateBucket={isPrivateBucket}
            mediaStyleConfig={mediaStyleConfig}
            hasBaseUrl={!!hasBaseUrl}
          />
        )

        if (allowTypeList.includes(object.details.mimeType) && check(object, maxSize)) {
          return {
            title: `${mediaStyleTypeNameMap[type]}样式`,
            actions: [openMediaStyleDrawerActionView, openExternalUrlActionView].filter(Boolean)
          }
        }
      }),
    [
      isMediaStyleVisible,
      isOpenMediaStyleDrawerActionHidden,
      bucketName,
      isOpenExternalUrlActionHidden,
      isPrivateBucket,
      mediaStyleConfig,
      updateMediaStyleList,
      hasBaseUrl,
      isVideoMediaStyleVisible
    ]
  )

  const actionsRender = useCallback<OnCreateSingleActions>((versionEnabled: boolean) => {
    function filterNull<T extends SingleObjectAction<unknown>>(v: T): v is NonNullable<T> {
      return v != null && v.render != null
    }

    const styleActions: Array<SingleObjectAction<ListItem>> = [
      {
        sort: 1.1, // 复制外链后面
        render: styleActionBuilder(MediaStyleType.Image, imagePreViewTypeList, imageMaxSize, versionEnabled)
      },
      {
        sort: 1.2,
        render: styleActionBuilder(MediaStyleType.VideoCover, videoCoverPreViewTypeList, videoMaxSize, versionEnabled)
      }
      // {
      //   sort: 1.3,
      //   render: styleActionBuilder(
      //     MediaStyleType.VideoWatermark,
      //     waterMarkPreViewTypeList,
      //     videoMaxSize,
      //     versionEnabled
      //   )
      // }
    ]
    if (!isPrivateBucket) {
      styleActions.push({
        sort: 1.4,
        render: styleActionBuilder(
          MediaStyleType.VideoTranscode,
          transcodePreViewTypeList,
          videoMaxSize,
          versionEnabled
        )
      })
    }

    return styleActions.filter(filterNull)
  }, [isPrivateBucket, styleActionBuilder])

  return actionsRender
}
