/**
 * @desc useDelete
 * @author yinxulai <yinxulai@qiniu.com>
 */

import { useInjection } from 'qn-fe-core/di'
import { getMessage } from 'qn-fe-core/exception'
import { KodoProxyApiException } from 'portal-base/kodo/apis/proxy'
import { OnProgressChange, TaskController, TaskCreateOptions } from 'kodo-base/lib/stores/task-center'

import { useTaskCenterContext } from 'kodo-base/lib/components/TaskCenter'
import { ObjectManagerProps } from 'kodo-base/lib/components/ObjectManager/types'
import { DeleteObjectItem } from 'kodo-base/lib/components/ObjectManager/common/actions/singleObjectDelete'

import { getEncodedEntryURI } from 'kodo/transforms/bucket/resource'

import { BatchDeleteExtraData, ProgressType, ResultType } from 'kodo/components/common/TaskCenter/objectBatchDelete'

import { IBucket } from 'kodo/apis/bucket'
import { ResourceApis } from 'kodo/apis/bucket/resource'
import { ShareType } from '../../../constants/bucket/setting/authorization'
import { KodoIamStore } from '../../../stores/iam'

const errorMessageMap = {
  worm: '处于 WORM 保护期内',
  lastVersion: '属于历史版本的最新版本'
}

class ObjectDeleteTaskController extends TaskController<ResultType, ProgressType> {
  constructor(
    private readonly version: boolean,
    private readonly bucketName: string,
    private readonly object: DeleteObjectItem,
    private readonly resourceApis: ResourceApis
  ) {
    super()
  }

  private isTerminated = false
  private hasWormError = false
  private hasLastVersionError = false
  private ignoreObjectList: string[] = []
  private processResolve: (() => void) | null = null
  private progressStatus: ProgressType = {
    version: this.version,
    successful: 0,
    failure: 0,
    details: []
  }

  private async deleteFolder(onProgressChange: OnProgressChange<ProgressType>): Promise<ResultType> {
    const getCompletedMessage = () => {
      if (this.progressStatus.failure === 0) {
        return
      }
      const keys: string[] = []
      if (this.hasWormError) {
        keys.push(errorMessageMap.worm)
      }

      if (this.hasLastVersionError) {
        keys.push(errorMessageMap.lastVersion)
      }

      return `有文件${keys.join('或')}无法删除`
    }

    const traverseDelete = async (): Promise<ResultType> => {
      if (this.isTerminated) return this.progressStatus

      // 多版本
      const response = await this.resourceApis.getFileResource({
        allversion: this.version,
        bucket: this.bucketName,
        prefix: this.object.fullPath,
        limit: 50 + this.ignoreObjectList.length
      })
        .catch(() => {
          throw '列举文件失败'
        })

      // 过滤需要忽略的文件
      const paddingItems = response.items.filter(item => {
        const uuid = getEncodedEntryURI(this.bucketName, item)
        return !this.ignoreObjectList.includes(uuid)
      })

      // 没有需要删除的文件了
      if (paddingItems.length === 0) {
        const message = getCompletedMessage()
        if (message) throw message
        return this.progressStatus
      }

      // 依次删除列举到的文件
      for (let index = 0; index < paddingItems.length; index++) {
        if (this.isTerminated) break

        const item = paddingItems[index]
        const record: ResultType['details'][number] = {
          key: item.key,
          version: item.version,
          bucket: this.bucketName,
          status: ''
        }

        try {
          // eslint-disable-next-line no-await-in-loop
          await this.resourceApis.deleteFileResource(this.bucketName, {
            key: item.key,
            version: this.version ? item.version : undefined
          })
        } catch (error) {
          this.progressStatus.failure++
          record.status = getMessage(error) || '未知错误'

          if (error instanceof KodoProxyApiException) {
            let shouldIgnore = false
            if (error.code === 'AccessDeniedByWorm') {
              record.status = errorMessageMap.worm + '无法删除'
              this.hasWormError = true
              shouldIgnore = true
            }

            if (error.httpCode as number === 412) {
              record.status = errorMessageMap.lastVersion + '无法删除'
              this.hasLastVersionError = true
              shouldIgnore = true
            }

            const uuid = getEncodedEntryURI(this.bucketName, item)
            this.ignoreObjectList.push(uuid)

            this.progressStatus.details.push(record)
            onProgressChange({ ...this.progressStatus })
            if (shouldIgnore) continue // 错误可以被忽略则继续执行
          }

          if (error instanceof Error && error.message.includes('Failed to fetch')) {
            record.status = '网络异常'
            this.progressStatus.details.push(record)
            onProgressChange({ ...this.progressStatus })
            throw record.status
          }

          this.progressStatus.details.push(record)
          onProgressChange({ ...this.progressStatus })
          throw error
        }

        record.status = '成功'
        this.progressStatus.successful++
        this.progressStatus.details.push(record)
        onProgressChange({ ...this.progressStatus })
      }

      // 还有文件，继续删除
      if (response.marker) return traverseDelete()

      if (!this.isTerminated) {
        // 结束检查是否有应该提示的信息
        const message = getCompletedMessage()
        if (message) throw message
      }

      return this.progressStatus
    }

    return traverseDelete()
      .then(r => { onProgressChange({ ...this.progressStatus }); return r })
      .catch(e => { onProgressChange({ ...this.progressStatus }); throw e })
  }

