/**
 * @file upload certificate component
 * @description 上传证书页面
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { FormState, FieldState } from 'formstate'
import { InjectFunc, Inject } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { makeCancelled } from 'qn-fe-core/exception'
import { Form, Input } from 'react-icecream/lib'

import { valuesOfEnum } from 'kodo/utils/ts'
import { getValuesFromFormState, bindTextInputField, bindFormItem } from 'kodo/utils/formstate'

import { CertStore } from 'kodo/stores/certificate'

import { Drawer } from 'kodo/polyfills/icecream'

import Prompt from 'kodo/components/common/Prompt'
import FormTrigger from 'kodo/components/common/FormTrigger'

import styles from './style.m.less'

export interface IState {
  name?: string // 备注名称
  pemContent?: string // 证书内容
  privateKey?: string // 证书私钥
}

export interface IProps extends IState {
  onClose?: () => void // 关闭
  isVisible?: boolean // 显示
}

interface DiDeps {
  inject: InjectFunc
}

enum Loading {
  Create = 'create'
}

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 }
} as const

function nameValidator(name: string) {
  return !name && '请输入要备注名'
}

function pemContentValidator(pemContent: string) {
  return !pemContent && '请输入证书内容'
}

function privateKeyValidator(privateKey: string) {
  return !privateKey && '请输入证书私钥'
}

@observer
class InternalUploadDrawer extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  certStore = this.props.inject(CertStore)

  disposable = new Disposable()
  form = this.createFormState(this.props)
  loadings = Loadings.collectFrom(this, ...valuesOfEnum(Loading))

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.isVisible,
        isVisible => !isVisible && this.clearFormState(),
        { fireImmediately: true }
      )
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  get certificatePrompt() {
    return (
      <Prompt className={styles.prompt}>
        请上传有效期 ≥ 30 天的证书。目前只支持 PEM 格式，其他格式可前往
        <a
          target="_blank"
          rel="noopener"
          href="https://myssl.com/cert_convert.html"
        >
          https://myssl.com/cert_convert.html
        </a>
        进行转换
      </Prompt>
    )
  }

  @autobind
  createFormState(data: IState) {
    const { name, pemContent, privateKey } = data

    return new FormState({
      name: new FieldState<string>(name || '').validators(nameValidator),
      pemContent: new FieldState<string>(pemContent || '').validators(pemContentValidator),
      privateKey: new FieldState<string>(privateKey || '').validators(privateKeyValidator)
    })
  }

  @autobind
  clearFormState() {
    this.form.$.name.reset('')
    this.form.$.pemContent.reset('')
    this.form.$.privateKey.reset('')
  }

  @autobind
  @Toaster.handle('添加成功')
  @Loadings.handle(Loading.Create)
  async pushCertificateHandler() {
    const result = await this.form.validate()
    const formData = getValuesFromFormState(this.form)
    const { pemContent: ca, privateKey: pri, name } = formData

    if (result.hasError) {
      throw makeCancelled()
    }

    await this.certStore.add({ ca, pri, name })
    if (this.props.onClose != null) {
      this.props.onClose()
    }
  }

  render() {
    const { onClose, isVisible } = this.props
    const { name, pemContent, privateKey } = this.form.$

    return (
      <Drawer
        width={640}
        title="上传证书"
        onClose={onClose}
        visible={isVisible}
        onOk={this.pushCertificateHandler}
        confirmLoading={this.loadings.isLoading(Loading.Create)}
        okButtonProps={{ disabled: this.loadings.isLoading(Loading.Create) }}
        closeButtonProps={{ disabled: this.loadings.isLoading(Loading.Create) }}
      >
        {this.certificatePrompt}
        <Form
          layout="horizontal"
          className={styles.form}
        >
          <FormTrigger />
          <Form.Item
            required
            label="证书名称"
            {...formItemLayout}
            {...bindFormItem(name)}
          >
            <Input
              placeholder="请输入证书名称"
              value={name.value}
              onChange={e => name.onChange(e.currentTarget.value)}
            />
          </Form.Item>
          <Form.Item
            required
            {...formItemLayout}
            label="证书内容（PEM 格式）"
            {...bindFormItem(pemContent)}
          >
            <Input.TextArea
              placeholder="请输入证书内容（PEM 格式）"
              rows={4}
              {...bindTextInputField(pemContent)}
            />
          </Form.Item>
          <Form.Item
            required
            {...formItemLayout}
            label="证书私钥（PEM 格式）"
            {...bindFormItem(privateKey)}
          >
            <Input.TextArea
              placeholder="请输入证书私钥（PEM 格式）"
              rows={4}
              {...bindTextInputField(privateKey)}
            />
          </Form.Item>
        </Form>
      </Drawer>
    )
  }

}

export default function UploadDrawer(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalUploadDrawer {...props} inject={inject} />
    )} />
  )
}
