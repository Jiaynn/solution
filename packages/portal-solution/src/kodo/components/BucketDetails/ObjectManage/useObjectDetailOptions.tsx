/**
 * @description object detail options
 * @author duli <duli@qiniu.com>
 */

import React, { useCallback, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { ObjectManagerProps } from 'kodo-base/lib/components/ObjectManager/types'
import { proxyPrefix } from 'portal-base/common/apis/proxy'

import { trimQueryString } from 'kodo/utils/url'

import { getResourceProxyUrl } from 'kodo/transforms/bucket/resource'

import { ConfigStore } from 'kodo/stores/config'

import HlsPlayer from 'kodo/components/common/HlsPlayer'
import { RefreshCdnStore } from 'kodo/components/common/RefreshCdnModal/store'

import { useBlobStore } from '../MediaStyle/CreateStyle/common/Preview/Content'
import { useCdnRefreshStatus } from './actions/refreshCdn'
import LocalStore from './store'

interface Props {
  src: string
  bucketName: string
  render: (url: string, type: string, loading?: boolean, error?: string) => JSX.Element
}

const Preview = observer(function Preview({ bucketName, src, render }: Props) {
  const blobInfo = useBlobStore({ bucketName, src, shouldToaster: false })
  const refresh = blobInfo?.refresh
  useEffect(() => {
    refresh?.()
  }, [refresh])
  if (!blobInfo) {
    return render('', 'unknown')
  }
  return render(blobInfo.info?.dataURL || '', blobInfo.info?.mimeType || '', blobInfo.isLoading, blobInfo.errInfo)
})

function usePreview(bucketName: string) {
  return useCallback(
    (src: string, render: Props['render']) => (
      <Preview
        src={src}
        bucketName={bucketName}
        render={render}
      />
    ),
    [bucketName]
  )
}

export function useObjectDetailOptions(store: LocalStore): ObjectManagerProps['objectDetail'] {
  const configStore = useInjection(ConfigStore)
  const preview = usePreview(store.currentBucket)
  const refreshStore = useInjection(RefreshCdnStore)
  const cdnRefreshStatus = useCdnRefreshStatus(store.bucketInfo, store.selectedDomainInfo)

  const bucketInfo = store.bucketInfo

  const xhrSetup = useCallback((xhr: XMLHttpRequest, url: string) => {
    // 从当前站点发出的请求理应是资源代理的接口，其他的一律认为是需要抠出原始文件名再请求
    // 应该使用 resourceProxyApiPath，但是没有 portal-base 没有导出
    if (url.startsWith(window.location.origin) && !url.startsWith(window.location.origin + proxyPrefix + '/resource')) {
      const removePrefix = url.startsWith(window.location.origin + proxyPrefix)
        ? window.location.origin + proxyPrefix
        : window.location.origin
      const newUrl = store.baseUrl + url.replace(removePrefix, '')
      xhr.open('GET', getResourceProxyUrl(configStore, newUrl, bucketInfo!.region), true)
    } else if (!url.startsWith(window.location.origin)) {
      // 如果是用的用户域名
      xhr.open('GET', getResourceProxyUrl(configStore, url, bucketInfo!.region), true)
    }
  }, [bucketInfo, configStore, store.baseUrl])

  const config = store.objectDetailConfig
  return React.useMemo(
    () => ({
      ...store.objectDetailConfig,
      mediaStyle: config.mediaStyle ? { ...config.mediaStyle, preview } : undefined,
      cdnRefresh: cdnRefreshStatus ? url => refreshStore.open([trimQueryString(url, ['e', 'token'])]) : undefined,
      hlsPlayerRender: (url: string, onCanPlay: () => void, onError: () => void) => (
        <HlsPlayer src={url} hlsConfig={{ xhrSetup }} onCanPlay={onCanPlay} onError={onError} controls controlsList="nodownload" />
      )
    }),
    [cdnRefreshStatus, config.mediaStyle, preview, refreshStore, store.objectDetailConfig, xhrSetup]
  )
}
