/**
 * @description Bucket setting 404 page card
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import * as qiniu from 'qiniu-js'
import moment from 'moment'
import autobind from 'autobind-decorator'
import { computed, reaction, observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button, Form } from 'react-icecream/lib'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import Disposable from 'qn-fe-core/disposable'
import { Inject, InjectFunc } from 'qn-fe-core/di'

import { valuesOf } from 'kodo/utils/ts'

import { getUploadBaseOptions } from 'kodo/utils/upload'

import { BucketStore } from 'kodo/stores/bucket'
import { DomainStore } from 'kodo/stores/domain'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { UploadStatus, uploadStatusTextMap } from 'kodo/constants/bucket/resource'
import { notFoundFileKey, NotFoundPageType } from 'kodo/constants/bucket/setting/not-found-page'

import { Auth } from 'kodo/components/common/Auth'

import { IFileStat, ResourceApis } from 'kodo/apis/bucket/resource'
import { TokenApis } from 'kodo/apis/bucket/token'
import { IBucket } from 'kodo/apis/bucket'

import NotFoundPageInput, { createState, getValue } from './Form'
import { injectMainBtnClickHookProps } from '../Card/sensors'
import SettingCard from '../Card'

import styles from '../style.m.less'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  UpdateFile = 'UpdateFile',
  FetchFileInfo = 'FetchFileInfo',
  FetchFileDownloadUrl = 'FetchFileDownloadUrl'
}

@observer
class InternalNotFoundPageCard extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  tokenApis = this.props.inject(TokenApis)
  bucketStore = this.props.inject(BucketStore)
  domainStore = this.props.inject(DomainStore)
  resourceApis = this.props.inject(ResourceApis)

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @computed get isUpdating() {
    return this.loadings.isLoading(Loading.UpdateFile)
  }
  @computed get isLoading() {
    return this.loadings.isLoading(Loading.FetchFileInfo) || this.loadings.isLoading(Loading.FetchFileDownloadUrl)
  }

  @computed get bucketInfo(): IBucket | undefined {
    return this.bucketStore.getDetailsByName(this.props.bucketName)
  }

  @computed get form() {
    return createState(this.initialValue)
  }

  @computed get value() {
    return getValue(this.form)
  }

  @computed get region() {
    return this.bucketInfo && this.bucketInfo.region
  }

  subscription: ReturnType<ReturnType<typeof qiniu.upload>['subscribe']> | undefined = undefined

  @autobind doUpload() {
    return new Promise<void>((resolve, reject) => {
      this.subscription = this.uploadHandler!.subscribe({
        error: err => {
          // TODO: file 上传状态管理?
          if (err instanceof qiniu.QiniuRequestError) {
            if (err.code === 401) {
              return reject('token 已过期，请刷新页面后重试')
            }

            if (err.data && err.data.error_code === UploadStatus.AccessDeniedByWorm) {
              return reject(uploadStatusTextMap[UploadStatus.AccessDeniedByWorm])
            }
          }

          return reject(err)
        },
        complete: () => {
          resolve()
        }
      })
    })
  }

  @autobind doDelete() {
    return this.resourceApis.deleteFileResource(
      this.props.bucketName,
      { key: notFoundFileKey }
    )
  }

  @autobind
  @Toaster.handle('保存成功')
  @Loadings.handle(Loading.UpdateFile)
  handleSaveClick() {

    // 默认模式
    if (this.value.type === NotFoundPageType.Default) {

      // 文件存在 -> 删除文件 & 更新状态 & 清空缩略图地址
      if (this.isFileExist) {
        return this.doDelete().then(action(() => {
          this.updateFileExist(false)
          this.clearNotFoundPageFile()
        }))
      }

      // 文件不存在 -> 直接返回
      return Promise.resolve()
    }

    // 自定义模式
    if (this.value.type === NotFoundPageType.Custom) {

      // 没有选择文件，即上传控件内为空
      if (!this.value.file) {
        return this.isFileExist
          // 若已存在远程文件 -> 直接返回保存成功
          ? Promise.resolve()
          // 否则，提示错误
          : Promise.reject('请选择文件')
      }

      // 上传数据
      return this.doUpload().then(() => {
        this.updateFileExist(!!this.value.file)
        this.fetchFileDownloadUrl(this.props.bucketName).then(() => {
          // 得到新文件的地址后，清空文件选择框的内容；避免之后再点击保存，造成重复无用上传
          // TODO: 公有云浏览器兼容性测试
          this.form.$.file.reset()
        })
      })
    }
  }

  @observable isFileExist = false

  @action updateFileExist(isExist: boolean) {
    this.isFileExist = isExist
  }

  @observable notFoundPageUrl: string | undefined
  @observable notFoundPageFileType: string | undefined

  // eslint-disable-next-line @typescript-eslint/naming-convention
  @action.bound updateNotFoundPageFile({ download_url, mimeType }: IFileStat) {
    const unixParam = 'random=' + moment().unix()
    const paramsPrefix = download_url.includes('?') ? '&' : '?'
    this.notFoundPageUrl = download_url + paramsPrefix + unixParam
    this.notFoundPageFileType = mimeType
  }

  @action.bound clearNotFoundPageFile() {
    this.notFoundPageUrl = undefined
    this.notFoundPageFileType = undefined
  }

  @computed get initialValue() {
    return {
      type: this.isFileExist ? NotFoundPageType.Custom : NotFoundPageType.Default,
      file: undefined
    }
  }

  @Toaster.handle()
  @Loadings.handle(Loading.FetchFileDownloadUrl)
  async fetchFileDownloadUrl(bucketName: string) {
    await this.domainStore.fetchAllDomainsByBucketName(bucketName)
    const baseUrl = this.domainStore.getResourceBaseUrl(bucketName)
    if (!baseUrl) {
      return
    }
    // 获取文件访问地址
    return this.resourceApis.getFileState(
      this.props.bucketName,
      { key: notFoundFileKey },
      baseUrl
    ).then(this.updateNotFoundPageFile)
  }

  @Toaster.handle()
  @Loadings.handle(Loading.FetchFileInfo)
  fetchNotFoundPageInfo(bucketName: string) {
    return this.resourceApis.isFileAvailable(bucketName, { key: notFoundFileKey }).then(isExist => {
      this.updateFileExist(isExist)
      // 如果文件存在，则说明是自定义，则请求文件下载地址
      return isExist
        ? this.fetchFileDownloadUrl(bucketName)
        : Promise.resolve()
    })
  }

  @observable isReady = false
  @action.bound updateReady(isReady: boolean) {
    this.isReady = isReady
  }

  @observable upToken: string | undefined = undefined
  @action updateUpToken(token: string) {
    this.upToken = token
  }

  @computed get uploadHandler() {
    const region = this.bucketInfo ? this.bucketInfo.region : ''
    if (!region || !this.upToken) {
      return null
    }

    const putExtra = {
      fname: '',
      params: {},
      mimeType: undefined
    }

    const config = {
      ...getUploadBaseOptions(this.domainStore.getUpHostByRegion(region)),
      disableStatisticsReport: true
    }

    // TODO: 类型问题，antd 类型 BUG
    // 实际 file: UploadFile 并不存在类型声明的 originFileObj 属性.
    // 更多相关信息：https://github.com/ant-design/ant-design/issues/9775
    return qiniu.upload(this.value.file as any as File, notFoundFileKey, this.upToken, putExtra, config)
  }

  @Toaster.handle()
  fetchUpToken(bucketName: string) {
    return this.tokenApis.getUpToken(bucketName, {
      scope: `${bucketName}:${notFoundFileKey}`,
      insertOnly: 0
    }).then(
      token => this.updateUpToken(token)
    )
  }

  render() {
    return (
      <SettingCard
        className={styles.cardWithForm}
        title="404 页面设置"
        tooltip="配置 HTTP 请求时的 404 页面；设置的页面须保存在当前空间内。"
      >
        <NotFoundPageInput
          state={this.form}
          fileUrl={this.notFoundPageUrl}
          fileType={this.notFoundPageFileType}
          isUploading={this.isUpdating}
          region={this.bucketInfo && this.bucketInfo.region}
        />
        <Form.Item>
          <Auth
            notProtectedUser
            render={disabled => (
              <Button
                type="primary"
                onClick={this.handleSaveClick}
                loading={this.isUpdating}
                disabled={disabled || !this.isReady}
                {...injectMainBtnClickHookProps('404')}
              >
                确定
              </Button>
            )}
          />
        </Form.Item>
      </SettingCard>
    )
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.bucketName,
      bucketName => {
        this.bucketStore.fetchDetailsByName(bucketName).then(() => {
          // 获取空间的 404 页面现状
          this.updateReady(false)
          this.fetchNotFoundPageInfo(bucketName).then(
            () => this.updateReady(true)
          )

          // 上传的准备工作
          // 获取 upToken，从而可以计算出 uploadHandler
          this.fetchUpToken(bucketName)
        })
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }
}

export default function NotFoundPageCard(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalNotFoundPageCard {...props} inject={inject} />
    )} />
  )
}
