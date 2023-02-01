/**
 * @desc useMove.
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { useCallback } from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ApiTaskController } from 'kodo-base/lib/stores/task-center'
import { ObjectManagerProps } from 'kodo-base/lib/components/ObjectManager/types'
import { basename, dirname } from 'kodo-base/lib/components/ObjectManager/common/utils/path'

import { BucketStore } from 'kodo/stores/bucket'

import { KodoIamStore } from 'kodo/stores/iam'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { useTaskCenterContext } from 'kodo/components/common/TaskCenter'

import { ResourceApis } from 'kodo/apis/bucket/resource'

import { useBucketDetail } from './useBucketDetail'

export function useObjectMoveOptions(bucketName: string): ObjectManagerProps['moveObject'] {
  const iamStore = useInjection(KodoIamStore)
  const bucketStore = useInjection(BucketStore)
  const resourceApis = useInjection(ResourceApis)

  const { store } = useTaskCenterContext()
  const bucketInfo = useBucketDetail(bucketName)

  const isReadOnly = bucketInfo && bucketInfo.perm === ShareType.ReadOnly
  const isDenyGet = iamStore.isActionDeny({ actionName: 'Get', resource: bucketName })
  const isDenyDelete = iamStore.isActionDeny({ actionName: 'Delete', resource: bucketName })

  // 检查目标空间权限
  const checkBeforePaste = useCallback(async (sourceBucket: string, targetBucket: string) => {
    const sourceBucketInfo = bucketStore.getDetailsByName(sourceBucket)
      || (await bucketStore.fetchDetailsByName(sourceBucket))

    const targetBucketInfo = bucketStore.getDetailsByName(targetBucket)
      || (await bucketStore.fetchDetailsByName(targetBucket))

    if (targetBucketInfo.perm === ShareType.ReadOnly) {
      return '无法移动到只读分享空间'
    }

    if (sourceBucketInfo.region !== targetBucketInfo.region) {
      return '无法移动到不同区域的空间下'
    }

    if (iamStore.isActionDeny({ actionName: 'Upload', resource: targetBucket })) {
      return '暂无权限，无法移动到当前空间'
    }

    return false
  }, [bucketStore, iamStore])

  // 提交任务到任务中心去执行
  const moveObjects = useCallback(async (
    sourceBucket: string,
    targetBucket: string,
    paths: Array<[string, string]>
  ) => {
    // 检查位置是否没有变化
    if (paths.some(([source, target]) => source === target) && targetBucket === sourceBucket) {
      throw new Error('无法移动到源文件所在的目录。')
    }

    // 添加到任务中心
    store.addTasks(paths.map(([sourceFullPath, targetFullPath]) => {
      const filename = basename(sourceFullPath)
      const sourcePath = `${sourceBucket}/${dirname(sourceFullPath)}`
      const targetPath = `${targetBucket}/${dirname(targetFullPath)}`

      const controller = new ApiTaskController(() => resourceApis.moveFile(
        sourceBucket,
        sourceFullPath,
        targetBucket,
        targetFullPath
      ))

      return {
        type: 'objectBatchMove',
        terminable: false,
        controller,
        extraData: {
          filename,
          sourcePath,
          targetPath
        }
      }
    }))

  }, [resourceApis, store])

  if (bucketInfo == null) {
    // 当前空间虽然功能是 Invisible 的
    // 但是可能作为目标空间还是可以粘贴的，所以需要指定其他参数
    return { availability: 'Invisible', checkBeforePaste, moveObjects }
  }

  if (isReadOnly || isDenyGet || isDenyDelete) {
    return { availability: 'Disabled', checkBeforePaste, moveObjects }
  }

  return { availability: 'Normal', checkBeforePaste, moveObjects }
}
