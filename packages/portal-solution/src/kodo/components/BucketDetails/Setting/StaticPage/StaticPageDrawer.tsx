
import * as React from 'react'
import * as qiniu from 'qiniu-js'
import moment from 'moment'
import autobind from 'autobind-decorator'
import { computed, reaction, observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { UploadFile } from 'react-icecream/lib/upload'
import { DrawerForm, Alert, FormFooter, Tooltip } from 'react-icecream-2'
import { FormItem, Switch } from 'react-icecream-2/form-x'
import { FileIcon } from 'react-icecream-2/icons'
import { FormState, FieldState } from 'formstate-x'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import Disposable from 'qn-fe-core/disposable'
import { useInjection } from 'qn-fe-core/di'

import { valuesOf } from 'kodo/utils/ts'
import { getUploadBaseOptions } from 'kodo/utils/upload'

import docStyles from 'kodo/styles/card.m.less'

import { DomainStore } from 'kodo/stores/domain'
import { BucketStore } from 'kodo/stores/bucket'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { UploadStatus, uploadStatusTextMap } from 'kodo/constants/bucket/resource'
import { notFoundFileKey, NotFoundPageType } from 'kodo/constants/bucket/setting/not-found-page'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import { IFileStat, ResourceApis } from 'kodo/apis/bucket/resource'
import { TokenApis } from 'kodo/apis/bucket/token'
import { IBucket } from 'kodo/apis/bucket'
import { DefaultIndexApis } from 'kodo/apis/bucket/setting/default-index'
import NotFoundPageInput from './NotFoundPageForm'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions {
  visible: boolean
  setVisible: (val: boolean) => void
}

enum Loading {
  UpdateFile = 'UpdateFile',
  FetchFileInfo = 'FetchFileInfo',
  FetchFileDownloadUrl = 'FetchFileDownloadUrl',
  UpdateDefaultIndex = 'UpdateDefaultIndex',
  GetBucketInfo = 'GetBucketInfo'
}

interface DiDeps {
  tokenApis: TokenApis
  bucketStore: BucketStore
  domainStore: DomainStore
  resourceApis: ResourceApis
  defaultIndexApis: DefaultIndexApis
  toaster: Toaster
}
export interface IValue {
  defaultIndexPage: boolean
  type: string
  file: UploadFile | undefined
}

export type IState = FormState<{
  defaultIndexPage: FieldState<boolean>
  type: FieldState<string>
  file: FieldState<UploadFile | undefined>
}>

function createState(value: Partial<IValue> = {}) {
  const initialValue = {
    defaultIndexPage: false,
    type: NotFoundPageType.Default,
    file: undefined,
    ...value
  }
  return new FormState({
    defaultIndexPage: new FieldState(initialValue.defaultIndexPage),
    type: new FieldState(initialValue.type),
    file: new FieldState(initialValue.file).validators(file => !file && '请选择文件')
  })
}

function getValue(state: IState): IValue {
  return {
    defaultIndexPage: state.$.defaultIndexPage.value,
    type: state.$.type.value,
    file: state.$.file.value
  }
}
@observer
class InternalStaticPageDrawer extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.toaster
    Toaster.bindTo(this, toaster)
  }

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @computed get isUpdating() {
    return this.loadings.isLoading(Loading.UpdateFile)
  }
  @computed get isLoading() {
    return this.loadings.isLoading(Loading.FetchFileInfo) || this.loadings.isLoading(Loading.FetchFileDownloadUrl)
  }

  @computed get bucketInfo(): IBucket | undefined {
    return this.props.bucketStore.getDetailsByName(this.props.bucketName)
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
  // 判断表单是否有变动
  @computed get isChanged() {
    let result = false
    // 404 选择默认但存在远程文件 => 有变动
    if (this.value.type === NotFoundPageType.Default && this.isFileExist) result ||= true
    // 404 选择自定义
    if (this.value.type === NotFoundPageType.Custom && !!this.value.file) result ||= true
    // 默认首页与初始值不同 => 有变动
    if (this.value.defaultIndexPage !== this.initialValue.defaultIndexPage) result ||= true

    return result
  }
  @autobind
  @Loadings.handle(Loading.GetBucketInfo)
  fetchBucketInfo() {
    return this.props.bucketStore.fetchDetailsByName(this.props.bucketName)
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
    return this.props.resourceApis.deleteFileResource(
      this.props.bucketName,
      { key: notFoundFileKey }
    )
  }

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.UpdateFile)
  saveNotFoundPage() {
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

  @autobind
  @Toaster.handle()
  @Loadings.handle(Loading.UpdateDefaultIndex)
  saveDefaultIndexPage() {
    return this.props.defaultIndexApis.updateDefaultIndexState(this.props.bucketName, +!this.value.defaultIndexPage)
  }

  @autobind
  @Toaster.handle('保存成功')
  handleSaveClick() {
    // 上传的准备工作
    // 获取 upToken，从而可以计算出 uploadHandler
    const pNotFoundPage = this.fetchUpToken(this.props.bucketName).then(this.saveNotFoundPage)
    const pDefaultIndexPage = this.saveDefaultIndexPage()
    return Promise.all([pNotFoundPage, pDefaultIndexPage])
      .then(() => {
        this.props.setVisible(false)
        this.form.reset()
        this.fetchBucketInfo()
      })
  }

  @autobind
  handleCancel() {
    this.props.setVisible(false)
    this.form.reset()
    // reset
    this.fetchNotFoundPageInfo(this.props.bucketName)
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
      defaultIndexPage: (this.bucketInfo && !this.bucketInfo.no_index_page) || false,
      type: this.isFileExist ? NotFoundPageType.Custom : NotFoundPageType.Default,
      file: undefined
    }
  }

  @Toaster.handle()
  @Loadings.handle(Loading.FetchFileDownloadUrl)
  async fetchFileDownloadUrl(bucketName: string) {
    await this.props.domainStore.fetchAllDomainsByBucketName(bucketName)
    const baseUrl = this.props.domainStore.getResourceBaseUrl(bucketName)
    if (!baseUrl) {
      return
    }
    // 获取文件访问地址
    return this.props.resourceApis.getFileState(
      this.props.bucketName,
      { key: notFoundFileKey },
      baseUrl
    ).then(this.updateNotFoundPageFile)
  }

  @Toaster.handle()
  @Loadings.handle(Loading.FetchFileInfo)
  fetchNotFoundPageInfo(bucketName: string) {
    return this.props.resourceApis.isFileAvailable(bucketName, { key: notFoundFileKey }).then(isExist => {
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
      ...getUploadBaseOptions(this.props.domainStore.getUpHostByRegion(region)),
      disableStatisticsReport: true
    }

    // TODO: 类型问题，antd 类型 BUG
    // 实际 file: UploadFile 并不存在类型声明的 originFileObj 属性.
    // 更多相关信息：https://github.com/ant-design/ant-design/issues/9775
    return qiniu.upload(this.value.file as any as File, notFoundFileKey, this.upToken, putExtra, config)
  }

  @Toaster.handle()
  fetchUpToken(bucketName: string) {
    return this.props.tokenApis.getUpToken(bucketName, {
      scope: `${bucketName}:${notFoundFileKey}`,
      insertOnly: 0
    }).then(
      token => this.updateUpToken(token)
    )
  }

  render() {
    const { visible } = this.props

    return (
      <DrawerForm
        width={594}
        title={
          <div>
            设置静态页面
            <Tooltip title="文档">
              <HelpDocLink doc="staticPageSetting" className={docStyles.extraButton}>
                <span className={styles.fileIcon}>
                  <FileIcon />
                </span>
              </HelpDocLink>
            </Tooltip>
          </div>
        }
        visible={visible}
        onCancel={this.handleCancel}
        onSubmit={this.handleSaveClick}
        layout="horizontal"
        labelGap="28px"
        footer={
          <FormFooter submitButtonProps={{ disabled: !this.isChanged }} />
        }
      >
        <Alert
          className={styles.alert}
          message={
            <>
              默认⾸⻚功能默认关闭；开启后，空间根⽬录及⼦⽬录中的 index.html（或
              index.htm）⽂件将会作为默认⾸⻚进⾏展示。<br />
              空间使⽤默认 404 ⻚⾯效果；若选择⾃定义 404 ⻚⾯，上传的⽂件将被命名为
              errno-404 并保存在当前空间根⽬录中。
            </>
          }
        />

        <FormItem
          label="默认首页"
          labelVerticalAlign="text"
        >
          <Switch
            state={this.form.$.defaultIndexPage}
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />
        </FormItem>

        <NotFoundPageInput
          state={this.form}
          fileUrl={this.notFoundPageUrl}
          fileType={this.notFoundPageFileType}
          isUploading={this.isUpdating}
          region={this.bucketInfo && this.bucketInfo.region}
          clear={this.clearNotFoundPageFile}
        />
      </DrawerForm>
    )
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.bucketName,
      bucketName => {
        this.props.bucketStore.fetchDetailsByName(bucketName).then(() => {
          // 获取空间的 404 页面现状
          this.updateReady(false)
          this.fetchNotFoundPageInfo(bucketName).then(
            () => this.updateReady(true)
          )
        })
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }
}

export default function StaticPageDrawer(props: IProps) {
  const tokenApis = useInjection(TokenApis)
  const bucketStore = useInjection(BucketStore)
  const domainStore = useInjection(DomainStore)
  const resourceApis = useInjection(ResourceApis)
  const defaultIndexApis = useInjection(DefaultIndexApis)
  const toaster = useInjection(Toaster)
  return (
    <InternalStaticPageDrawer
      tokenApis={tokenApis}
      bucketStore={bucketStore}
      domainStore={domainStore}
      resourceApis={resourceApis}
      defaultIndexApis={defaultIndexApis}
      toaster={toaster}
      {...props}
    />
  )
}
