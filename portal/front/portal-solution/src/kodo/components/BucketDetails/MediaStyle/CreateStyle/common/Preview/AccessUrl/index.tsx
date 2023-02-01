/**
 * @description access url
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Tooltip } from 'react-icecream-2'
import { HelpIcon } from 'react-icecream-2/icons'
import { MiddleEllipsisSpan } from 'kodo-base/lib/components/common/Paragraph'

import { BucketStore } from 'kodo/stores/bucket'

import Prompt from 'kodo/components/common/Prompt'

import { MediaStyle } from 'kodo/apis/bucket/image-style'
import { getSourceFormat, getStyledFileKey } from '../../command'
import { MediaStyleType, videoTypes } from '../../constants'
import { useMediaStyleImageConfig } from '../../hooks'
import { FileInfo } from '../Content'

import styles from '../style.m.less'

const exampleFileBasename = 'sample'
const imageExampleFileKey = `${exampleFileBasename}.jpg`
const videoExampleFileKey = `${exampleFileBasename}.mp4`

export function getExampleFileKey(
  type: MediaStyleType | null,
  previewFile: FileInfo | string,
  defaultImageUrl?: string
) {
  // 当前的预览文件是否为配置里的默认文件 url
  const isUsedUrlOfConfig = !!(
    typeof previewFile === 'string'
    && defaultImageUrl
    && previewFile.includes(defaultImageUrl) // 为什么不用 == 呢
  )

  // 1.用配置链接时 2.没有预览链接时（也就是在没有选择空间文件的情况下配置为空）
  const shouldUseExampleFileKey = isUsedUrlOfConfig || !previewFile
  const exampleFileKey = videoTypes.includes(type!) ? videoExampleFileKey : imageExampleFileKey

  return shouldUseExampleFileKey ? exampleFileKey : null
}

interface Props {
  style?: MediaStyle
  type: MediaStyleType | null
  bucketName: string
  defaultPreviewFile?: FileInfo // 默认选中此文件预览
  sourcePreviewFile: string | FileInfo
  pickedFile: FileInfo | undefined
}

export default observer(function AccessUrl(props: Props) {
  const { style, type, bucketName, defaultPreviewFile, sourcePreviewFile, pickedFile } = props
  const bucketStore = useInjection(BucketStore)
  const toasterStore = useInjection(ToasterStore)
  const mediaStyleImageConfig = useMediaStyleImageConfig(bucketName)

  const exampleFileKey = getExampleFileKey(type, sourcePreviewFile, mediaStyleImageConfig?.defaultImageUrl)

  const bucketInfo = bucketStore.getDetailsByName(bucketName)

  // 用户实际使用时的链接，这个链接通过样式名来指定样式而不是直接拼接 command
  const accessUrl = React.useMemo(() => {
    if (!style || !style.name) return ''

    let viewedUrl = ''

    // 系统的预览文件
    if (exampleFileKey) {
      const key = getStyledFileKey(exampleFileKey, style)
      viewedUrl = `http(s)://{domain}/${key}`
    }

    if (defaultPreviewFile) {
      const fileKey = defaultPreviewFile?.key || ''
      const key = getStyledFileKey(fileKey, style)
      viewedUrl = `http(s)://{domain}/${key}`
    }

    // 用户自己的预览文件
    if (!viewedUrl && pickedFile != null) {
      // 使用用户自己的文件生成示例链接
      const key = getStyledFileKey(pickedFile.key, style)
      viewedUrl = `http(s)://{domain}/${key}`
    }

    // 访问链接使用的是样式名，无需关心原图保护是否开启
    const needSign = bucketInfo && bucketInfo.private

    return !needSign
      ? viewedUrl
      : `${viewedUrl}?e={expire_timestamp}&token={token_string}`
  }, [style, exampleFileKey, pickedFile, bucketInfo, defaultPreviewFile])

  if (!accessUrl) return null

  const title = style && style.commands && getSourceFormat(style.commands) != null
    ? '访问链接格式：链接 + 样式分隔符 + 样式名称，链接是源文件的原始访问链接去掉文件名后缀的地址；私有空间需同时携带签名'
    : '访问链接格式：原始链接 + 样式分隔符 + 样式名称；私有空间需同时携带签名'

  const titleView = (
    <span>
      访问链接示例
      <Tooltip title={title} placement="top" overlayClassName={styles.tip}>
        <HelpIcon className={styles.helpIcon} />
      </Tooltip>
    </span>
  )

  const copyFeedback = (_: string, state: boolean) => {
    if (state) {
      toasterStore.info('已成功拷贝到剪切板')
    } else {
      toasterStore.error('拷贝失败')
    }
  }

  const contentView = (
    <CopyToClipboard className={styles.accessUrl} onCopy={copyFeedback} text={accessUrl}>
      <Prompt type="warning">
        <MiddleEllipsisSpan key={accessUrl} title={accessUrl} text={accessUrl} maxRows={2} />
      </Prompt>
    </CopyToClipboard>
  )

  return (
    <div className={styles.accessUrlWrap}>
      <div>{titleView} ：{contentView}</div>
    </div>
  )
})
