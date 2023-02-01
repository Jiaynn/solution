/**
 * @author yinxulai <hovenjay@outlook.com>
 */

import { useCallback } from 'react'

import { useInjection } from 'qn-fe-core/di'

import { UserInfoStore } from 'portal-base/user/account'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import { FileStatus } from 'kodo-base/lib/constants'
import { ObjectManagerProps } from 'kodo-base/lib/components/ObjectManager/types'

import { KodoIamStore } from 'kodo/stores/iam'
import { BucketStore } from 'kodo/stores/bucket'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { authCheck } from 'kodo/components/common/Auth'

import { IBucket } from 'kodo/apis/bucket'
import { ResourceApis } from 'kodo/apis/bucket/resource'

export function useChangeObjectStatusOptions(
  bucketName: string,
  bucketInfo?: IBucket
): ObjectManagerProps['changeObjectStatus'] {
  const iamStore = useInjection(KodoIamStore)
  const bucketStore = useInjection(BucketStore)
  const userInfoStore = useInjection(UserInfoStore)
  const featureConfigStore = useInjection(FeatureConfigStore)
  const resourceApis = useInjection(ResourceApis)

  const hasPermission = authCheck({
    iamStore,
    bucketStore,
    userInfoStore,
    featureConfigStore
  }, {
    featureKeys: ['KODO.KODO_BUCKET_CHANGE_FILE_STATUS'],
    iamPermission: { actionName: 'Chstatus', resource: bucketName }
  })

  const setStatus = useCallback((fullPath: string, status: FileStatus) => (
    resourceApis.setFileStatus(bucketName, { key: fullPath }, status)
  ), [bucketName, resourceApis])

  if (bucketInfo == null) {
    return { availability: 'Invisible' }
  }

  if (bucketInfo.perm === ShareType.ReadOnly) {
    return { availability: 'Invisible' }
  }

  // FIXME: 开了版本暂时不支持
  if (bucketInfo.versioning) {
    return { availability: 'Invisible' }
  }

  if (!hasPermission) return { availability: 'Invisible' }

  return { availability: 'Normal', setStatus }
}
