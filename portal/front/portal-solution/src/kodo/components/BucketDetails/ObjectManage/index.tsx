/**
 * @file component ResourceManage 内容管理入口
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'
import { Identifier, useContainer, useInjection } from 'qn-fe-core/di'
import { Route, Switch } from 'portal-base/common/router'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { ObjectManager, ObjectManagerProps, GetObjectApiOptions } from 'kodo-base/lib/components/ObjectManager'

import { useEffect } from 'react'

import { ConfigStore } from 'kodo/stores/config'
import { KodoIamStore } from 'kodo/stores/iam'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { bucketFileGuideName, bucketFileGuideSteps } from 'kodo/constants/guide'

import GuideGroup from 'kodo/components/common/Guide'

import { ResourceApis, IFileResourceOptions } from 'kodo/apis/bucket/resource'

import HeaderInfo from './HeaderInfo'
import StateStore from './store'

import { useObjectMoveOptions } from './useObjectMoveOptions'
import { useObjectDeleteOptions } from './useObjectDeleteOptions'
import { useCreateFolderOptions } from './useCreateFolderOptions'
import { useChangeObjectStatusOptions } from './useChangeObjectStatusOptions'
import { useArchiveObjectUnfreeze } from './useArchiveObjectUnfreezeOptions'
import { useChangeObjectBasenameProps } from './useChangeObjectBasenameProps'
import { useUploadObjectOptions } from './useUploadObjectOptions'
import { useChangeObjectMimeTypeOptions } from './useChangeObjectMimeTypeOptions'
import { useChangeObjectStorageTypeOptions } from './useChangeObjectStorageTypeOptions'
import { useObjectDetailOptions } from './useObjectDetailOptions'
import { useMediaStyleActions } from './actions/mediaStyle'
import { useRefreshCndActions, useBatchRefreshCdnActions } from './actions/refreshCdn'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions {
  isUploadModalOpen: boolean;
}

export const ObjectManage = observer((props: IProps) => {

  const iamStore = useInjection(KodoIamStore)
  const configStore = useInjection(ConfigStore)
  const resourceApis = useInjection(ResourceApis)
  const featureConfigStore = useInjection(FeatureConfigStore)

  const container = useContainer()
  const inject = React.useCallback(
    function inject<T>(identifier: Identifier<T>) {
      return container.get(identifier)
    },
    [container]
  )

  const store = useLocalStore(StateStore, {
    bucketName: props.bucketName,
    inject
  })

  useEffect(() => {
    store.updateCurrentBucket(props.bucketName)
    store.fetchDomains()
  }, [props.bucketName, store])

  const { bucketName, isUploadModalOpen } = props
  const globalConfig = configStore.getFull()

  const baseUrl = store.baseUrl
  const bucketInfo = store.bucketInfo
  const hasInitDomain = store.hasInitDomain
  const updateHasSensitive = store.updateHasSensitive
  const denyList = iamStore.isActionDeny({ actionName: 'List', resource: bucketName })
  const regionConfig = bucketInfo && configStore.getRegion({ region: bucketInfo.region })

  const moveOptions = useObjectMoveOptions(props.bucketName)
  const deleteObjectOptions = useObjectDeleteOptions(bucketName, bucketInfo)
  const changeObjectStatus = useChangeObjectStatusOptions(bucketName, bucketInfo)
  const archiveObjectUnfreeze = useArchiveObjectUnfreeze(bucketName, bucketInfo)
  const uploadObjectOptions = useUploadObjectOptions(
    bucketName,
    store.fetchBucketInfo,
    bucketInfo,
    regionConfig,
    isUploadModalOpen
  )
  const changeObjectMimeTypeOptions = useChangeObjectMimeTypeOptions(
    bucketName,
    bucketInfo
  )
  const createFolderOptions = useCreateFolderOptions(
    bucketName,
    bucketInfo && bucketInfo.perm,
    regionConfig
  )
  const changeObjectNameOptions = useChangeObjectBasenameProps(
    props.bucketName,
    bucketInfo && bucketInfo.perm
  )
  const changeObjectStorageTypeOptions = useChangeObjectStorageTypeOptions(
    bucketName,
    bucketInfo
  )
  const detailOptions = useObjectDetailOptions(store)

  const refreshCndActions = useRefreshCndActions(
    bucketInfo,
    store.selectedDomainInfo
  )
  const batchRefreshCdnAction = useBatchRefreshCdnActions(
    bucketInfo,
    store.selectedDomainInfo
  )

  const mediaStyleActions = useMediaStyleActions({
    bucketName,
    region: bucketInfo?.region,
    hasBaseUrl: !!baseUrl,
    mediaStyleConfig: store.mediaStyleConfig,
    updateMediaStyleList: store.updateMediaStyleList
  })

  // 版本管理配置
  const versionOptions = React.useMemo<
    ObjectManagerProps['objectVersion']
  >(() => {
    if (featureConfigStore.isDisabled('KODO.KODO_VERSION')) {
      return { availability: 'Invisible' }
    }
    if (!globalConfig.objectStorage.fileMultiVersion.enable) {
      return { availability: 'Invisible' }
    }
    if (!bucketInfo || !bucketInfo.versioning) {
      return { availability: 'Invisible' }
    }
    return { availability: 'Normal' }
  }, [
    bucketInfo,
    featureConfigStore,
    globalConfig.objectStorage.fileMultiVersion.enable
  ])

  const listApi = React.useMemo<ObjectManagerProps['list']['listApi']>(() => {
    if (!hasInitDomain || denyList) return

    return (options: Omit<IFileResourceOptions, 'bucket'>) => resourceApis
      .getFileResource({
        ...options,
        ...(baseUrl ? { baseUrl } : null), // 可优化成判断依赖了 baseUrl 的功能是否有开启的
        bucket: bucketName
      })
      .then(res => {
        if (res.has_sensitive_words) updateHasSensitive(true)
        return res
      })
  }, [
    resourceApis,
    hasInitDomain,
    denyList,
    bucketName,
    baseUrl,
    updateHasSensitive
  ])

  const getObject = React.useCallback(
    ({ fullPath, version }: GetObjectApiOptions) => resourceApis.getFileState(
      bucketName,
      { key: fullPath, version },
      baseUrl || undefined
    ),
    [resourceApis, bucketName, baseUrl]
  )

  const [tableScroll] = React.useState(() => ({ y: 'calc(100vh - 310px)' }))

  return (
    <div className={styles.objectManager}>
      <HeaderInfo store={store} bucketName={bucketName} />
      <Switch>
        <Route relative exact path="/">
          <GuideGroup name={bucketFileGuideName} steps={bucketFileGuideSteps}>
            <ObjectManager
              tableScroll={tableScroll}
              bucket={bucketName}
              list={{ listApi, getObject }}
              moveObject={moveOptions}
              objectVersion={versionOptions}
              uploadObject={uploadObjectOptions}
              createFolder={createFolderOptions}
              deleteObject={deleteObjectOptions}
              objectDetail={detailOptions}
              downloadObject={store.singleDownloadConfig}
              changeObjectBasename={changeObjectNameOptions}
              batchExportObjectPublicUrl={store.batchExportObjectPublicUrl}
              batchDownloadObject={store.batchDownloadConfig}
              copyObjectPublicUrl={store.copyPublicUrlConfig}
              archiveObjectUnfreeze={archiveObjectUnfreeze}
              changeObjectStatus={changeObjectStatus}
              changeObjectMimeType={changeObjectMimeTypeOptions}
              changeObjectStorageType={changeObjectStorageTypeOptions}
              onCreateSingleActions={versionEnabled => [
                ...mediaStyleActions(versionEnabled),
                ...refreshCndActions(versionEnabled)
              ]}
              onCreateBatchActions={versionEnabled => [
                ...batchRefreshCdnAction(versionEnabled)
              ]}
            />
          </GuideGroup>
        </Route>
      </Switch>
    </div>
  )
})
