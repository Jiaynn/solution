/*
 * @file component DownloadCertForm in SSLOverview
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import React from 'react'
import { observable, action, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import Disposable from 'qn-fe-core/disposable'

import Button from 'react-icecream/lib/button'
import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import Select from 'react-icecream/lib/select'
import { withQueryParams } from 'qn-fe-core/utils'

import './style.less'

const FormItem = Form.Item
const Option = Select.Option

const lightboxLeftAlignFormItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
}

const certFormatOptions = [
  { value: 'PEM_Nginx', text: 'PEM (适用于 Nginx, SLB)' },
  { value: 'PEM_Apache', text: 'PEM (通用型 适用于 Apache, F5 等)' },
  { value: 'PEM_Haproxy', text: 'PEM (适用于 Haproxy)' },
  { value: 'JKS', text: 'JKS (适用于 tomcat, weblogic, Jboss)' },
  { value: 'JKS_TOMCAT8.5+', text: 'JKS (适用于 tomcat 8.5+)' },
  { value: 'PKCS12', text: 'PKCS12(即 PFX) (适用于 IIS, xchange, 代码签名)' }
]

interface IDownloadCertFormProps {
  certId: string,
  brand: string,
  sslType: string
}

export type CertFormat = 'PEM_Nginx' | 'PEM_Apache' | 'PEM_Haproxy' | 'JKS' | 'JKS_TOMCAT8.5+' | 'PKCS12'

@observer
export default class DownloadCertForm extends React.Component<IDownloadCertFormProps> {
  constructor(props: IDownloadCertFormProps) {
    super(props)
    makeObservable(this)
    this.handleDownloadBtnClick = this.handleDownloadBtnClick.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleCertFormatChange = this.handleCertFormatChange.bind(this)
    this.resetForm = this.resetForm.bind(this)
  }

  disposable = new Disposable()

  @observable password = ''
  @observable certFormat: CertFormat = 'PEM_Nginx'

  @action handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.password = e.target.value
  }

  @action handleCertFormatChange(value: CertFormat) {
    this.certFormat = value
  }

  @action resetForm() {
    this.password = ''
    this.certFormat = 'PEM_Nginx'
  }

  handleDownloadBtnClick() {
    const params = {
      certid: this.props.certId,
      type: this.certFormat,
      key_store_pwd: this.password
    }
    const node = document.createElement('iframe')
    node.src = withQueryParams('/api/certificate/v1/ssl/download', params)
    node.style.display = 'none'
    document.body.appendChild(node)
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.certId,
      () => this.resetForm()
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    return (
      <Form layout="horizontal">
        <FormItem
          label="设置证书密码"
          {...lightboxLeftAlignFormItemLayout}
          required
        >
          <Input type="password" value={this.password} onChange={e => this.handlePasswordChange(e)} />
        </FormItem>
        <FormItem
          label="选择证书格式"
          {...lightboxLeftAlignFormItemLayout}
          required
        >
          <Select
            value={this.certFormat}
            onChange={(val: CertFormat) => this.handleCertFormatChange(val)}
          >
            {
              certFormatOptions.map(
                option => <Option key={option.value} value={option.value}>{ option.text }</Option>
              )
            }
          </Select>
        </FormItem>
        <hr className="split-line sub-split-line" />
        <div className="footer-center">
          <Button type="primary" disabled={!this.password.length} onClick={this.handleDownloadBtnClick}>确定下载</Button>
        </div>
      </Form>

    )
  }
}
