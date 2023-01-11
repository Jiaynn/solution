/**
 * @desc useChangeObjectNameProps.
 * @author hovenjay <hovenjay@outlook.com>
 */

import { useMemo, useCallback } from 'react'
import { useInjection } from 'qn-fe-core/di'
import {
  ObjectManagerProps, GetAvailabilityNormalParamsType, Availability
} from 'kodo-base/lib/components/ObjectManager/types'

import { KodoIamStore } from 'kodo/stores/iam'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { ResourceApis } from 'kodo/apis/bucket/resource'

type NormalChangeObjectBasenameOptions = GetAvailabilityNormalParamsType<ObjectManagerProps['changeObjectBasename']>

export function useChangeObjectBasenameProps(
  bucketName: string,
  bucketShareType?: ShareType
): ObjectManagerProps['changeObjectBasename'] {

  const iamStore = useInjection(KodoIamStore)
  const resourceApis = useInjection(ResourceApis)

  const getAvailability: () => Availability = () => {
    if (bucketShareType && bucketShareType === ShareType.ReadOnly) {
      return 'Disabled'
    }

    if (
      iamStore.isActionDeny({ actionName: 'Get', resource: bucketName })
      || iamStore.isActionDeny({ actionName: 'Upload', resource: bucketName })
      || iamStore.isActionDeny({ actionName: 'Delete', resource: bucketName })
      || iamStore.isActionDeny({ actionName: 'Chgm', resource: bucketName })
    ) {
      return 'Disabled'
    }

    return 'Normal'
  }

  const availability = getAvailability()

  const changeObjectBasename = useCallback<NormalChangeObjectBasenameOptions['changeObjectBasename']>(
    async (oldFullPath, newFullPath) => {
      try {
        const result = await resourceApis.hasSensitiveWord(newFullPath)

        if (result.has_sensitive_word) {
          return Promise.reject('重命名失败，文件名含有敏感词')
        }
      } catch {
        return Promise.reject('文件名称检查失败')
      }

      return resourceApis.renameFileKey(bucketName, newFullPath, oldFullPath)
    }, [bucketName, resourceApis]
  )

  return useMemo<ObjectManagerProps['changeObjectBasename']>(() => {

    const nameDescription = null

    if (availability === 'Invisible') return { availability: 'Invisible' }
    if (availability === 'Normal') return { availability, nameDescription, changeObjectBasename }
    if (availability === 'Disabled') return { availability, nameDescription, changeObjectBasename }
  }, [availability, changeObjectBasename])
}
