/**
 * @file upload controller
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React from 'react'
import * as qiniu from 'qiniu-js'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { validateObjectName } from 'kodo-base/lib/validators/validateObjectName'

import { getUploadBaseOptions } from 'kodo/utils/upload'

import { BucketStore } from 'kodo/stores/bucket'
import { DomainStore } from 'kodo/stores/domain'

import { UploadStatus as ResourceUploadStatus, uploadStatusTextMap } from 'kodo/constants/bucket/resource'

import { TokenApis } from 'kodo/apis/bucket/token'
import { ResourceApis } from 'kodo/apis/bucket/resource'

type UploadStatus = 'none' | 'uploading' | 'successful' | 'failure'

export function getUploadErrorText(error: qiniu.QiniuError): string {
  if (error instanceof qiniu.QiniuNetworkError) {
    return '网络异常'
  }

  if (error instanceof qiniu.QiniuRequestError) {
    if (error.code === 400) {
      if (
        error.data
        && typeof error.data.error === 'string'
        && error.data.error.includes('invalid persistentOps with variables')
      ) {
        return uploadStatusTextMap[ResourceUploadStatus.InvalidTransCodeStyleParams]
      }
      return uploadStatusTextMap[ResourceUploadStatus.Overload]
    }

    if (error.code === 614) {
      return uploadStatusTextMap[ResourceUploadStatus.Exist]
    }

    if (error.data && error.data.error_code === 'AccessDeniedByWorm') {
      return uploadStatusTextMap[ResourceUploadStatus.AccessDeniedByWorm]
    }
  }

  return '发生未知错误'
}

export function useUploadOptions(bucket: string) {
  const bucketStore = useInjection(BucketStore)
  const domainStore = useInjection(DomainStore)
  const toasterStore = useInjection(ToasterStore)
  const bucketInfo = bucketStore.getDetailsByName(bucket)

  React.useEffect(() => {
    if (bucketInfo == null) {
      toasterStore.promise(
        bucketStore.fetchDetailsByName(bucket)
      )
    }
  }, [bucket, bucketInfo, bucketStore, toasterStore])

  const hosts = domainStore.getUpHostByRegion(bucketInfo!.region)

  const result = React.useMemo(() => ({
    ...getUploadBaseOptions(hosts),
    disableStatisticsReport: true
  }), [hosts])

  return result
}

export function useUploadController<T>(bucket: string) {
  const tokenApis = useInjection(TokenApis)
  const resourceApis = useInjection(ResourceApis)

  const tokenRef = React.useRef<string>('')
  const uploadOptions = useUploadOptions(bucket)
  const [key, setKey] = React.useState<string>('')
  const [file, setFile] = React.useState<File | undefined>()
  const [status, setStatus] = React.useState<UploadStatus>('none')
  const [progress, setProgress] = React.useState<number | undefined>()
  const [errorText, setErrorText] = React.useState<string | undefined>()
  const [uploadedInfo, setUploadedInfo] = React.useState<T | undefined>()

  const upload = React.useCallback(async (uploadFile: File, dirname: string, filename: string) => {
    if (status === 'uploading') {
      setErrorText('请等待上传结束后再进行操作')
      setStatus('failure')
      return
    }

    // 开始处理前清空上次状态
    setProgress(undefined)
    setErrorText(undefined)
    setUploadedInfo(undefined)

    // 要在上传前对完整路径做一次字节数校验
    const validateResult = validateObjectName(dirname, filename)
    if (validateResult != null) {
      setErrorText(validateResult)
      setStatus('failure')
      return
    }

    const fullPath = [dirname, filename]
      .filter(Boolean)
      .join('')

    if (await resourceApis.isFileAvailable(bucket, { key: fullPath })) {
      setErrorText(uploadStatusTextMap[ResourceUploadStatus.Exist])
      setStatus('failure')
      return
    }

    if ((await resourceApis.hasSensitiveWord(fullPath)).has_sensitive_word) {
      setErrorText(uploadStatusTextMap[ResourceUploadStatus.Sensitive])
      setStatus('failure')
      return
    }

    try {
      tokenRef.current = await tokenApis.getUpToken(bucket, {
        insertOnly: 1
      })
    } catch {
      setErrorText('获取上传 token 失败')
      setStatus('failure')
      return
    }

    setKey(fullPath)
    setFile(uploadFile)
  }, [bucket, resourceApis, status, tokenApis])

  React.useEffect(() => {
    if (file == null || uploadOptions == null) return

    setStatus('uploading')
    const putExtra = { fname: file.name }
    const observable = qiniu.upload(file, key, tokenRef.current, putExtra, uploadOptions)

    const subscription = observable.subscribe({
      error: err => { setErrorText(getUploadErrorText(err)); setStatus('failure') },
      next: p => { setProgress(p.total.percent); setStatus('uploading') },
      complete: (v: T) => { setUploadedInfo(v); setStatus('successful') }
    })

    return () => { if (!subscription.closed) subscription.unsubscribe() }
  }, [bucket, file, key, uploadOptions])

  return { upload, status, progress, uploadedInfo, errorText }
}
