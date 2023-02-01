/**
 * @desc Change object storage type options hook.
 * @author hovenjay <hovenjay@outlook.com>
 */

import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import {
  ObjectManagerProps, GetAvailabilityNormalParamsType, Availability
} from 'kodo-base/lib/components/ObjectManager/types'

import { ConfigStore } from 'kodo/stores/config'

import { KodoIamStore } from 'kodo/stores/iam'

import { StorageType, storageTypeTextMap } from 'kodo/constants/statistics'
import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { IBucket } from 'kodo/apis/bucket'
import { ResourceApis } from 'kodo/apis/bucket/resource'

import Prompt from '../../common/Prompt'
import HelpDocLink from '../../common/HelpDocLink'

type NormalChangeObjectStorageTypeOptions = GetAvailabilityNormalParamsType<ObjectManagerProps['changeObjectStorageType']>

const storageTypeTransformSuccessTextMap = {
  [StorageType.Standard]: '文件转标准存储成功',
  [StorageType.LowFrequency]: '文件转低频存储成功',
  [StorageType.Archive]: '文件转归档存储成功',
  [StorageType.DeepArchive]: '文件转深度归档存储成功'
} as const

export function useChangeObjectStorageTypeOptions(
  bucketName: string,
  bucketInfo?: IBucket
): ObjectManagerProps['changeObjectStorageType'] {
  const iamStore = useInjection(KodoIamStore)
  const configStore = useInjection(ConfigStore)
  const resourceApis = useInjection(ResourceApis)
  const toasterStore = useInjection(ToasterStore)

  const getAvailability: () => Availability = () => {
    if (bucketInfo && bucketInfo.perm === ShareType.ReadOnly) {
      return 'Invisible'
    }

    if (iamStore.isActionDeny({ actionName: 'Chtype', resource: bucketName })) {
      return 'Invisible'
    }

    return 'Normal'
  }

  const availability = getAvailability()

  const changeObjectStorageType: NormalChangeObjectStorageTypeOptions['changeObjectStorageType'] = (
    async (fullPath, type, version) => {
      const req = resourceApis.transformStorageType(bucketName, { key: fullPath, version }, type)
      await toasterStore.promise(req, storageTypeTransformSuccessTextMap[type])
    }
  )

  if (availability === 'Invisible') { return { availability: 'Invisible' } }
  if (availability === 'Disabled') { return { availability: 'Disabled' } }

  const supportedStorageType = configStore.supportedStorageTypes

  return {
    availability: 'Normal',
    supportedStorageType,
    changeObjectStorageType,
    docUrl: configStore && configStore.getFull().documentUrls.chtype || undefined,
    description: (
      <Prompt style={{ marginTop: 12, marginBottom: 12 }}>
        {
          supportedStorageType
            .filter(type => [StorageType.LowFrequency, StorageType.Archive, StorageType.DeepArchive].includes(type))
            .map(type => storageTypeTextMap[type])
            .join('、')
        }
        <HelpDocLink doc="category" anchor="#compare"> Object 最小计量 64KB</HelpDocLink>。<br />
        {
          supportedStorageType
            .filter(type => [StorageType.Archive, StorageType.DeepArchive].includes(type))
            .map(type => storageTypeTextMap[type])
            .join('、').concat('类型的文件需要先解冻为可读取状态，才能进行类型转换。')
        }
        <br />
        {supportedStorageType.includes(StorageType.LowFrequency) && (
          <>
            从低频存储类型转换为其他类型时，如果该 Object 保存时间少于 30 天，将按照 30 天来计费。<br />
          </>
        )}
        {supportedStorageType.includes(StorageType.Archive) && (
          <>
            从归档存储类型转换为其他类型时，如果该 Object 保存时间少于 60 天，将按照 60 天来计费。<br />
          </>
        )}
        {supportedStorageType.includes(StorageType.DeepArchive) && (
          <>
            从深度归档存储类型转换为其他类型时，如果该 Object 保存时间少于 180 天，将按照 180 天来计费。<br />
          </>
        )}
      </Prompt>
    )
  }
}
