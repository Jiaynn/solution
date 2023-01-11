/**
 * @description upload component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import * as qiniu from 'qiniu-js'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'

import { getUploadBaseOptions } from 'kodo/utils/upload'

import { encodeUrlSafeBase64 } from 'kodo/transforms/base64'

import { UploadStatus, uploadStatusTextMap } from 'kodo/constants/bucket/resource'

import { ImageStyleApis } from 'kodo/apis/bucket/image-style'

import styles from './style.m.less'

export const extensions = ['psd', 'jpeg', 'jpg', 'png', 'gif', 'webp', 'tiff', 'tif', 'bmp']

export enum Phase {
  Uploading = 'uploading',
  Done = 'done'
}

export interface Props {
  onPhaseChange: (res: { phase: Phase.Uploading } | { phase: Phase.Done, url?: string }) => void
}

function getUploadHandler(token: string, host: string, file: File, key: string) {
  const putExtra = {
    fname: file.name // 后端需要这个来使转码命令支持分片
  }
  const config = {
    ...getUploadBaseOptions(host),
    disableStatisticsReport: true
  }
  return qiniu.upload(file, key, token, putExtra, config)
}

function upload(token: string, host: string, file: File, key: string) {
  const uploadHandler = getUploadHandler(token, host, file, key)

  return new Promise<{ key: string }>((resolve, reject) => {
    uploadHandler.subscribe({
      complete: data => resolve(data),
      error: err => {
        if (err instanceof qiniu.QiniuNetworkError) {
          reject('网络异常')
          return
        }

        if (err instanceof qiniu.QiniuRequestError) {
          if (err.code === 400) {
            if (
              err.data
              && typeof err.data.error === 'string'
              && err.data.error.includes('invalid persistentOps with variables')
            ) {
              return reject(uploadStatusTextMap[UploadStatus.InvalidTransCodeStyleParams])
            }
            reject(uploadStatusTextMap[UploadStatus.Overload])
            return
          }

          if (err.code === 614) {
            reject(uploadStatusTextMap[UploadStatus.Exist])
            return
          }

          if (err.data && err.data.error_code === 'AccessDeniedByWorm') {
            reject(uploadStatusTextMap[UploadStatus.AccessDeniedByWorm])
            return
          }
        }

        reject(err)
      }
    })
  })
}

function useUploadStore({ onPhaseChange }: Props) {
  const toasterStore = useInjection(ToasterStore)
  const imageStyleApis = useInjection(ImageStyleApis)
  const [isLoading, setLoading] = React.useState(false)
  const handleUpload = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      try {
        setLoading(true)
        onPhaseChange({ phase: Phase.Uploading })

        const file = files[0]
        let suffix = ''
        if (file.name.split('.').length > 1) {
          suffix = '.' + file.name.split('.').pop()
        }

        const uploadKey = 'ImageProcessData/users/image-' + (+new Date()) + '-' + encodeUrlSafeBase64(file.name) + suffix
        const { uploadToken, uploadHost, downloadHost } = await imageStyleApis.getUploadInfo(uploadKey)

        const { key } = await upload(uploadToken, uploadHost, file, uploadKey)

        const downloadUrl = `${downloadHost}/${key}`
        const { width, height } = await imageStyleApis.getImageInfo(downloadUrl)
        if (height > 29999) {
          throw '图片高度超出 29999 像素，请重新上传。'
        } else if (width > 29999) {
          throw '图片宽度超出 29999 像素，请重新上传。'
        } else if (width * height > 200000000) {
          throw '图片总像素超过 2 亿，请重新上传。'
        }

        onPhaseChange({ phase: Phase.Done, url: downloadUrl })
      } catch (error) {
        toasterStore.error(error)
        onPhaseChange({ phase: Phase.Done })
      } finally {
        setLoading(false)
        e.target.value = '' // 清空 file
      }
    }
  }, [imageStyleApis, onPhaseChange, toasterStore])

  return {
    isLoading,
    handleUpload
  }
}

export default function Upload(props: Props) {
  const { isLoading, handleUpload } = useUploadStore(props)
  const accept = React.useMemo(() => extensions.map(ext => `.${ext}`).join(','), [])
  return (
    <label className={isLoading ? styles.disabledBtn : undefined}>
      上传图片
      <input type="file" name="upload" accept={accept} disabled={isLoading} onChange={handleUpload} />
    </label>
  )
}
