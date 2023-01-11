/**
 * @author hovenjay <hovenjay@outlook.com>
 */

import filesize from 'filesize'
import autobind from 'autobind-decorator'
import React, { useMemo, useCallback } from 'react'
import { Identifier, useContainer, useInjection } from 'qn-fe-core/di'
import {
  ObjectManagerProps, GetAvailabilityNormalParamsType, Availability
} from 'kodo-base/lib/components/ObjectManager/types'
import {
  ObjectUploadTaskOptions, TaskCreateOptions,
  ObjectUploadTaskController as BaseController
} from 'kodo-base/lib/stores/task-center'

import { Alert, Link } from 'react-icecream-2'
import { ToasterStore } from 'portal-base/common/toaster'

import { getUploadBaseOptions } from 'kodo/utils/upload'

import { IRegion } from 'kodo/stores/config/types'
import { KodoIamStore } from 'kodo/stores/iam'
import { ConfigStore } from 'kodo/stores/config'

import { getTranscodeStylePath } from 'kodo/routes/bucket'
import { getCreateWorkflowPath } from 'kodo/routes/transcode-style'

import { UploadStatus, uploadStatusTextMap } from 'kodo/constants/bucket/resource'
import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { UploadTaskExtraData } from 'kodo/components/common/TaskCenter/objectUpload'
import { useTaskCenterContext } from 'kodo/components/common/TaskCenter'
import { Description } from 'kodo/components/common/Description'

import { ResourceApis } from 'kodo/apis/bucket/resource'
import { TokenApis } from 'kodo/apis/bucket/token'
import { IBucket } from 'kodo/apis/bucket'

import styles from './style.m.less'

type NormalUploadObjectOptions = GetAvailabilityNormalParamsType<ObjectManagerProps['uploadObject']>

class ObjectUploadTaskController extends BaseController {

  constructor(
    file: File,
    options: ObjectUploadTaskOptions,
    private toasterStore: ToasterStore
  ) {
    super(file, options)
  }

  @autobind
  terminate() {
    return this.toasterStore.promise(super.terminate())
  }
}

