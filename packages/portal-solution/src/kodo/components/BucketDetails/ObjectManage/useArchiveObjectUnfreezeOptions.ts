/**
 * @author yinxulai <hovenjay@outlook.com>
 */

import { useCallback } from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ObjectManagerProps, Availability } from 'kodo-base/lib/components/ObjectManager/types'

import { KodoIamStore } from 'kodo/stores/iam'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { ResourceApis } from 'kodo/apis/bucket/resource'
import { IBucket } from 'kodo/apis/bucket'

export function useArchiveObjectUnfreeze(
  bucketName: string,
  bucketInfo?: IBucket
): ObjectManagerProps['archiveObjectUnfreeze'] {
  const iamStore = useInjection(KodoIamStore)
  const resourceApis = useInjection(ResourceApis)

  const getAvailability: () => Availability = () => {
    if (bucketInfo == null) { return 'Invisible' }

    if (bucketInfo.perm === ShareType.ReadOnly) { return 'Invisible' }

    // FIXME: 业务上目前存在的 BUG
    // 开启了多版本的空间不支持归档解冻（接口不支持）
    if (bucketInfo.versioning) { return 'Invisible' }

    if (iamStore.isActionDeny({ actionName: 'RestoreAr', resource: bucketName })) {
      return 'Invisible'
    }

    return 'Normal'
  }

  const availability = getAvailability()

  const unfreeze = useCallback((file: string, day: number) => (
    resourceApis.thrawArchiveFile({ bucket: bucketName, freezeAfterDays: day, fileName: file })
  ), [bucketName, resourceApis])

  if (availability === 'Invisible') { return { availability } }
  if (availability === 'Disabled') { return { availability } }

  return { availability: 'Normal', unfreeze }
}
