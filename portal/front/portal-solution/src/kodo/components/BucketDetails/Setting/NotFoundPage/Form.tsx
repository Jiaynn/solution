/**
 * @description Bucket setting 404 page form card
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Form, Radio, Input, Icon } from 'react-icecream/lib'
import { FormState, FieldState } from 'formstate'
import Upload, { UploadFile } from 'react-icecream/lib/upload'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { valuesOf } from 'kodo/utils/ts'
import { bindFormItem, getValuesFromFormState } from 'kodo/utils/formstate'
import { bindRadioField } from 'kodo/utils/formstate/bind'

import { getResourceProxyUrl } from 'kodo/transforms/bucket/resource'
import { humanizeNotFoundPageType, isImageType } from 'kodo/transforms/bucket/setting/not-found-page'

import noPrevImage from 'kodo/styles/images/no-prev.png'

import { ConfigStore } from 'kodo/stores/config'

import { NotFoundPageType } from 'kodo/constants/bucket/setting/not-found-page'
import { RegionSymbol } from 'kodo/constants/region'
import styles from './style.m.less'

export interface IValue {
  type: string
  file: UploadFile
}

export type IState = FormState<{
  type: FieldState<string>
  file: FieldState<UploadFile | undefined>
}>

interface IFormItemLayout {
  labelCol: object
  wrapperCol: object
}

export interface IProps {
  state: IState
  region?: RegionSymbol
  formItemLayout?: IFormItemLayout
  isUploading?: boolean
  fileUrl?: string
  fileType?: string
}

interface DiDeps {
  inject: InjectFunc
}

export function createState(value: Partial<IValue> = {}): IState {
  const initialValue = {
    type: NotFoundPageType.Default,
    file: undefined,
    ...value
  }
  return new FormState({
    type: new FieldState(initialValue.type),
    file: new FieldState(initialValue.file).validators(file => !file && '请选择文件')
  })
}

export function getValue(state: IState): IValue {
  return getValuesFromFormState(state) as any
}

const defaultFormItemLayout = {
  labelCol: { xs: { span: 24 }, sm: { span: 4 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 20 } }
}

@observer
class InternalNotFoundInput extends React.Component<IProps & DiDeps> {
  toasterStore = this.props.inject(Toaster)
  configStore = this.props.inject(ConfigStore)

  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @computed get formItemLayout() {
    return this.props.formItemLayout || defaultFormItemLayout
  }

  @computed get pageTypeView() {
    return (
      <Form.Item label="当前状态" {...this.formItemLayout} {...bindFormItem(this.props.state.$.type)}>
        <Radio.Group {...bindRadioField(this.props.state.$.type)}>
          {valuesOf(NotFoundPageType).map(
            type => <Radio key={type} value={type}>{humanizeNotFoundPageType(type)}</Radio>
          )}
        </Radio.Group>
      </Form.Item>
    )
  }

  @autobind beforeImageUpload(file: UploadFile, field: FieldState<UploadFile | undefined>) {

    if (!file) {
      return this.toasterStore.error('未选择文件!')
    }

    if (file.size / 1024 / 1024 > 20) {
      return this.toasterStore.error('文件大小不得超过 20MB')
    }

    field.onChange(file)
    return false
  }

  @computed get previewImageUrl(): string {
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
    let localPreviewImageUrl = ''
    let remotePreviewImageUrl = ''

    if (localFile) {
      localPreviewImageUrl = isImageType(localFile.type)
        ? window.URL.createObjectURL(localFile as unknown as File)
        : noPrevImage
    }

    if (this.props.region == null) {
      throw new Error('region is undefined')
    }

    if (this.props.fileUrl) {
      remotePreviewImageUrl = isImageType(this.props.fileType)
        ? getResourceProxyUrl(this.configStore, this.props.fileUrl, this.props.region)
        : noPrevImage
    }

    return localPreviewImageUrl || remotePreviewImageUrl
  }

  @computed get previewView() {
    const field = this.props.state.$.file

    if (this.props.state.$.type.$ === NotFoundPageType.Default) {
      return (
        <Form.Item label="效果预览" {...this.formItemLayout}>
          <Input.TextArea value={'{"error": "Document not found"}'} className={styles.textarea} />
        </Form.Item>
      )
    }

    const preview = this.previewImageUrl && (
      <img src={this.previewImageUrl} className={styles.previewImg} alt="404page" />
    )

    let uploadButtonIconType: string
    if (this.props.isUploading) {
      uploadButtonIconType = 'loading'
    } else {
      uploadButtonIconType = preview ? 'redo' : 'plus'
    }

    const uploadButton = (
      <div className={styles.uploadBtnWrapper}>
        <Icon type={uploadButtonIconType} />
        <div className="ant-upload-text">
          {preview ? '重新' : '点击'}
          选择文件
        </div>
      </div>
    )

    return (
      <Form.Item label="效果预览" {...this.formItemLayout} {...bindFormItem(field)}>
        <Upload
          listType="picture-card"
          className={styles.pageUploader}
          showUploadList={false}
          fileList={field.value ? [field.value] : []}
          beforeUpload={file => this.beforeImageUpload(file, field)}
        >
          {preview}
          {uploadButton}
        </Upload>
      </Form.Item>
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
  return (
    <Inject render={({ inject }) => (
      <InternalNotFoundInput {...props} inject={inject} />
    )} />
  )
}
