import * as React from 'react'
import autobind from 'autobind-decorator'
import { action, computed, makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { Input } from 'react-icecream/lib'
import Upload, { UploadFile } from 'react-icecream/lib/upload'
import { AddThinIcon, CloseCircleFilledIcon } from 'react-icecream-2/icons'
import { FormItem, RadioGroup, Radio } from 'react-icecream-2/form-x'
import { LabelVerticalAlign, LayoutType } from 'react-icecream-2/esm/Form/defs'
import { FieldState } from 'formstate-x'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { valuesOf } from 'kodo/utils/ts'

import { getResourceProxyUrl } from 'kodo/transforms/bucket/resource'
import { humanizeNotFoundPageType, isImageType } from 'kodo/transforms/bucket/setting/not-found-page'

import { ConfigStore } from 'kodo/stores/config'

import { NotFoundPageType } from 'kodo/constants/bucket/setting/not-found-page'
import { RegionSymbol } from 'kodo/constants/region'
import { IState } from './StaticPageDrawer'

import styles from './style.m.less'

interface IFormItemLayout {
  labelGap: string
  labelVerticalAlign: LabelVerticalAlign
  layout: LayoutType
}

export interface IProps {
  state: IState
  region?: RegionSymbol
  formItemLayout?: IFormItemLayout
  isUploading?: boolean
  fileUrl?: string
  fileType?: string
  clear: () => void
}

interface DiDeps {
  toasterStore: Toaster
  configStore: ConfigStore
}

const defaultFormItemLayout: IFormItemLayout = {
  labelGap: '28px',
  labelVerticalAlign: 'text',
  layout: 'horizontal'
}

@observer
class InternalNotFoundInput extends React.Component<IProps & DiDeps> {
  toasterStore = this.props.toasterStore
  configStore = this.props.configStore
  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @observable isMouseEnter = false
  @observable isPreviewExisted = false

  @action.bound
  updateIsMouseEnter(val: boolean) {
    this.isMouseEnter = val
  }

  @action.bound
  updateIsPreviewExisted(val: boolean) {
    this.isPreviewExisted = val
  }

  @computed get formItemLayout() {
    return this.props.formItemLayout || defaultFormItemLayout
  }

  @computed get pageTypeView() {
    return (
      <FormItem label="404 页面" {...this.formItemLayout}>
        <RadioGroup state={this.props.state.$.type}>
          {valuesOf(NotFoundPageType).map(
            type => <Radio key={type} value={type}>{humanizeNotFoundPageType(type)}</Radio>
          )}
        </RadioGroup>
      </FormItem>
    )
  }

  @autobind beforeImageUpload(file: UploadFile, field: FieldState<UploadFile | undefined>) {

    if (!file) {
      return this.toasterStore.error('未选择文件!')
    }

    if (file.size / 1024 / 1024 > 20) {
      return this.toasterStore.error('支持上传单个文件，文件大小不得超过 20MB')
    }

    field.onChange(file)
    return false
  }

  @computed get previewImageUrl(): string | boolean {
    /**
    * @author Surmon <i@surmon.me>
    * local -> null: 本地控件无数据
    *  + 可能用户切换过去默认值保存后又切换回来，控件清空了文件内容
    *  + 亦或者用户从未上传过数据，第一次切换到自定义 Tab，此时如果远程有数据，则会展示远程的，否则空白
    * remote -> null: 用户没有已上传的有效数据
    *  + 这时如果本地控件有数据，则显示本地的，否则空白
    * both -> null: 远程也没有，本地也没有，预览则一片空白
    *
    * 任何一个值不为 null，则根据对应的文件类型，确定展示图片本身或 “不支持预览” 占位图
    * 预览图的优先级顺序为：本地 -> 远程 -> 空，是为了防止用户在上传过远程图片后又在本地控件上传数据（未保存），导致无法预览
    */
    const localFile = this.props.state.$.file.$

    if (this.props.region == null) {
      throw new Error('region is undefined')
    }

    if (localFile) {
      if (isImageType(localFile.type)) return window.URL.createObjectURL(localFile as unknown as File)
      return true
    }

    if (this.props.fileUrl) {
      if (isImageType(this.props.fileType)) {
        return getResourceProxyUrl(this.configStore, this.props.fileUrl, this.props.region)
      }
      return true
    }

    return false
  }

  @computed get previewView() {
    const field = this.props.state.$.file

    const handleCancelClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      field.reset()
      this.props.clear()
    }

    if (this.props.state.$.type.$ === NotFoundPageType.Default) {
      return (
        <FormItem label="效果预览" {...this.formItemLayout}>
          <Input.TextArea value={'{"error": "Document not found"}'} className={styles.textarea} />
        </FormItem>
      )
    }

    const cancelButton = (
      <div className={styles.cancelButton} onClick={handleCancelClick}>
        <CloseCircleFilledIcon />
      </div>
    )

    const getView = (elem: JSX.Element) => (
      <div
        className={styles.previewContent}
        onMouseEnter={() => { this.updateIsMouseEnter(true) }}
        onMouseLeave={() => { this.updateIsMouseEnter(false) }}
      >
        {this.isMouseEnter && cancelButton }
        {elem}
      </div>)

    let preview: JSX.Element | false = false
    if (this.previewImageUrl && typeof this.previewImageUrl === 'string') {
      preview = getView(<img src={this.previewImageUrl} className={styles.previewImg} alt="404page" />)
    }
    if (this.previewImageUrl && typeof this.previewImageUrl === 'boolean') {
      preview = getView(<p className={styles.previewImg}>不支持该文件格式的预览</p>)
    }

    const uploadButton = (
      <div className={styles.uploadBtnWrapper}>
        <AddThinIcon />
        <div className="ant-upload-text">
          <p><span className={styles.infoText}>点击上传</span>，或拖拽到此处</p>
          <p className={styles.mildText}>支持上传单个文件，文件大小不得超过 20MB</p>
        </div>
      </div>
    )

    return (
      <FormItem label="效果预览" {...this.formItemLayout} state={field}>
        <Upload
          listType="picture-card"
          className={styles.pageUploader}
          showUploadList={false}
          fileList={field.value ? [field.value] : []}
          beforeUpload={file => this.beforeImageUpload(file, field)}
        >
          {preview || uploadButton}
        </Upload>
      </FormItem>
    )
  }

  render() {
    return (
      <>
        {this.pageTypeView}
        {this.previewView}
      </>
    )
  }
}

export default function NotFoundInput(props: IProps) {
  const toasterStore = useInjection(Toaster)
  const configStore = useInjection(ConfigStore)
  return (
    <InternalNotFoundInput {...props} toasterStore={toasterStore} configStore={configStore} />
  )
}