export function useUploadObjectOptions(
  bucketName: string,
  fetchBucketInfo: () => Promise<IBucket>,
  bucketInfo?: IBucket,
  regionConfig?: IRegion,
  isModalOpen?: boolean
) {

  const iamStore = useInjection(KodoIamStore)
  const configStore = useInjection(ConfigStore)
  const toasterStore = useInjection(ToasterStore)
  const tokenApis = useInjection(TokenApis)
  const resourceApis = useInjection(ResourceApis)

  const container = useContainer()
  const inject = React.useCallback(function inject<T>(identifier: Identifier<T>) {
    return container.get(identifier)
  }, [container])

  const getAvailability: () => Availability = () => {
    if (bucketInfo && bucketInfo.perm === ShareType.ReadOnly) {
      return 'Disabled'
    }

    if (iamStore.isActionDeny({ actionName: 'Upload', resource: bucketName })) {
      return 'Disabled'
    }

    return 'Normal'
  }

  const availability = getAvailability()

  const { store: { addTasks } } = useTaskCenterContext()

  const addObjectUploadTasks = useCallback<NormalUploadObjectOptions['onStart']>((files, location, putPolicy) => {
    const taskInitObjects = files.map<TaskCreateOptions<'objectUpload', UploadTaskExtraData>>(file => {
      const fullPath = `${location}${file.name}`

      async function fetchUploadToken() {
        let token: string

        try {
          token = await tokenApis.getUpToken(bucketName, { ...putPolicy, scope: `${bucketName}:${location}${file.name}` })
        } catch {
          throw new Error('上传 token 获取失败')
        }

        return token
      }

      async function checkBeforeUpload() {
        if (putPolicy.insertOnly || putPolicy.forceInsertOnly) {
          try {
            if (await resourceApis.isFileAvailable(bucketName, { key: fullPath })) {
              return Promise.reject(uploadStatusTextMap[UploadStatus.Exist])
            }
          } catch {
            /** https://github.com/qbox/kodo-web/pull/1348#discussion_r747231842
             * 检查文件名的接口在 IAM 子账号下受文件查询相关权限限制，这种情况下调接口会出错进入 catch 分支，如果因为权限不足就中断上传，
             * 会导致有上传文件权限却没有查询文件权限的 IAM 子账号无法顺利上传文件，所以此处接口调用异常不进行处理，继续进行上传。
             */
          }
        }

        try {
          if ((await resourceApis.hasSensitiveWord(fullPath)).has_sensitive_word) {
            return Promise.reject(uploadStatusTextMap[UploadStatus.Sensitive])
          }
        } catch (err) {
          throw new Error(err.message === 'Failed to fetch' ? '网络异常' : '敏感词检查失败')
        }
      }

      if (regionConfig == null) {
        throw new Error('无效的上传配置')
      }
      const uploadBaseOptions = getUploadBaseOptions(regionConfig.objectStorage.uploadUrls)
      const controller = new ObjectUploadTaskController(file, {
        fullPath,
        fetchUploadToken,
        checkBeforeUpload,
        uploadHost: uploadBaseOptions.uphost,
        uploadProtocol: uploadBaseOptions.upprotocol
      }, toasterStore)

      return {
        type: 'objectUpload',
        terminable: true,
        sensor: true,
        extraData: {
          filename: file.name,
          filesize: filesize(file.size, { base: 2, standard: 'jedec' }),
          mimeType: file.type,
          targetLocation: location,
          targetBucket: bucketName
        },
        controller
      }
    })

    addTasks(taskInitObjects)
  }, [addTasks, bucketName, regionConfig, resourceApis, toasterStore, tokenApis])

  const getTranscodeStyles = useMemo(() => {
    if (!regionConfig) return
    if (iamStore.isIamUser) return
    if (!regionConfig.dora.transcode.enable) return
    return () => fetchBucketInfo().then(bucket => bucket.transcode_styles)
  }, [fetchBucketInfo, iamStore.isIamUser, regionConfig])

  const transcodeStyleFormTip = React.useMemo(() => {
    if (!regionConfig) return
    if (iamStore.isIamUser) return
    if (!regionConfig.dora.transcode.enable) return
    const url = getCreateWorkflowPath(regionConfig.symbol, bucketName)
    const link = (<strong><Link target="_blank" href={url}>转码任务触发器</Link></strong>)
    return (<span>可以为空间配置{link}，在上传的文件满足规则策略时自动触发处理。</span>)
  }, [iamStore.isIamUser, regionConfig, bucketName])

  const uploadDescription = React.useMemo(() => {
    const globalConfig = configStore.getFull()
    if (!globalConfig.objectStorage.resourceManageV2.upload.description) return null

    return (
      <Alert
        closable
        type="warning"
        className={styles.uploadDescription}
        message={<Description tag="p" dangerouslyText={globalConfig.objectStorage.resourceManageV2.upload.description} />}
      />
    )
  }, [configStore])

  const storageTypes = configStore.supportedStorageTypes

  return React.useMemo<ObjectManagerProps['uploadObject']>(
    () => {
      if (availability === 'Normal') {
        return {
          availability: 'Normal',
          uploadDescription,
          storageTypes,
          getTranscodeStyles,
          transcodeStyleFormTip,
          isModalOpen,
          transcodeStylePath: getTranscodeStylePath(
            inject,
            { bucketName, query: { isCreateDrawerOpen: true } }
          ),
          onStart: addObjectUploadTasks
        }
      }

      if (availability === 'Disabled') {
        return { availability: 'Disabled' }
      }

      if (availability === 'Invisible') {
        return { availability: 'Invisible' }
      }
    },
    [
      availability,
      uploadDescription,
      storageTypes,
      getTranscodeStyles,
      transcodeStyleFormTip,
      isModalOpen,
      inject,
      bucketName,
      addObjectUploadTasks
    ]
  )
}