  process(onProgressChange: OnProgressChange<ProgressType>): Promise<ResultType> {
    this.isTerminated = false
    this.ignoreObjectList = []
    this.hasWormError = false
    this.hasLastVersionError = false
    this.processResolve = null
    this.progressStatus = {
      version: this.version,
      successful: 0,
      failure: 0,
      details: []
    }

    onProgressChange({ ...this.progressStatus })
    return new Promise((resolve, reject) => {
      if (this.object.type === 'folder') {
        this.deleteFolder(p => onProgressChange(p))
          .then(d => !this.isTerminated && resolve(d))
          .catch(e => !this.isTerminated && reject(e))
          .finally(() => this.processResolve?.())
        return
      }

      // TODO：支持文件删除（目前业务暂时没需要）
      return resolve(this.progressStatus)
    })
  }

  async terminate(): Promise<void> {
    this.isTerminated = true
    // 等任务彻底结束时去 resolve 停止状态
    return new Promise(resolve => {
      this.processResolve = () => {
        setTimeout(resolve, 0)
      }
    })
  }
}

export function useObjectDeleteOptions(bucketName: string, bucketInfo?: IBucket): ObjectManagerProps['deleteObject'] {
  const iamStore = useInjection(KodoIamStore)
  const resourceApis = useInjection(ResourceApis)
  const { store: { addTasks } } = useTaskCenterContext()

  const getAvailability = () => {
    if (!bucketInfo) { return 'Invisible' }

    if (bucketInfo.perm === ShareType.ReadOnly) {
      return 'Disabled'
    }

    if (iamStore.isActionDeny({ actionName: 'Delete', resource: bucketName })) {
      return 'Disabled'
    }

    return 'Normal'
  }

  const availability = getAvailability()

  if (availability === 'Invisible') return { availability }

  const deleteObject = (fullPath: string, version?: string) => (
    resourceApis.deleteFileResource(bucketName, { key: fullPath, version })
      .catch(error => {
        if (error instanceof KodoProxyApiException) {
          throw error.message
        }

        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          throw '网络异常'
        }

        throw error
      })
  )

  const appendTask = (version: boolean, objects: DeleteObjectItem[]) => {
    // eslint-disable-next-line arrow-body-style
    const tasks = objects.map<TaskCreateOptions<'objectBatchDelete', BatchDeleteExtraData, any, ProgressType>>(object => {
      return {
        type: 'objectBatchDelete',
        terminable: object.type === 'folder',
        controller: new ObjectDeleteTaskController(version, bucketName, object, resourceApis),
        extraData: {
          bucket: bucketName,
          type: object.type,
          fullPath: object.fullPath
        }
      }
    })

    addTasks(tasks)
  }

  if (availability === 'Disabled') return { availability, appendTask, deleteObject }
  if (availability === 'Normal') return { availability, appendTask, deleteObject }
}
