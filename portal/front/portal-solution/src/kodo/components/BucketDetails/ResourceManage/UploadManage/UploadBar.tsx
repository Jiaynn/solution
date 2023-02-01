/**
 * @file component UploadBar 上传进度条
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { action, computed, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Icon, Tooltip } from 'react-icecream/lib'
import * as qiniu from 'qiniu-js'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { getUploadBaseOptions } from 'kodo/utils/upload'

import { humanizeStorageSize, transformNumberToPercent } from 'kodo/transforms/unit'

import { DomainStore } from 'kodo/stores/domain'

import { RegionSymbol } from 'kodo/constants/region'
import { progressColorMap, uploadBarBgColorMap, UploadStatus, uploadStatusTextMap } from 'kodo/constants/bucket/resource'

import { ResourceApis } from 'kodo/apis/bucket/resource'
import { TokenApis } from 'kodo/apis/bucket/token'

import { IQueue } from './index'
import styles from './style.m.less'

export interface IProps extends IQueue {
  onRemove(): void
  onFileStatusChange(status: UploadStatus): void
  versionEnabled: boolean
  bucketName: string
  ftype: number
  region: RegionSymbol
}

interface DiDeps {
  inject: InjectFunc
}

export interface IProgress {
  total: IProgressTotal
}

export interface IProgressTotal {
  percent: number
}

@observer
class InternalUploadBar extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  tokenApis = this.props.inject(TokenApis)
  domainStore = this.props.inject(DomainStore)
  resourceApis = this.props.inject(ResourceApis)

  @observable percent = 0

  @observable token: string | undefined = undefined

  subscription: ReturnType<ReturnType<typeof qiniu.upload>['subscribe']> | undefined = undefined

  retryCount: number
  disposable = new Disposable()

  @computed
  get bgWithProgress() {
    const { status } = this.props
    return `linear-gradient(
      to right,
      ${progressColorMap[status]} ${transformNumberToPercent(this.percent)},
      ${uploadBarBgColorMap[status]} ${transformNumberToPercent(this.percent)},
      ${uploadBarBgColorMap[status]} 100%
    )`
  }

  @computed
  get uploadHandler() {
    const { file, keyName } = this.props
    const putExtra = {
      fname: file.name // 后端需要这个来是转码命令支持分片
    }

    const config = {
      ...getUploadBaseOptions(this.domainStore.getUpHostByRegion(this.props.region)),
      disableStatisticsReport: true
    }
    return qiniu.upload(file, keyName, this.token!, putExtra, config)
  }

  @autobind
  remove() {
    this.props.onRemove()
  }

  @autobind
  continueUpload() {
    this.handleUpload()
  }

  @action.bound
  stopUpload() {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.updatePercent(0)
    }
  }

  @action.bound
  doUpload() {
    this.props.onFileStatusChange(UploadStatus.Uploading)
    this.subscription = this.uploadHandler.subscribe({
      next: (progress: IProgress) => this.updatePercent(progress.total.percent),
      error: err => {
        if (err instanceof qiniu.QiniuRequestError) {
          if (err.code === 401 && this.retryCount) {
            --this.retryCount
            this.fetchUpToken().then(() => {
              this.doUpload()
            })
            return
          }

          if (err.code === 400) {
            if (err.data && typeof err.data.error === 'string') {
              if (err.data.error === 'invalid argument') {
                this.props.onFileStatusChange(UploadStatus.InvalidArgument)
              } else if (err.data.error.includes('invalid persistentOps with variables')) {
                this.props.onFileStatusChange(UploadStatus.InvalidTransCodeStyleParams)
              } else {
                this.props.onFileStatusChange(UploadStatus.Overload)
              }
            } else {
              this.props.onFileStatusChange(UploadStatus.Overload)
            }
            this.updatePercent(0)
            return
          }

          if (err.code === 614) {
            this.props.onFileStatusChange(UploadStatus.Exist)
            this.updatePercent(0)
            return
          }

          if (err.data && err.data.error_code === UploadStatus.AccessDeniedByWorm) {
            this.props.onFileStatusChange(UploadStatus.AccessDeniedByWorm)
            this.updatePercent(0)
            return
          }
        }

        this.props.onFileStatusChange(UploadStatus.Error)
        this.updatePercent(0)
      },
      complete: () => {
        this.props.onFileStatusChange(UploadStatus.Success)
      }
    })
  }

  resetRetryCount() {
    this.retryCount = 3
  }

  async checkBeforeUpload() {
    if ((await this.resourceApis.hasSensitiveWord(this.props.keyName)).has_sensitive_word) {
      this.props.onFileStatusChange(UploadStatus.Sensitive)
      return false
    }

    if (this.props.isCovered) { return true }

    try {
      if (await this.resourceApis.isFileAvailable(this.props.bucketName, { key: this.props.keyName })) {
        this.props.onFileStatusChange(UploadStatus.Exist)
        return false
      }
    } catch {
      /**
       * 检查文件名的接口在 IAM 子账号下受文件查询相关权限限制，这种情况下调接口会出错进入 catch 分支，如果因为权限不足就中断上传，
       * 会导致有上传文件权限却没有查询文件权限的 IAM 子账号无法顺利上传文件，所以此处接口调用异常不进行处理，继续进行上传。
       */
    }

    return true
  }

  async handleUpload() {
    try {
      const isCheckPassed = await this.checkBeforeUpload()

      if (isCheckPassed) {
        this.fetchUpToken().then(() => {
          this.resetRetryCount()
          this.doUpload()
        })
      }
    } catch {
      this.props.onFileStatusChange(UploadStatus.Error)
    }
  }

  @action.bound
  updateToken(token: string) {
    this.token = token
  }

  @action.bound
  updatePercent(percent: number) {
    this.percent = percent
  }

  @autobind
  @Toaster.handle()
  fetchUpToken() {
    const { bucketName, keyName, putPolicy } = this.props
    const policy = {
      ...putPolicy,
      fileType: this.props.ftype,
      forceInsertOnly: !this.props.isCovered,
      scope: `${bucketName}:${keyName}`
    }
    const req = this.tokenApis.getUpToken(bucketName, policy)
    req.then(this.updateToken)
      .catch(() => this.props.onFileStatusChange(UploadStatus.Error))

    return req
  }

  @computed
  get progressView() {
    const { status, keyName, file } = this.props

    const states: UploadStatus[] = [
      UploadStatus.Exist,
      UploadStatus.InQueue,
      UploadStatus.Overload,
      UploadStatus.Invalid,
      UploadStatus.MaxSize,
      UploadStatus.Sensitive,
      UploadStatus.Error,
      UploadStatus.AccessDeniedByWorm,
      UploadStatus.InvalidTransCodeStyleParams,
      UploadStatus.InvalidArgument
    ]

    const errorStates: UploadStatus[] = [UploadStatus.Error, UploadStatus.AccessDeniedByWorm]

    if (states.includes(status)) {
      return (
        <>
          <td className={styles.fileName}>
            {keyName}
          </td>
          <td className={styles.fileSize}>
            {
              errorStates.includes(status) ? humanizeStorageSize(file.size) : uploadStatusTextMap[status]
            }
          </td>
          <td className={styles.errorInfo}>
            {
              errorStates.includes(status) ? uploadStatusTextMap[status] : ''
            }
          </td>
          <td className={styles.operation}>
            <Tooltip title="删除">
              <Icon type="minus-circle-o" className={styles.delete} onClick={this.remove} />
            </Tooltip>
            {
              status === UploadStatus.Error
                ? (
                  <Tooltip title="继续上传">
                    <Icon type="upload" className={styles.upload} onClick={this.continueUpload} />
                  </Tooltip>
                )
                : ''
            }
          </td>
        </>
      )
    }

    return (
      <>
        <td className={styles.fileName}>
          {keyName}
        </td>
        <td className={styles.fileSize}>{humanizeStorageSize(file.size)}</td>
        <td className={styles.percent}>
          {Math.floor(this.percent * 100) / 100}%
        </td>
        <td className={styles.operation}>
          {
            status === UploadStatus.Success
              ? (<Icon type="check-circle-o" className={styles.success} />)
              : (
                <Icon
                  type="close"
                  className={styles.cancel}
                  onClick={() => this.props.onFileStatusChange(UploadStatus.Error)}
                />
              )
          }
        </td>
      </>
    )
  }

  render() {
    return (
      <tr
        className={styles.uploadBar}
        style={{
          background: this.bgWithProgress
        }}
      >
        {this.progressView}
      </tr>
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  componentDidMount() {
    // TODO: SDK 当出现 error 后其实会中止本次上传，所以如果是 sdk error 接口调用后，上传已被中止
    // 所以这里的监听状态可以优化，后续把状态定义划分更清楚点，后面单门提个 pr 优化下这里

    // 点击暂停或出现网络故障等会改变文件状态为 Error，空间限量的会改变文件状态为 Overload
    // 出现上两种状态后代表当前文件需要中止上传
    this.disposable.addDisposer(reaction(
      () => [
        UploadStatus.Error,
        UploadStatus.AccessDeniedByWorm,
        UploadStatus.Overload,
        UploadStatus.InvalidArgument,
        UploadStatus.InvalidTransCodeStyleParams
      ].includes(this.props.status),
      shouldStop => {
        if (shouldStop) {
          this.stopUpload()
        }
      }
    ))

    // 结合 componentWillUnmount 使用，组件卸载时如果仍有正在上传的任务，则全都都中止掉
    this.disposable.addDisposer(() => {
      if ([UploadStatus.Uploading, UploadStatus.Pending].includes(this.props.status)) {
        this.stopUpload()
      }
    })

    if (![UploadStatus.InQueue, UploadStatus.Invalid, UploadStatus.MaxSize].includes(this.props.status)) {
      this.handleUpload()
    }
  }
}

export default function UploadBar(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalUploadBar {...props} inject={inject} />
    )} />
  )
}
