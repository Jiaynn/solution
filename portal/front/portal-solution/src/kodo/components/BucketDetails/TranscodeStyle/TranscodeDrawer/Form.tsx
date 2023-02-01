/**
 * @file Component TranscodeDrawer Form
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { Form } from 'react-icecream/lib'
import { computed, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FormState, FieldState } from 'formstate-x'
import { bindFormItem } from 'portal-base/common/form'
import Disposable from 'qn-fe-core/disposable'

import FormTrigger from 'kodo/components/common/FormTrigger'
import HelpDocLink from 'kodo/components/common/HelpDocLink'
import Prompt from 'kodo/components/common/Prompt'

import { IPrivatePipeline } from 'kodo/apis/transcode-style'
import * as formInputs from './FormInputs'
import { ITranscodeValue } from '..'

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 }
} as const

export interface IProps {
  bucketName: string
  formState: TranscodeForm
  privatePipelines: IPrivatePipeline[]
  isEditing: boolean
  handleSubmit(): void
  data?: ITranscodeValue
}

export interface IFormInputData {
  name: string
  targetName: string
  pipeline: string
  command: string
  process: string
  callbackUrl: string
  bucket?: string
}

export type TranscodeForm = FormState<{
  name: FieldState<string>
  targetName: FieldState<string>
  pipeline: FieldState<string>
  bucket: FieldState<string>
  callbackUrl: FieldState<string>
  command: formInputs.CommandState
}>

export function createFormState(
  data: ITranscodeValue | undefined,
  transcodeNameList: string[],
  privatePipelines: IPrivatePipeline[],
  isNameDisabled: boolean
): TranscodeForm {
  const initData: IFormInputData = {
    name: '',
    process: '',
    command: '',
    targetName: '',
    pipeline: '',
    callbackUrl: data ? data.callback_url : '',
    ...data
  }

  const form = new FormState({
    name: formInputs.createNameState(initData.name).validators(value => {
      if (!isNameDisabled && transcodeNameList.includes(value)) {
        return '转码名称已存在'
      }
    }),
    bucket: formInputs.createTargetBucketState(initData.bucket!),
    targetName: formInputs.createTargetNameState(initData.targetName),
    command: formInputs.createCommandState(initData.command, initData.process),
    callbackUrl: formInputs.createCallbackState(initData.callbackUrl),
    pipeline: formInputs.createPrivatePipelineState(initData.pipeline, privatePipelines)
  })

  return form
}

// eslint-disable-next-line no-template-curly-in-string
const magicVarsPattern = '${var}、$(var)'

class CommonForm extends React.Component<IProps> {
  disposable = new Disposable()

  constructor(props: IProps) {
    super(props)
    makeObservable(this)
  }

  @computed
  get targetNamePromptView() {
    return (
      <Prompt>
        目标文件名支持
        <HelpDocLink doc="magicVars" anchor="#magicvar">魔法变量</HelpDocLink>
        或自定义字符串。魔法变量引用格式为 {magicVarsPattern}，魔法变量仅支持 bucket、key、etag、fsize、mimeType、ext、endUser、fprefix、 keybase。
      </Prompt>
    )
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.formState,
      form => {
        if (form) {
          form.$.pipeline.validate()
        }
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    if (!this.props.formState) {
      return null
    }

    const fields = this.props.formState.$
    return (
      <Form
        onSubmit={e => {
          e.preventDefault()
          this.props.handleSubmit()
        }}
      >
        <FormTrigger />
        <Form.Item
          label="转码配置名称"
          required
          {...formItemLayout}
          {...bindFormItem(fields.name)}
        >
          <formInputs.Name
            state={fields.name}
            disabled={this.props.isEditing}
          />
        </Form.Item>
        <Form.Item
          label="转码命令"
          required
          {...formItemLayout}
          {...bindFormItem(fields.command)}
        >
          <formInputs.Command state={fields.command} />
        </Form.Item>
        <Form.Item
          label="目标空间"
          required
          {...formItemLayout}
          {...bindFormItem(fields.bucket)}
        >
          <formInputs.TargetBucket
            state={fields.bucket}
            bucketName={this.props.bucketName}
          />
        </Form.Item>
        <Form.Item
          label="目标文件名"
          required
          {...formItemLayout}
          {...bindFormItem(fields.targetName)}
          extra={this.targetNamePromptView}
        >
          <formInputs.TargetName
            state={fields.targetName}
          />
        </Form.Item>
        <Form.Item
          label="回调URL"
          {...formItemLayout}
          {...bindFormItem(fields.callbackUrl)}
        >
          <formInputs.Callback state={fields.callbackUrl} />
        </Form.Item>
        <Form.Item
          label="私有队列"
          {...formItemLayout}
          {...bindFormItem(fields.pipeline)}
        >
          <formInputs.PrivatePipeline
            state={fields.pipeline}
            privatePipelines={this.props.privatePipelines}
          />
        </Form.Item>
      </Form>
    )
  }
}

export default observer(CommonForm)
