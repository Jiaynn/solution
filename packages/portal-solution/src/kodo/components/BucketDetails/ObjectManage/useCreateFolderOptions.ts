/**
 * @desc useCreateFolderProps.
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { useCallback } from 'react'
import { useInjection } from 'qn-fe-core/di'
import {
  ObjectManagerProps, Availability
} from 'kodo-base/lib/components/ObjectManager/types'

import { getUploadBaseOptions } from 'kodo/utils/upload'

import { IRegion } from 'kodo/stores/config/types'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { ResourceApis, IFileResourceOptions } from 'kodo/apis/bucket/resource'
import { TokenApis } from 'kodo/apis/bucket/token'

import { KodoIamStore } from '../../../stores/iam'

export function useCreateFolderOptions(
  bucketName: string,
  bucketShareType?: ShareType,
  regionConfig?: IRegion
): ObjectManagerProps['createFolder'] {
  const iamStore = useInjection(KodoIamStore)
  const tokenApis = useInjection(TokenApis)
  const resourceApis = useInjection(ResourceApis)

  const getAvailability: () => Availability = () => {
    if (bucketShareType && bucketShareType === ShareType.ReadOnly) {
      return 'Disabled'
    }

    if (iamStore.isActionDeny({ actionName: 'Upload', resource: bucketName })) {
      return 'Disabled'
    }

    return 'Normal'
  }

  const availability = getAvailability()

  const checkBeforeCreate = useCallback<(fullPath: string) => Promise<void>>(
    async fullPath => {
      if ((await resourceApis.hasSensitiveWord(fullPath)).has_sensitive_word) {
        return Promise.reject('包含敏感词')
      }

      const options: IFileResourceOptions = {
        bucket: bucketName,
        prefix: fullPath,
        limit: 1,
        marker: '',
        allversion: false
      }

      try {
        const data = await resourceApis.getFileResource(options)

        if (data && Array.isArray(data.items) && data.items.length) {
          return Promise.reject('已存在同名目录')
        }
      } catch {
        /**
         * 检查目录名的接口在 IAM 子账号下受文件查询相关权限限制，这种情况下调接口会出错进入 catch 分支，如果因为权限不足就中断上传，
         * 会导致有上传文件权限却没有查询文件权限的 IAM 子账号无法顺利上传文件，所以此处接口调用异常不进行处理，继续进行上传。
         */
      }
    }, [resourceApis, bucketName])

  const getUploadToken = useCallback(
    fullPath => tokenApis.getUpToken(bucketName, { scope: `${bucketName}:${fullPath}`, insertOnly: 1 }),
    [tokenApis, bucketName]
  )

  return React.useMemo<ObjectManagerProps['createFolder']>(
    () => {
      if (availability === 'Invisible' || regionConfig == null) {
        return { availability: 'Invisible' }
      }

      if (availability === 'Disabled') {
        return { availability: 'Disabled' }
      }

      const uploadConfig = getUploadBaseOptions(regionConfig.objectStorage.uploadUrls)

      return { availability: 'Normal', uploadConfig, getUploadToken, checkBeforeCreate }
    },
    [availability, checkBeforeCreate, getUploadToken, regionConfig]
  )
}
