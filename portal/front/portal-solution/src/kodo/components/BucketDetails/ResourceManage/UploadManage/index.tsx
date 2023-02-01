/**
 * @file component UploadManage 上传管理
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { action, computed, observable, when, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Row, Modal, Col, Card, Alert } from 'react-icecream/lib'
import { FieldState } from 'formstate'
import { v4 as uuid } from 'uuid'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import Role from 'portal-base/common/components/Role'
import { Link } from 'portal-base/common/router'

import { sensorsTagFlag, sensorsTrack } from 'kodo/utils/sensors'
import { keysOf } from 'kodo/utils/ts'

import { BucketStore } from 'kodo/stores/bucket'

import { gotoResourcePage, IDetailsBaseOptions, getResourceV2Path } from 'kodo/routes/bucket'

import { UploadStatus, versionSeparator } from 'kodo/constants/bucket/resource'
import { ShareType } from 'kodo/constants/bucket/setting/authorization'
import { BucketFileUploadRole } from 'kodo/constants/role'
import { StorageType } from 'kodo/constants/statistics'

import { ResourceApis } from 'kodo/apis/bucket/resource'
import { ITranscodeStyleInfo } from 'kodo/apis/bucket'
import { IPutPolicy } from 'kodo/apis/bucket/token'

import UploadBar from './UploadBar'
import Setting from './Setting'
import Store from '../store'
import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions {
  store: Store
}

interface DiDeps {
  inject: InjectFunc
}

export interface IQueue {
  status: UploadStatus
  file: File
  ftype: StorageType
  putPolicy?: Partial<IPutPolicy> // 选择转码样式后该参数生效
  keyName: string
  isCovered: boolean
}

@observer
class InternalUploadManage extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    this.toasterStore = this.props.inject(Toaster)
    Toaster.bindTo(this, this.toasterStore)
  }

  toasterStore: Toaster
  bucketStore = this.props.inject(BucketStore)
  resourceApis = this.props.inject(ResourceApis)
  featureStore = this.props.inject(FeatureConfigStore)

  uploadQueue = observable.map<string, IQueue>({}, { deep: false })
  prefix = new FieldState('')
  inputField = new FieldState('')
  ftypeField = new FieldState(StorageType.Standard)
  isCovered = new FieldState(!!this.versionEnabled)
  putPolicy?: Partial<IPutPolicy>
  hasClearedNewFiles = false
  disposable = new Disposable()

  @computed
  get bucketInfo() {
    return this.bucketStore.getDetailsByName(this.props.bucketName)
  }

  @computed
  get versionEnabled() {
    return !!(
      this.bucketInfo && this.bucketInfo.versioning
      && !this.featureStore.isDisabled('KODO.KODO_VERSION')
    )
  }

  @computed
  get isReadonlyShareBucket() {
    return this.bucketInfo ? ShareType.ReadOnly === this.bucketInfo.perm : true
  }

  @autobind
  resetInput() {
    this.inputField.reset('')
  }

  @action.bound
  doWhenGoBack() {
    this.props.store.resetPrefix()
    this.props.store.refreshList()
    gotoResourcePage(this.props.inject, this.props.bucketName)
  }

  @autobind
  handleBeforeGoBack() {
    for (const value of this.uploadQueue.values()) {
      if (value.status === UploadStatus.Uploading) {
        Modal.confirm({
          title: '中止上传',
          content: '当前还有未上传完的文件（上传完成的文件不会删除），确定中止上传吗？',
          onOk: () => {
            this.abortUploadQueue()
            this.doWhenGoBack()
          }
        })
        return
      }
    }

    this.doWhenGoBack()
  }

  @action
  abortUploadQueue(shouldNotify?: boolean) {
    const status: UploadStatus[] = [UploadStatus.Pending, UploadStatus.Uploading]
    let aborted = false
    this.uploadQueue.forEach(
      (value, key) => {
        if (status.includes(value.status)) {
          this.changeFileStatus(key, UploadStatus.Error)
          aborted = true
        }
      }
    )

    if (shouldNotify && aborted) {
      this.toasterStore.info('已中止上传任务')
    }
  }

  @autobind
  @Toaster.handle()
  fetchFileState(key: string) {
    const req = this.resourceApis.getFileState(
      this.props.bucketName,
      { key },
      this.props.store.baseUrl
    )

    req.then(
      result => {
        this.props.store.addFile(
          key,
          { ...result, isNewFile: true }
        )
      },
      () => {
        this.props.store.addFile(key)
      }
    )
    return req
  }

  @autobind
  getFileInitStatus(key: string) {
    // 后端会以 \u0000 作为 key 和 version 之间的分隔符，因此要求 key 本身不要携带 \u0000
    // kodo 的 rs 服务后面都不会支持空文件名和带 \u0000 的文件名
    if (key.includes(versionSeparator)) {
      return UploadStatus.Invalid
    }

    // 检查该文件名在上传队列中是否已经存在（已上传完成的忽略）
    // TODO：portal 加 polyfill
    for (const value of this.uploadQueue.values()) {
      const states: UploadStatus[] = [UploadStatus.Pending, UploadStatus.Uploading, UploadStatus.Error]
      if (value.keyName === key && states.includes(value.status)) {
        return UploadStatus.InQueue
      }
    }

    return UploadStatus.Pending
  }

  @action.bound
  removeFromQueue(key: string) {
    this.uploadQueue.delete(key)
  }

  @action.bound
  changeFileStatus(key: string, status: UploadStatus) {
    const item = this.uploadQueue.get(key)!
    this.uploadQueue.set(key, {
      ...item,
      status
    })
  }

  @action.bound
  updatePutPolicy(transcodeList: ITranscodeStyleInfo[]) {
    if (!transcodeList || !transcodeList.length) {
      this.putPolicy = undefined
      return
    }

    this.putPolicy = {
      persistentOps: JSON.stringify(transcodeList.map(data => data.command)),
      persistentNotifyUrl: JSON.stringify(transcodeList.map(data => data.callback_url)),
      persistentPipeline: JSON.stringify(transcodeList.map(data => data.pipeline))
    }
  }

  @action.bound
  handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files!

    keysOf(files).forEach(key => {
      const id = uuid()
      const keyName = this.prefix.value + files[+key].name
      this.uploadQueue.set(String(id), {
        status: this.getFileInitStatus(keyName),
        file: files[+key],
        ftype: this.ftypeField.value,
        ...(this.putPolicy && { putPolicy: this.putPolicy }),
        isCovered: this.isCovered.value,
        keyName
      })

      this.disposable.addDisposer(when(
        () => {
          const uploadTask = this.uploadQueue.get(String(id))
          return Boolean(uploadTask && uploadTask.status === UploadStatus.Success)
        },
        () => {
          // 据说是因为开启了版本的情况下 BUG 极多所以关闭了该处理
          const { versionFieldState } = this.props.store
          if (!versionFieldState.value) {
            // 每次进入到上传页面并且上传了文件，则清理掉旧的已上传文件
            if (!this.hasClearedNewFiles) {
              this.props.store.clearNewFiles()
              this.hasClearedNewFiles = true
            }
            this.fetchFileState(keyName)
          }
          this.bucketStore.delayedFetchByName(this.props.bucketName)

          // sensors 手动统计
          sensorsTrack('FileUploaded', { fileKey: keyName })
        }
      ))
    })
    // input 两次选择相同文件不能触发 onChange 的问题是因为 onChange 的触发需要 value 改变，这里手动清一下 value
    e.target.value = ''
  }

  @computed
  get uploadQueueView() {
    if (this.bucketInfo == null) return null

    return [...this.uploadQueue.entries()].map(([key, value]) => (
      <UploadBar
        {...value}
        key={key}
        region={this.bucketInfo!.region}
        bucketName={this.props.bucketName}
        versionEnabled={this.versionEnabled}
        onFileStatusChange={status => this.changeFileStatus(key, status)}
        onRemove={() => this.removeFromQueue(key)}
      />
    ))
  }

  @computed
  get uploadBoxView() {
    return (
      <>
        <Card className={styles.uploadBox} title={`上传文件至 ${this.props.bucketName}`}>
          <table>
            <tbody>
              {this.uploadQueueView}
            </tbody>
          </table>
        </Card>
        <Row className={styles.optBox}>
          <Col span={12} className={styles.backoutCol}>
            <Role name={BucketFileUploadRole.BackEntry}>
              <a className={styles.backout} onClick={this.handleBeforeGoBack}>返回</a>
            </Role>
          </Col>
          <Col span={12}>
            <Role name={BucketFileUploadRole.SelectFileEntry}>
              <div className={styles.selectFileBox} {...sensorsTagFlag('upload', 'select-files')}>
                <span className={styles.selectText}>选择文件</span>
                <input
                  type="file"
                  className={styles.selectInput}
                  disabled={this.isReadonlyShareBucket}
                  multiple
                  onChange={this.handleFileChange}
                />
              </div>
            </Role>
          </Col>
        </Row>
      </>
    )
  }

  @Toaster.handle()
  fetchBucketByName(bucketName: string) {
    return this.bucketStore.fetchDetailsByName(bucketName)
  }

  componentDidMount() {
    this.disposable.addDisposer(() => {
      this.abortUploadQueue(true)
    })

    this.fetchBucketByName(this.props.bucketName)
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    return (
      <Role name={BucketFileUploadRole.UploadFilePage}>
        <div className={styles.mainContent}>
          <Row className={styles.info}>
            <Alert
              type="info"
              message={
                <>
                  新版文件管理现已在任务中心支持对新上传的文件进行复制外链、对上传成功的转码文件查看和复制转码任务 ID。
                  <Link
                    className={styles.link}
                    to={getResourceV2Path(
                      this.props.inject, { bucketName: this.props.bucketName, query: { isUploadModalOpen: true } }
                    )}
                    {...sensorsTagFlag('resource-manage', 'upload', 'switch-to-new')}
                  >使用新版</Link>
                </>
              }
            />
          </Row>
          <Row>
            <Col span={16}>
              {this.uploadBoxView}
            </Col>
            <Col span={7} offset={1}>
              <Setting
                bucketName={this.props.bucketName}
                updatePutPolicy={this.updatePutPolicy}
                ftypeField={this.ftypeField}
                isCovered={this.isCovered}
                prefix={this.prefix}
              />
            </Col>
          </Row>
        </div>
      </Role>
    )
  }
}

export default function UploadManage(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalUploadManage {...props} inject={inject} />
    )} />
  )
}
