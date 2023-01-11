/**
 * @description style access url component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { Button, Dialog, Loading } from 'react-icecream-2'
import { InfoIcon } from 'react-icecream-2/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ToasterStore } from 'portal-base/common/toaster'
import { MiddleEllipsisSpan } from 'kodo-base/lib/components/common/Paragraph'
import { kodoEncodeURIComponent } from 'kodo-base/lib/utils'

import { DomainStore } from 'kodo/stores/domain'
import { BucketStore } from 'kodo/stores/bucket'

import { ProtectedMode } from 'kodo/constants/bucket/setting/original-protected'
import { DomainSourceType } from 'kodo/constants/domain'

import { getStyledFileKey, useCommands } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/command'
import { MediaStyleType, mediaStyleTypeNameMap } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/constants'

import { ResourceApis } from 'kodo/apis/bucket/resource'
import { MediaStyle } from 'kodo/apis/bucket/image-style'

import styles from './style.m.less'

function useSignedUrlList(urlList: string[], shouldSign = false) {
  const resourceApi = useInjection(ResourceApis)
  const toasterStore = useInjection(ToasterStore)
  const [isLoading, setIsLoading] = React.useState(false)
  const [signedUrlList, setSignedUrlList] = React.useState(urlList)

  React.useEffect(() => {
    if (!urlList.length) return

    //  不需要签名，直接更新 previewUrl
    if (!shouldSign) {
      setSignedUrlList(urlList)
      return
    }

    const tasks = urlList.filter(Boolean).map(url => resourceApi.getSignedDownloadUrl(url))

    Promise.all(tasks)
      .then(response => {
        setSignedUrlList(response.filter(Boolean) as string[])
      })
      .catch(() => {
        setSignedUrlList([])
        toasterStore.error('获取文件签名失败')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [resourceApi, toasterStore, shouldSign, urlList])

  return [signedUrlList, isLoading] as const
}

interface Props {
  visible: boolean
  onCancel: () => void

  bucketName?: string
  styleList?: MediaStyle[]
  fileKey?: string
}

function Inner(props: Required<Props>) {
  const { visible, onCancel, bucketName, styleList, fileKey } = props
  const style = styleList[0]
  const commands = useCommands()
  const domainStore = useInjection(DomainStore)
  const toasterStore = useInjection(ToasterStore)
  const bucketStore = useInjection(BucketStore)

  const [mediaStyleType, setMediaStyleType] = React.useState(MediaStyleType.Manual)

  const bucketInfo = bucketStore.getDetailsByName(bucketName)

  const copyFeedback = React.useCallback(
    (_: string, state: boolean) => {
      if (state) {
        toasterStore.info('已成功拷贝到剪切板')
      } else {
        toasterStore.error('拷贝失败')
      }
    },
    [toasterStore]
  )

  const getBaseUrl = React.useCallback((domain: string, type: DomainSourceType) => (
    domainStore.getResourceBaseUrl(bucketName, { type, domain })
  ), [bucketName, domainStore])

  const separator = bucketInfo?.separator.includes('-') ? '-' : bucketInfo?.separator[0]

  const urlList = React.useMemo(
    () => ([
      ...domainStore
        .getSourceDomainListByBucketName(bucketName)
        .map(domain => getBaseUrl(domain.domain, DomainSourceType.Source)),

      ...domainStore
        .getCDNAvailableDomainListByBucketName(bucketName)
        .map(domain => getBaseUrl(domain.name, DomainSourceType.CDN))
    ])
      .filter(Boolean)
      .map(domain => `${domain}/${kodoEncodeURIComponent(getStyledFileKey(fileKey, style, separator))}`),
    [bucketName, domainStore, fileKey, getBaseUrl, style, separator]
  )

  const shouldSign = !!(bucketInfo && (bucketInfo.private || bucketInfo.protected === ProtectedMode.Enable))

  const [signedUrlList, isLoading] = useSignedUrlList(urlList, shouldSign)

  const domainListView = signedUrlList.map((url, index) => (
    <div key={index} className={styles.url}>
      <MiddleEllipsisSpan maxRows={2} title={url} text={url} suffixWidth={28} />
      <CopyToClipboard text={url} onCopy={copyFeedback}>
        <span className={styles.copyText}>复制</span>
      </CopyToClipboard>
    </div>
  ))

  const footerView = (
    <Button type="primary" onClick={onCancel}>
      关闭
    </Button>
  )

  React.useEffect(() => {
    let ignore = false
    commands.getMediaStyleType(style).then(type => !ignore && setMediaStyleType(type))
    return () => { ignore = true }
  }, [commands, style])

  const typeTextView = (
    mediaStyleType === MediaStyleType.Manual ? '多媒体样式' : mediaStyleTypeNameMap[mediaStyleType] + '样式'
  )

  return (
    <Dialog
      icon={<InfoIcon className={styles.infoIcon} />}
      title="样式访问链接"
      className={styles.dialog}
      visible={visible}
      onCancel={onCancel}
      footer={footerView}
    >
      <div className={styles.content}>
        <div>{typeTextView} {style.name} 等共 {styleList.length} 条样式保存成功！</div>
        {urlList.length && (
          <>
            <div className={styles.notice}>点击复制样式访问链接</div>
            <Loading loading={isLoading} childrenVisibility="hidden">
              {domainListView}
            </Loading>
          </>
        )}
      </div>
    </Dialog>
  )
}

export default function StyleAccessUrlModal(props: Props) {
  const { styleList, fileKey, bucketName, ...rest } = props

  if (!styleList || !styleList.length || !fileKey || !bucketName || !rest.visible) {
    return null
  }

  return <Inner {...rest} styleList={styleList} fileKey={fileKey} bucketName={bucketName} />
}
