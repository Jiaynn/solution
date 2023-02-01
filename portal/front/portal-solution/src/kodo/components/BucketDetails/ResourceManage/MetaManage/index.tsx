/**
 * @file component MetaDataManage
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { action, computed, observable, reaction, when, makeObservable } from 'mobx'
import { FieldState } from 'formstate'
import moment from 'moment'
import autobind from 'autobind-decorator'
import { observer } from 'mobx-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Alert, Icon, Select, Spin, Tooltip } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Role from 'portal-base/common/components/Role'

import { bindPureValueField } from 'kodo/utils/formstate'
import { keysOf } from 'kodo/utils/ts'

import { shouldUseSourceUrlInFilePreview, getResourceProxyUrl } from 'kodo/transforms/bucket/resource'
import { humanizeStorageSize } from 'kodo/transforms/unit'
import { humanizeTimestamp } from 'kodo/transforms/date-time'

import noPrevImage from 'kodo/styles/images/no-prev.png'

import { BucketStore } from 'kodo/stores/bucket'
import { ConfigStore } from 'kodo/stores/config'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { StorageType, storageTypeTextMap } from 'kodo/constants/statistics'
import { reservedModeNameMap } from 'kodo/constants/bucket/setting/worm'
import { ShareType } from 'kodo/constants/bucket/setting/authorization'
import { ArchiveStatus, filesStateTextMap, FileStatus, MetaStatus } from 'kodo/constants/bucket/resource'
import { BucketFileDetailRole } from 'kodo/constants/role'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import Prompt from 'kodo/components/common/Prompt'

import { ResourceApis, IFileStat, IMeta } from 'kodo/apis/bucket/resource'

import MetaDataDefine from './MetaDataDefine'
import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions {
  fname: string
  visible: boolean
  domain?: string
  version?: string
}

interface DiDeps {
  inject: InjectFunc
}

const loadingId = 'metaInfo'

@observer
class InternalMetaManage extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    this.toasterStore = this.props.inject(Toaster)
    Toaster.bindTo(this, this.toasterStore)
  }

  toasterStore: Toaster
  bucketStore = this.props.inject(BucketStore)
  configStore = this.props.inject(ConfigStore)
  resourceApis = this.props.inject(ResourceApis)
  featureStore = this.props.inject(FeatureConfigStore)

  @observable.ref fileInfo: IFileStat | undefined = undefined
  @observable.shallow metaList: IMeta[] = []
  @observable.ref versions: string[] = []
  @observable isResourceLoadError = false

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, loadingId)
  version: FieldState<string> = new FieldState(this.props.version || '')

  @computed
  get dirty() {
    return !!this.fileInfo
  }

  @computed
  get bucketInfo() {
    return this.bucketStore.getDetailsByName(this.props.bucketName)
  }

  @computed
  get regionConfig() {
    if (this.bucketInfo == null) {
      return null
    }
    return this.configStore.getRegion({ region: this.bucketInfo.region })
  }

  @computed
  get isPrivateBucket() {
    return this.bucketInfo ? !!this.bucketInfo.private : null
  }

  @computed
  get isReadonlyShareBucket() {
    return this.bucketInfo ? ShareType.ReadOnly === this.bucketInfo.perm : true
  }

  @action.bound
  updateMetaInfo(data: IFileStat) {
    this.fileInfo = data
    if (data['x-qn-meta']) {
      this.metaList = keysOf(data['x-qn-meta']).map((key: string) => ({
        name: key,
        value: data['x-qn-meta'][key],
        status: MetaStatus.Recorded
      }))
    }
  }

  @action.bound
  updateVersions(versions: string[]) {
    this.versions = versions
  }

  @action.bound
  addMeta(data: IMeta) {
    this.metaList.push(data)
  }

  @action.bound
  updateMeta(data: IMeta, originName: string) {
    const index = this.metaList.findIndex(item => item.name === originName)
    this.metaList[index] = data
  }

  @action.bound
  deleteMeta(name: string) {
    const index = this.metaList.findIndex(item => item.name === name)
    this.metaList.splice(index, 1)
  }

  @autobind
  @Loadings.handle(loadingId)
  @Toaster.handle()
  fetchMetaInfo() {
    const req = this.resourceApis.getFileState(this.props.bucketName, {
      key: this.props.fname,
      ...(this.version.value && {
        version: this.version.value
      })
    }, this.props.domain)
    return req.then(this.updateMetaInfo)
  }

  @autobind
  @Toaster.handle()
  fetchVersionList() {
    const req = this.resourceApis.getFileVersionList(this.props.bucketName, this.props.fname)
    req.then(this.updateVersions).catch(() => { /**/ })
    return req
  }

  @action.bound
  refresh() {
    this.fileInfo = undefined
    this.isResourceLoadError = false
    this.metaList = []
    this.fetchMetaInfo()
  }

  @action.bound
  handleResourceLoadError() {
    this.isResourceLoadError = true
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => ({
        version: this.version.value,
        bucketInfo: this.bucketInfo,
        visible: this.props.visible
      }),
      data => {
        if (data.bucketInfo && data.visible) {
          this.refresh()
        }
      },
      { fireImmediately: true }
    ))

    this.disposable.addDisposer(when(
      () => (!!(
        this.regionConfig
        && this.regionConfig.objectStorage.fileMultiVersion.enable
        && !this.featureStore.isDisabled('KODO.KODO_VERSION')
      )),
      this.fetchVersionList
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @computed
  get isFrozen() {
    if (!this.fileInfo) { return true }

    // 归档/深度归档存储且不是解冻状态禁用操作
    return [StorageType.Archive, StorageType.DeepArchive].includes(this.fileInfo.type)
      && this.fileInfo.restoreStatus !== ArchiveStatus.Normal
  }

  @computed
  get imageView() {
    if (!this.fileInfo || !this.bucketInfo) { return null }

    const { region, versioning } = this.bucketInfo
    const { mimeType, status, preview_url: sourceUrl, putTime } = this.fileInfo

    const type = mimeType.split('/')[0]
    const isDisabledFile = status === FileStatus.Disabled
    // 七牛的图片缩略服务
    const thumbnailParams = 'imageView2/2/w/308/h/210/interlace/1/q/100'
    const modifyTimeParams = putTime ? `last_modify=${this.fileInfo.putTime}` : ''
    const queryParams = thumbnailParams + (modifyTimeParams ? `&${modifyTimeParams}` : '')
    // 开启版本后地址的 query 参数第一个是 version
    const thumbnailUrl = versioning ? sourceUrl + `&${queryParams}` : sourceUrl + `?${queryParams}`

    const previewUrl = getResourceProxyUrl(
      this.configStore,
      // 音视频资源不加缩略参数
      shouldUseSourceUrlInFilePreview(this.bucketInfo, this.fileInfo) ? sourceUrl : thumbnailUrl,
      region
    )

    if (isDisabledFile || !sourceUrl || this.isResourceLoadError) {
      return (
        <img
          className={styles.previewImage}
          alt="该文件无法预览"
          src={noPrevImage}
        />
      )
    }

    switch (type) {
      case 'image':
        return (
          <img
            className={styles.previewImage}
            src={previewUrl}
            alt="预览图"
            onError={this.handleResourceLoadError}
          />
        )
      case 'audio':
        return (<audio src={previewUrl} onError={this.handleResourceLoadError} controls />)
      case 'video':
        return (<video src={previewUrl} onError={this.handleResourceLoadError} controls />)
      default:
        return (
          <img
            className={styles.previewImage}
            alt="该文件无法预览"
            src={noPrevImage}
          />
        )
    }
  }

  @computed
  get expiration() {
    if (!this.fileInfo || !this.fileInfo.expiration) {
      return null
    }

    const time = moment(this.fileInfo.expiration * 1000).format('YYYY/MM/DD HH:mm:ss')
    // 如果允许设置删除时间具体到小时，则显示小时
    // TODO: 暂未开发小时设置的界面、目前用户是通过接口来设置该值
    const isDeleteAfterHoursEnabled = this.regionConfig
      && this.regionConfig.objectStorage.fileLifeCycle.deleteAfterHours.enable

    if (time.includes('00:00:00') && !isDeleteAfterHoursEnabled) {
      return moment(this.fileInfo.expiration * 1000).format('YYYY/MM/DD')
    }

    return time
  }

  @computed
  get externalLinkView() {
    if (this.bucketInfo!.protected) {
      return (
        <span>
          空间已开启
          <HelpDocLink doc="originalProtection"> 原图保护 </HelpDocLink>
          ，不能通过 URL 直接访问。
        </span>
      )
    }

    if (this.fileInfo!.status === FileStatus.Disabled) {
      return (
        <span>
          禁用的资源必须通过
          <HelpDocLink doc="modifyTheFileStatus"> 私有链接 </HelpDocLink>
          进行访问
        </span>
      )
    }

    return (
      this.isPrivateBucket
        ? (
          <span>
            私有空间内的资源需要通过
            <HelpDocLink doc="downloadToken">授权</HelpDocLink>
            进行访问
          </span>
        )
        : (
          <CopyToClipboard
            text={this.fileInfo ? this.fileInfo.preview_url : undefined}
            onCopy={(_, success: boolean) => (
              success
                ? this.toasterStore.info('外链复制成功')
                : this.toasterStore.error('复制失败')
            )}
          >
            <span className={`${styles.content} ${styles.url}`} title="点击复制">
              {this.fileInfo ? this.fileInfo.preview_url : '--'}
            </span>
          </CopyToClipboard>
        )
    )
  }

  @computed
  get basicInfoView() {
    return (
      <div className={styles.baseInfo}>
        <div className={styles.title}>基础信息</div>
        <div className={`${styles.imageWrapper} ${styles.item}`}>
          {this.imageView}
        </div>
        <div className={styles.item}>
          <span className={styles.label}>文件名</span>
          <span className={styles.content}>{this.props.fname}</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>文件类型</span>
          <span className={styles.content}>{this.fileInfo ? this.fileInfo.mimeType : '--'}</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>ETag</span>
          <span className={styles.content}>{this.fileInfo ? this.fileInfo.hash : '--'}</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>文件大小</span>
          <span className={styles.content}>{this.fileInfo ? humanizeStorageSize(this.fileInfo.fsize) : '--'}</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>存储类型</span>
          <span className={styles.content}>{this.fileInfo ? storageTypeTextMap[this.fileInfo.type] : '--'}</span>
        </div>
        {this.fileInfo && this.fileInfo.status && (
          <div className={styles.item}>
            <span className={styles.label}>文件状态</span>
            <span className={`${styles.content} ${styles.warning}`}>{filesStateTextMap[this.fileInfo.status]}</span>
          </div>
        )}
        {
          this.fileInfo && this.fileInfo['server-side-encryption'] && (
            <div className={styles.item}>
              <span className={styles.label}>
                服务端加密
              </span>
              <span className={styles.content}>
                {this.fileInfo['server-side-encryption']}
              </span>
            </div>
          )
        }
        {
          this.expiration && (
            <div className={styles.item}>
              <span className={styles.label}>
                过期时间
                <Tooltip placement="top" title="生命周期定义的文件到期删除时间">
                  <Icon type="question-circle" className={styles.expiration} />
                </Tooltip>
              </span>
              <span className={styles.content}>
                {this.expiration}
              </span>
            </div>
          )
        }
        <div className={styles.item}>
          <span className={styles.label}>文件链接</span>
          {
            this.fileInfo && this.isPrivateBucket !== null
              ? this.externalLinkView
              : '--'
          }
          {
            this.fileInfo && this.isFrozen && (
              <Alert
                showIcon
                type="warning"
                className={styles.externalLinkWarning}
                message={`${storageTypeTextMap[this.fileInfo.type]}文件，需要解冻完成后才能访问`}
              />
            )
          }
        </div>
      </div>
    )
  }

  @computed
  get objectLockInfo() {
    if (!this.fileInfo || !this.fileInfo.objectLockEnabled) { return null }

    const { lockMode, retainUntilDate } = this.fileInfo

    return (
      <div className={styles.baseInfo}>
        <hr className={styles.line} />
        <div className={styles.title}>对象锁定</div>
        <Prompt style={{ margin: '24px 0 24px 0' }}>
          使用一次写入多次读取(WORM)模型存储对象，以防止对象在固定的时间段内或无限期地被删除或覆盖。规则配置完成后即时生效，且<span>仅作用在设置生效后空间内新上传的对象上</span>。
        </Prompt>
        <div className={styles.item}>
          <span className={styles.label}>保留模式</span>
          <span className={styles.content}>{reservedModeNameMap[lockMode!]}</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>保留日期</span>
          <span className={styles.content}>
            {humanizeTimestamp(Math.floor(retainUntilDate! / 10000))}
          </span>
        </div>
      </div>
    )
  }

  render() {
    return (
      <Role name={BucketFileDetailRole.FileDetailBlock}>
        <div>
          <div className={styles.header}>
            <span className={styles.letLine} />
            {this.props.fname}
          </div>
          {
            this.versions.length
              ? (
                <div className={styles.versions}>
                  <span>选择版本：</span>
                  <Select
                    {...bindPureValueField(this.version)}
                    className={styles.versionSelect}
                    disabled={this.isReadonlyShareBucket}
                  >
                    {
                      this.versions.map(version => (
                        <Select.Option key={version} value={version}>{version}</Select.Option>
                      ))
                    }
                  </Select>
                </div>
              )
              : null
          }
          {this.basicInfoView}
          {this.objectLockInfo}
          <Spin spinning={this.loadings.isLoading(loadingId)}>
            <MetaDataDefine
              bucket={this.props.bucketName}
              isFrozen={this.isFrozen}
              fname={this.props.fname}
              version={this.version.value}
              dirty={this.dirty}
              isReadonlyShareBucket={this.isReadonlyShareBucket}
              defaultMetaList={this.metaList}
              deleteMeta={this.deleteMeta}
              addMeta={this.addMeta}
              updateMeta={this.updateMeta}
            />
          </Spin>
        </div>
      </Role>
    )
  }
}

export default function MetaManage(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalMetaManage {...props} inject={inject} />
    )} />
  )
}
