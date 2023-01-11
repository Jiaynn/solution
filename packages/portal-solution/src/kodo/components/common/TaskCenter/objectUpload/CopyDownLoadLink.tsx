/**
 * @desc CopyDownLoadLink component
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import copy from 'copy-to-clipboard'
import { Button } from 'react-icecream'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { ExternalUrlModalStore } from 'kodo-base/lib/components/common/ExternalUrlModal/store'
import { kodoEncodeURIComponent } from 'kodo-base/lib/utils'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import { BucketStore, Loading } from 'kodo/stores/bucket'
import { DomainStore } from 'kodo/stores/domain'
import { KodoIamStore } from 'kodo/stores/iam'

interface Props {
  bucket: string
  fileKey: string
  mimeType: string
}

export const CopyDownLoadLink = observer(function CopyDownLoadLink(props: Props) {
  const { bucket, fileKey, mimeType } = props

  const iamStore = useInjection(KodoIamStore)
  const bucketStore = useInjection(BucketStore)
  const domainStore = useInjection(DomainStore)
  const toasterStore = useInjection(ToasterStore)
  const externalUrlModalStore = useInjection(ExternalUrlModalStore)
  const isBucketLoading = bucketStore.isLoading(Loading.Details)

  const isLoading = React.useMemo(() => (
    isBucketLoading || domainStore.isLoadingDefault
  ), [isBucketLoading, domainStore.isLoadingDefault])

  // 获取空间信息
  const ensureBucketDetailsLoaded = React.useCallback(async () => {
    const promise = bucketStore.fetchDetailsByName(bucket)
    return toasterStore.promise(promise)
  }, [bucket, bucketStore, toasterStore])

  // 获取域名信息
  const ensureBucketDomainLoaded = React.useCallback(async () => {
    const promise = domainStore.fetchAllDomainsByBucketName(bucket)
    return toasterStore.promise(promise)
  }, [bucket, domainStore, toasterStore])

  // 检查用户权限
  const ensurePermission = React.useCallback(async () => {
    if (iamStore.inited && !iamStore.isIamUser) return
    const isStatDeny = iamStore.isActionDeny({ actionName: 'Stat', resource: bucket })
    const isListDeny = iamStore.isActionDeny({ actionName: 'List', resource: bucket })
    if (isStatDeny || isListDeny) return toasterStore.promise(Promise.reject(new Error('暂无权限')))
  }, [bucket, iamStore, toasterStore])

  const handleCopy = React.useCallback(async () => {
    // 确保权限检查通过
    await ensurePermission()

    // 确保空间信息加载完成
    await ensureBucketDetailsLoaded()
    const bucketInfo = bucketStore.getDetailsByName(bucket)
    if (!bucketInfo) return toasterStore.error(`获取 ${bucket} 空间配置信息失败`)
    if (!bucketInfo.private && bucketInfo.protected) return toasterStore.error('空间已开启原图保护，不支持通过外链直接访问')

    let baseUrl: string | undefined

    // 确保域名及相关信息加载完成
    await ensureBucketDomainLoaded()

    // 尝试使用默认域名
    const defaultDomain = domainStore.defaultDomainMap.get(bucket)
    if (defaultDomain && defaultDomain.isAvailable) {
      baseUrl = domainStore.getResourceBaseUrl(bucket, {
        type: defaultDomain.domainType,
        domain: defaultDomain.domain
      })
    }

    // 没有可用的域名并且是分享空间直接报错
    if (!baseUrl && bucketStore.isShared(bucket)) {
      return toasterStore.error('无可用域名，复制外链失败')
    }

    // 尝试使用系统下载地址
    if (!baseUrl) {
      baseUrl = domainStore.getSystemDownloadBaseUrl(
        bucketInfo.region,
        bucket
      )
    }

    if (!baseUrl) {
      // 检查是不是没有可用的域名（用户自定义的 CDN、源站以及自动生成的测试域名）
      const availableDomain = domainStore.getAvailableDomainInfoByBucketName(bucket)
      if (availableDomain == null) return toasterStore.error('无可用域名，复制外链失败')
      return toasterStore.error('获取外链域名失败，请在空间中选择域名或是重试保存默认域名')
    }

    const fullUrl = `${baseUrl}/${kodoEncodeURIComponent(fileKey)}`

    if (bucketInfo.private) {
      runInAction(() => {
        const oldDomain = externalUrlModalStore.domain
        externalUrlModalStore.updateDomain(baseUrl!)
        externalUrlModalStore.open({
          title: '复制外链',
          objects: { fullPath: fileKey, basename: fileKey, mimeType },
          isPrivateBucket: !!bucketInfo.private
        }).then(() => {
          // 恢复一下
          externalUrlModalStore.updateDomain(oldDomain!)
        })
      })
      return
    }

    const success = copy(fullUrl, { format: 'text/plain' })
    if (success) return toasterStore.info('外链复制成功')
    toasterStore.error('复制失败，当前浏览器可能不支持自动复制')
  }, [
    bucket,
    fileKey,
    mimeType,
    bucketStore,
    domainStore,
    toasterStore,
    ensurePermission,
    externalUrlModalStore,
    ensureBucketDomainLoaded,
    ensureBucketDetailsLoaded
  ])

  return (
    <Button
      type="link"
      disabled={isLoading}
      onClick={handleCopy}
      style={{ marginRight: '8px' }}
      {...sensorsTagFlag('task-center', 'copy-download-link')}
    >
      复制外链
    </Button>
  )
})
