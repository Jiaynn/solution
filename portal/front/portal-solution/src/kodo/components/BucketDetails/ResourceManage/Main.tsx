/**
 * @file component ResourceManage 内容管理
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Icon, Button, Input, Radio, Tooltip } from 'react-icecream/lib'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import Role from 'portal-base/common/components/Role'

import { bindRadioField, bindTextInputField } from 'kodo/utils/formstate'
import { sensorsTagFlag } from 'kodo/utils/sensors'

import { getKeyAndVersion, getOriginalKey, decorateKey } from 'kodo/transforms/bucket/resource'

import { BucketStore } from 'kodo/stores/bucket'
import { ConfigStore } from 'kodo/stores/config'

import { gotoResourceUploadPage, IDetailsBaseOptions } from 'kodo/routes/bucket'

import { bucketFileGuideName, bucketFileGuideSteps } from 'kodo/constants/guide'
import { BucketRole } from 'kodo/constants/role'

import GuideGroup from 'kodo/components/common/Guide'
import { Auth } from 'kodo/components/common/Auth'

import { ResourceApis } from 'kodo/apis/bucket/resource'

import FileList from './FileList'
import BatchDeleteModal, { Store as BatchDeleteModalStore } from './BatchDeleteModal'
import LoadMore from './LoadMore'
import HeaderInfo from './HeaderInfo'
import BatchFileOperation from './BatchFileOperation'
import Store, { LoadingId } from './store'
import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions {
  store: Store
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalContent extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)
    console.log('props',props);
    
    makeObservable(this)

    this.toasterStore = this.props.inject(Toaster)
    Toaster.bindTo(this, this.toasterStore)
  }

  toasterStore: Toaster
  bucketStore = this.props.inject(BucketStore)
  configStore = this.props.inject(ConfigStore)
  resourceApis = this.props.inject(ResourceApis)
  batchDeleteModalStore = new BatchDeleteModalStore()

  @autobind
  handleDelete() {
    const { selectedRowKeys } = this.props.store
    if (!(selectedRowKeys && selectedRowKeys.length)) {
      this.toasterStore.info('请勾选要删除的文件')
      return
    }

    this.doDelete(selectedRowKeys)
  }

  // 这里的 key 都是被装饰过的
  @autobind
  doDelete(decoratedKeys: string[]) {
    const { store } = this.props
    // 把重复的过滤掉
    const set = new Set<string>()
    decoratedKeys.forEach(decoratedKey => {
      const key = getOriginalKey(decoratedKey)
      if (!set.has(decorateKey(key, false)) && !set.has(decorateKey(key, true))) {
        set.add(decoratedKey)
      }
    })

    const uniqueKeys = [...set]

    this.batchDeleteModalStore.confirm(
      uniqueKeys,
      (decoratedKey: string) => {
        const key = getOriginalKey(decoratedKey)
        const params = !store.isShowingVersion
          ? { key }
          : getKeyAndVersion(key)
        return this.resourceApis.deleteFileResource(this.props.bucketName, params)
      },
      (deletedKeys: string[]) => {
        if (deletedKeys && deletedKeys.length) {
          store.deleteFiles(deletedKeys)
          this.bucketStore.delayedFetchByName(this.props.bucketName)
          // 如果全部删除成功则全局提示一下
          if (deletedKeys.length === uniqueKeys.length) {
            this.toasterStore.success('删除成功')
          }
        }
      }
    )
  }

  @computed
  get versionControlView() {
    // 公有云版本管理 kodo 那边决定暂时不上线，这里要隐藏掉
    const { bucketInfo, versionFieldState } = this.props.store
    const versionEnabled = bucketInfo && bucketInfo.versioning
    return (
      <span className={styles.versionControl}>
        <Tooltip title="当空间设置里未开启版本控制时，版本显示不可开启">
          <Icon type="question-circle" />
        </Tooltip>
        <span>版本显示：</span>
        <Radio.Group {...bindRadioField(versionFieldState)}>
          <Radio.Button value disabled={!versionEnabled}>开启</Radio.Button>
          <Radio.Button value={false}>关闭</Radio.Button>
        </Radio.Group>
      </span>
    )
  }

  @computed
  get controllerView() {
    const { bucketName, store } = this.props
    const bucketInfo = store && store.bucketInfo
    const regionConfig = bucketInfo && this.configStore.getRegion({
      region: bucketInfo.region
    })

    return (
      <div className={styles.controller}>
        <div>
          <Auth
            iamPermission={{ actionName: 'Upload', resource: bucketName }}
            render={disabled => (
              <Role name={BucketRole.UploadFileEntry}>
                <Button
                  type="primary"
                  onClick={() => gotoResourceUploadPage(this.props.inject, bucketName)}
                  disabled={disabled || store.isReadonlyShareBucket}
                  {...sensorsTagFlag('upload-entry')}
                >
                  <Icon type="arrow-up" />
                  上传文件
                </Button>
              </Role>
            )}
          />
          <Role name={BucketRole.BatchFileOperation}>
            <BatchFileOperation
              bucketName={this.props.bucketName}
              store={this.props.store}
              onDelete={this.handleDelete} // TODO: 考虑挪到 store 里
            />
          </Role>
          <Auth
            iamPermission={{ actionName: 'List', resource: bucketName }}
            render={disabled => (
              <Role name={BucketRole.RefreshFileListCtrl}>
                <Button
                  icon="reload"
                  disabled={disabled}
                  loading={store.isRefreshing}
                  onClick={store.refresh}
                  {...sensorsTagFlag('refresh')}
                >
                  刷新
                </Button>
              </Role>
            )}
          />
          {regionConfig && regionConfig.objectStorage.fileMultiVersion.enable && (
            <Auth featureKeys={['KODO.KODO_VERSION']}>
              {this.versionControlView}
            </Auth>
          )}
        </div>
        <div>
          <Input.Search
            allowClear
            className={styles.searchInput}
            placeholder="请输入文件名前缀搜索"
            {...bindTextInputField(store.prefixField)}
          />
        </div>
      </div>
    )
  }

  @computed get loadMore() {
    const { store } = this.props
    // 这里判断是否是刷新
    const isRefresh = !store.marker && !store.files.length
    return (
      <LoadMore
        hasMore={!!store.marker}
        visible={!isRefresh}
        isLoading={store.loadings.isLoading(LoadingId.List)}
        onClick={store.fetchFiles}
      />
    )
  }

  componentWillUnmount() {
    this.batchDeleteModalStore.dispose()
  }

  componentDidMount() {
    this.batchDeleteModalStore.init()
  }

  render() {
    return (
      <GuideGroup name={bucketFileGuideName} steps={bucketFileGuideSteps}>
        <div>
          <HeaderInfo store={this.props.store} bucketName={this.props.bucketName} />
          {this.controllerView}
          <div className={styles.table}>
            <FileList
              bucketName={this.props.bucketName}
              store={this.props.store}
              onDelete={decoratedKey => this.doDelete([decoratedKey])}
            />
            {this.loadMore}
          </div>
          <BatchDeleteModal store={this.batchDeleteModalStore} />
        </div>
      </GuideGroup>
    )
  }
}

export default function Content(props: IProps) {
  console.log('Content render',props);
  return (
    <Inject render={({ inject }) => (
      <InternalContent {...props} inject={inject} />
    )} />
  )
}
