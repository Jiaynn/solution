/**
 * @file component Operation 文件的相关操作
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { action, computed, observable, makeObservable } from 'mobx'
import { Button, Dropdown, Menu, Modal, Spin } from 'react-icecream/lib'

import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Link } from 'portal-base/common/router'
import { Loadings } from 'portal-base/common/loading'
import Role from 'portal-base/common/components/Role'

import { valuesOfEnum } from 'kodo/utils/ts'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import { getResourceProxyUrl } from 'kodo/transforms/bucket/resource'

import { BucketStore } from 'kodo/stores/bucket'
import { KodoIamStore } from 'kodo/stores/iam'
import { ConfigStore } from 'kodo/stores/config'

import { StorageType } from 'kodo/constants/statistics'
import { BucketRole } from 'kodo/constants/role'
import { ArchiveStatus, filesStateTextMap, FileStatus } from 'kodo/constants/bucket/resource'

import { Auth } from 'kodo/components/common/Auth'

import { ResourceApis } from 'kodo/apis/bucket/resource'

import ModifyStorageTypeDrawer from './ModifyStorageTypeDrawer'
import ThrawArchiveFileDrawer from './ThrawArchiveFileDrawer'
import MetaInfoDrawer from './MetaInfoDrawer'
import Store, { IFileInfo } from '../store'
import styles from '../style.m.less'

export interface IProps {
  index: number
  data: IFileInfo
  store: Store
  bucketName: string
  onDelete: () => void
}

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  GetFileStat = 'GetFileStat',
  SetFileStatus = 'SetFileStatus'
}

@observer
class InternalOperation extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    this.toasterStore = this.props.inject(Toaster)
    Toaster.bindTo(this, this.toasterStore)
  }

  toasterStore: Toaster
  iamStore = this.props.inject(KodoIamStore)
  bucketStore = this.props.inject(BucketStore)
  resourceApis = this.props.inject(ResourceApis)
  configStore = this.props.inject(ConfigStore)

  @observable isStorageTypeDrawerVisible = false

  @observable isThrawArchiveDrawerVisible = false

  @observable isMetaInfoDrawerVisible = false

  @observable archiveStatus: ArchiveStatus | null = null

  moreDetailRef = React.createRef<HTMLSpanElement>()

  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  /* 是被禁用的文件 */
  @computed
  get isDisabledFile() {
    const { data: { status } } = this.props
    return status === FileStatus.Disabled
  }

  /* 是正常状态的文件 */
  @computed
  get isNormalFile() {
    /* 非归档类型的文件或者归档状态为 Normal 就是正常的文件 */
    return this.archiveStatus == null || this.archiveStatus === ArchiveStatus.Normal
  }

  /** 是解冻中的文件 */
  @computed
  get isThawingFile() {
    return this.archiveStatus === ArchiveStatus.Thawing
  }

  @computed
  get shouldShowChangeFileStatusMenu() {
    const { store: { shouldShowChangeFileStatusMenu } } = this.props
    return shouldShowChangeFileStatusMenu && this.isNormalFile
  }

  @computed
  get downloadMenuItem() {
    const { store, data } = this.props
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { download_url, isNewFile } = data
    const { shouldShowDownloadMenu, bucketInfo } = store

    if (bucketInfo == null || !shouldShowDownloadMenu || !this.isNormalFile || this.isDisabledFile) {
      return null
    }

    return (
      <Menu.Item>
        <Link
          {...sensorsTagFlag('download', isNewFile ? 'new-file' : 'old-file')}
          target="_blank"
          rel="noopener"
          to={getResourceProxyUrl(this.configStore, download_url, bucketInfo.region)}
        >
          下载
        </Link>
      </Menu.Item>
    )
  }

  @computed
  get enableFileMenuItem() {
    const { data: { isNewFile } } = this.props
    if (!this.shouldShowChangeFileStatusMenu || !this.isDisabledFile) { return null }

    return (
      <Menu.Item {...sensorsTagFlag('enable', isNewFile ? 'new-file' : 'old-file')} onClick={this.handleEnableFile}>
        {filesStateTextMap[FileStatus.Enabled]}
      </Menu.Item>
    )
  }

  @computed
  get disableFileMenuItem() {
    const { data: { isNewFile } } = this.props
    if (!this.shouldShowChangeFileStatusMenu || this.isDisabledFile) { return null }

    return (
      <Menu.Item {...sensorsTagFlag('disable', isNewFile ? 'new-file' : 'old-file')} onClick={this.handleDisableFile}>
        {filesStateTextMap[FileStatus.Disabled]}
      </Menu.Item>
    )
  }

  @computed
  get copyLinkMenuItem() {
    const { store: { shouldShowCopyLinkMenu }, data: { preview_url: previewUrl, isNewFile } } = this.props

    if (!shouldShowCopyLinkMenu || this.isDisabledFile) { return null }

    return (
      <Menu.Item>
        <CopyToClipboard
          text={previewUrl}
          onCopy={(_, success: boolean) => (
            success
              ? this.toasterStore.info('外链复制成功')
              : this.toasterStore.error('复制失败')
          )}
        >
          <span {...sensorsTagFlag('copy-link', isNewFile ? 'new-file' : 'old-file')}>复制外链</span>
        </CopyToClipboard>
      </Menu.Item>
    )
  }

  @computed
  get deleteMenuItem() {
    const { data: { isNewFile } } = this.props
    const { store: { shouldShowDeleteMenu }, onDelete } = this.props

    if (!shouldShowDeleteMenu) { return null }

    return (
      <Menu.Item {...sensorsTagFlag('delete', isNewFile ? 'new-file' : 'old-file')} onClick={onDelete}>
        删除
      </Menu.Item>
    )
  }

  @computed
  get changeStorageTypeMenuItem() {
    const { data: { isNewFile } } = this.props

    const { store: { isReadonlyShareBucket, shouldShowChangeStorageTypeMenu } } = this.props

    if (isReadonlyShareBucket || !shouldShowChangeStorageTypeMenu || !this.isNormalFile) { return null }

    return (
      <Menu.Item
        {...sensorsTagFlag('change-storage-type', isNewFile ? 'new-file' : 'old-file')}
        onClick={() => this.updateStorageTypeDrawerVisible(true)}
      >
        转存储类型
      </Menu.Item>
    )
  }

  @computed
  get thawingMenuItem() {
    const { data: { isNewFile } } = this.props
    const { store: { isReadonlyShareBucket } } = this.props

    const hasRestoreArPermission = this.iamStore.isActionDeny({ actionName: 'RestoreAr', resource: this.props.bucketName })

    if (this.isNormalFile) { return null }

    return (
      <Menu.Item
        {...sensorsTagFlag('archive-unfreeze', isNewFile ? 'new-file' : 'old-file')}
        onClick={() => this.updateThawArchiveDrawerVisible(true)}
        disabled={this.isThawingFile || isReadonlyShareBucket || hasRestoreArPermission}
      >
        {this.isThawingFile ? '解冻中' : '解冻'}
      </Menu.Item>
    )
  }

  @computed
  get moreOptionsView() {
    if (this.loadings.isLoading(Loading.GetFileStat) || this.loadings.isLoading(Loading.SetFileStatus)) {
      return (
        <Menu>
          <Menu.Item>
            <Spin />
          </Menu.Item>
        </Menu>
      )
    }

    return (
      <Menu>
        {this.downloadMenuItem}
        {this.copyLinkMenuItem}
        {this.enableFileMenuItem}
        {this.disableFileMenuItem}
        {this.deleteMenuItem}
        {this.changeStorageTypeMenuItem}
        {this.thawingMenuItem}
      </Menu>
    )
  }

  @action.bound
  updateStorageTypeDrawerVisible(status: boolean) {
    this.isStorageTypeDrawerVisible = status
  }

  @action.bound
  updateThawArchiveDrawerVisible(status: boolean) {
    this.isThrawArchiveDrawerVisible = status
  }

  @action.bound
  updateMetaInfoDrawerVisible(status: boolean) {
    this.isMetaInfoDrawerVisible = status
  }

  @action.bound
  updateArchiveFileStatus(status: ArchiveStatus) {
    this.archiveStatus = status || ArchiveStatus.Frozen
  }

  @autobind
  transformStorageType(key: string, type: StorageType) {
    const { isNewFile, version } = this.props.data
    const req = this.resourceApis.transformStorageType(this.props.bucketName, { key }, type)
    req.then(() => {
      this.props.store.fetchFileState(key, isNewFile, version)
      // 转低频后需要更新下存储量信息，存储量信息有一定延迟
      this.bucketStore.delayedFetchByName(this.props.bucketName)
    }).catch(() => { /**/ })

    const successMessage = type === StorageType.Standard
      ? '文件转标准存储成功'
      : '文件转低频存储成功'

    this.toasterStore.promise(req, successMessage)
  }

  @autobind
  handleStorageTypeModify() {
    const { key, isNewFile, version } = this.props.data
    this.props.store.fetchFileState(key, isNewFile, version)
    // 转低频后需要更新下存储量信息，存储量信息有一定延迟
    this.bucketStore.delayedFetchByName(this.props.bucketName)
    this.updateStorageTypeDrawerVisible(false)
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.GetFileStat)
  fetchFileStat() {
    const { key, version } = this.props.data
    const req = this.resourceApis.getFileState(this.props.bucketName, { key, version })
    req.then(result => this.updateArchiveFileStatus(result.restoreStatus))
    return req
  }

  @autobind
  async handleMenuVisibleChange(visible: boolean) {
    const { data } = this.props
    if (visible && [StorageType.Archive, StorageType.DeepArchive].includes(data.type)) {
      this.fetchFileStat()
    }
  }

  @autobind
  @Loadings.handle(Loading.SetFileStatus)
  async setFileStatus(status: FileStatus, successText?: string) {
    const { bucketName, data: { key, isNewFile, version }, store } = this.props
    const req = this.resourceApis.setFileStatus(bucketName, { key }, status)
    this.toasterStore.promise(req, successText)
    await req
    store.fetchFileState(key, isNewFile, version)
  }

  @autobind
  handleEnableFile() {
    this.setFileStatus(FileStatus.Enabled, '文件启用成功')
  }

  @autobind
  handleDisableFile() {
    Modal.confirm({
      title: '文件禁用确认',
      content: '文件修改为禁用状态，就必须使用私有链接才能访问资源。请确认是否修改',
      onOk: () => this.setFileStatus(FileStatus.Disabled, '文件禁用成功')
    })
  }

  render() {
    const { index, data, bucketName } = this.props

    const autoRoleWithFirstElement = (roleName: string, element: JSX.Element) => {
      if (index === 0) {
        return (
          <Role name={roleName}>
            {element}
          </Role>
        )
      }
      return element
    }

    return (
      <span ref={this.moreDetailRef}>
        {
          // 如果是标记为删除的文件或者 iam 权限不符合的，不显示按钮
          !this.iamStore.isActionDeny({ actionName: 'Stat', resource: bucketName })
          && !data.deleteMarker
          && autoRoleWithFirstElement(
            BucketRole.FirstFileMetaEntry,
            (
              <Button
                {...sensorsTagFlag('details', data.isNewFile ? 'new-file' : 'old-file')}
                type="link"
                onClick={() => this.updateMetaInfoDrawerVisible(true)}
              >
                详情
              </Button>
            )
          )
        }
        <Auth iamPermission={{ actionName: 'Get', resource: bucketName }}>
          {autoRoleWithFirstElement(
            BucketRole.FirstFileMoreActionEntry,
            (
              <Dropdown
                overlay={this.moreOptionsView}
                getPopupContainer={() => this.moreDetailRef.current!}
                onVisibleChange={this.handleMenuVisibleChange}
                placement="bottomCenter"
              >
                <Button type="link" className={styles.tableAction}>更多</Button>
              </Dropdown>
            )
          )}
        </Auth>
        <ThrawArchiveFileDrawer
          visible={this.isThrawArchiveDrawerVisible}
          onClose={() => this.updateThawArchiveDrawerVisible(false)}
          bucketName={this.props.bucketName}
          fileKey={this.props.data.key}
          storageType={data.type}
        />
        <ModifyStorageTypeDrawer
          fileKey={data.key}
          bucketName={this.props.bucketName}
          visible={this.isStorageTypeDrawerVisible}
          storageType={data.type}
          onOk={this.handleStorageTypeModify}
          onCancel={() => this.updateStorageTypeDrawerVisible(false)}
        />
        <MetaInfoDrawer
          onClose={() => this.updateMetaInfoDrawerVisible(false)}
          bucketName={this.props.bucketName}
          visible={this.isMetaInfoDrawerVisible}
          fname={data.key}
          version={data.version}
          domain={this.props.store.baseUrl}
        />
      </span>
    )
  }
}

export default function Operation(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalOperation {...props} inject={inject} />
    )} />
  )
}
