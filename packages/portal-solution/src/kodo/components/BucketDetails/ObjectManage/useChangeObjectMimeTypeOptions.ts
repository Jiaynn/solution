/**
 * @desc Change object mime type options hook.
 * @author hovenjay <hovenjay@outlook.com>
 */

import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import {
  ObjectManagerProps, GetAvailabilityNormalParamsType, Availability
} from 'kodo-base/lib/components/ObjectManager/types'

import { KodoIamStore } from 'kodo/stores/iam'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { IBucket } from 'kodo/apis/bucket'
import { ResourceApis } from 'kodo/apis/bucket/resource'

type NormalChangeObjectMimeTypeOptions = GetAvailabilityNormalParamsType<ObjectManagerProps['changeObjectMimeType']>

export function useChangeObjectMimeTypeOptions(
  bucketName: string,
  bucketInfo?: IBucket
): ObjectManagerProps['changeObjectMimeType'] {
  const iamStore = useInjection(KodoIamStore)
  const resourceApis = useInjection(ResourceApis)
  const toasterStore = useInjection(ToasterStore)

  const getAvailability: () => Availability = () => {
    if (bucketInfo && bucketInfo.perm === ShareType.ReadOnly) {
      return 'Invisible'
    }

    if (iamStore.isActionDeny({ actionName: 'Chgm', resource: bucketName })) {
      return 'Invisible'
    }

    return 'Normal'
  }

  const availability = getAvailability()

  const changeObjectMimeType: NormalChangeObjectMimeTypeOptions['changeObjectMimeType'] = (
    async (fullPath, type, version) => {
      const promise = resourceApis.renameFileMimeType(bucketName, type, { key: fullPath, version })
      await toasterStore.promise(promise, '修改文件类型成功')
    }
  )

  if (availability === 'Invisible') { return { availability: 'Invisible' } }
  if (availability === 'Disabled') { return { availability: 'Disabled' } }
  return { availability: 'Normal', changeObjectMimeType }
}
