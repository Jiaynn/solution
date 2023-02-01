/*
 * @file component UploadCertForm in SSLOverview
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import React from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import Button from 'react-icecream/lib/button'
import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import Radio, { RadioChangeEvent } from 'react-icecream/lib/radio'
import Col from 'react-icecream/lib/col'
import Alert from 'react-icecream/lib/alert'

import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import SslApis from '../../apis/ssl'
import { SSLFormItem } from '../SSLFormItem'

import './style.less'

const FormItem = Form.Item
const createForm = Form.create
const RadioGroup = Radio.Group

interface IUploadCertFormProps {
  onUploaded: () => void,
  onCancel: () => void
}
interface IAddonFormProps {
  form?: any
}

export type UploadCertFormProps = IUploadCertFormProps & IAddonFormProps

type UploadCertFormInnerProps = UploadCertFormProps & {
  sslApis: SslApis
  toasterStore: ToasterStore
}

type UploadValue = {
  name: string
  ca: string
  pri: string
}

@(createForm as any)()
@observer
export class UploadCertForm extends React.Component<UploadCertFormInnerProps> {
  constructor(props: UploadCertFormInnerProps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, props.toasterStore)
    this.handleCancel = this.handleCancel.bind(this)
    this.updateStep = this.updateStep.bind(this)
    this.updateCA = this.updateCA.bind(this)
    this.updateUploadData = this.updateUploadData.bind(this)
    this.initUploadCert = this.initUploadCert.bind(this)
    this.handleRadioChange = this.handleRadioChange.bind(this)
    this.checkIfShouldConfirm = this.checkIfShouldConfirm.bind(this)
    this.save = this.save.bind(this)
    this.handleUploadBtnClick = this.handleUploadBtnClick.bind(this)
    this.handleConfirmBtnClick = this.handleConfirmBtnClick.bind(this)
  }

  loadings = new Loadings('upload')
  @observable caid = 0
  @observable uploadData: UploadValue = {
    name: '',
    ca: '',
    pri: ''
  }
  @observable userCA = ''
  @observable serverCA = ''
  @observable uploadStep = 1

  @computed get isUploading() {
    return this.loadings.isLoading('upload')
  }

  @action handleCancel() {
    this.props.onCancel()
    this.initUploadCert()
  }

  @action handleRadioChange(e: RadioChangeEvent) {
    this.caid = e.target.value
  }

  @action updateCA(serverCa: string, userCa: string) {
    if (serverCa) {
      this.serverCA = serverCa
    }
    if (userCa) {
      this.userCA = userCa
    }
  }

  @action updateStep(step: number) {
    this.uploadStep = step
  }

  @action updateUploadData(values: UploadValue) {
    this.uploadData = {
      name: values.name,
      ca: values.ca,
      pri: values.pri
    }
  }

  @action initUploadCert() {
    this.updateStep(1)
    this.props.form.resetFields()
  }

  @action save() {
    return this.props.sslApis.saveSSLCert(this.uploadData).then(() => {
      this.initUploadCert()
      this.props.onUploaded()
    })
  }

  checkIfShouldConfirm(values: UploadValue) {
    return this.props.sslApis.fetchCert(values.ca).then(res => {
      if (values.ca.split('-----END CERTIFICATE-----').length <= 2) {
        // 一段CA，用拉取的补全证书提交
        values.ca = res.ca
        this.updateUploadData(values)
        return false
      }
      // 两段及以上，比对
      const serverCa = res.ca.replace(/\r/g, '').replace(/\n/g, '').replace(/\s/g, '')
      const userCa = values.ca.replace(/\r/g, '').replace(/\n/g, '').replace(/\s/g, '')
      if (userCa === serverCa) {
        return false
      }
      // 需要确认
      this.updateCA(res.ca, values.ca)
      return true
    })
  }

  @ToasterStore.handle()
  checkAndSubmit(values: UploadValue) {
    // 检查是否需要确认
    const result = this.checkIfShouldConfirm(values)
      .then(shouldConfirm => {
        if (shouldConfirm) {
          this.updateStep(2)
          return
        }
        return this.save().then(
          () => this.props.toasterStore.success('证书上传成功！')
        )
      }).catch(error => {
        this.initUploadCert()
        return Promise.reject(error)
      })

    return this.loadings.promise('upload', result)
  }

  handleUploadBtnClick() {
    return this.props.form.validateFields((errors: unknown, values: UploadValue) => {
      if (errors) {
        return
      }
      Object.keys(values).forEach((key: keyof UploadValue) => {
        values[key] = values[key].trim()
      })
      this.updateUploadData(values)
      this.checkAndSubmit(values)
    })
  }

  @ToasterStore.handle('证书上传成功！')
  handleConfirmBtnClick() {
    this.updateUploadData({
      ca: this.caid === 0 ? this.userCA : this.serverCA,
      pri: this.uploadData.pri.trim(),
      name: this.uploadData.name
    })
    const result = this.save().catch(error => {
      this.initUploadCert()
      return Promise.reject(error)
    })
    return this.loadings.promise('upload', result)
  }

  render() {
    const lightboxLeftAlignFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
    const { getFieldDecorator } = this.props.form

    const extraProps: any = { rows: 10 }

    return (
      <Form layout="horizontal">
        <div className={this.uploadStep === 2 ? 'hidden' : ''}>
          <Alert
            className="upload-warn"
            message={<span>请上传有效期不小于 30 天的证书。目前只支持 PEM 格式，其它格式请前往 <a className="link" href="https://myssl.com/cert_convert.html" target="_blank" rel="noopener">该站点</a> 转换。</span>}
            type="warning"
            showIcon
            closable={false}
          />
          <SSLFormItem {...{
            label: '证书备注名',
            required: true,
            layout: lightboxLeftAlignFormItemLayout,
            fieldName: 'name',
            getFieldDecorator,
            rules: [
              { required: true, message: '必填' },
              { pattern: /^[a-zA-Z0-9_\s\-*.()\u4e00-\u9fa5]+$/, message: '仅支持中英文字符、数字、空格、_、-、*、.、()' },
              { whitespace: true, message: '不可以为空' }
            ],
            component: <Input />
          }} />
          <SSLFormItem {...{
            label: '证书内容 ( PEM格式 )',
            required: true,
            layout: lightboxLeftAlignFormItemLayout,
            fieldName: 'ca',
            getFieldDecorator,
            rules: [
              { required: true, message: '必填' },
              { whitespace: true, message: '不可以为空' }
            ],
            component: <Input.TextArea
              placeholder="请将证书内容(包含证书链)复制粘贴到此处"
              {...extraProps}
            />
          }} />
          <SSLFormItem {...{
            label: '证书私钥 ( PEM格式 )',
            required: true,
            layout: lightboxLeftAlignFormItemLayout,
            fieldName: 'pri',
            getFieldDecorator,
            rules: [
              { required: true, message: '必填' },
              { whitespace: true, message: '不可以为空' }
            ],
            component: <Input.TextArea
              placeholder="请将证书私钥复制粘贴到此处"
              {...extraProps}
            />
          }} />
        </div>
        {
          this.uploadStep === 2
          ? <FormItem required>
            <Alert
              message="系统检测到您上传的证书内容与系统自动补全的不一致，请选择一个版本并上传。"
              type="warning"
              showIcon
              closable={false}
            />
            <a className="help-btn" href="https://developer.qiniu.com/ssl/kb/3703/the-certificate-chain-is-what" target="_blank" rel="noopener">帮助</a>
            <RadioGroup onChange={this.handleRadioChange} value={this.caid}>
              <Radio key="a" value={0} style={{ width: '50%' }}>原自有证书内容</Radio>
              <Radio key="b" value={1} style={{ width: '50%' }}>系统补全证书内容</Radio>
            </RadioGroup>
            <Col span={12}>
              <pre className="cert-ca">{this.userCA}</pre>
            </Col>
            <Col span={12}>
              <pre className="cert-ca">{this.serverCA}</pre>
            </Col>
          </FormItem>
          : null
        }
        <hr className="split-line sub-split-line" />
        <div className="footer-center">
          <Button key="back" type="ghost" onClick={this.handleCancel}>取消</Button>
          <Button key="submit" type="primary" disabled={this.isUploading} onClick={this.uploadStep === 1 ? this.handleUploadBtnClick : this.handleConfirmBtnClick}>确定上传</Button>
        </div>
      </Form>
    )
  }
}

export default observer(function _UploadCertForm(props: UploadCertFormProps) {
  const sslApis = useInjection(SslApis)
  const toasterStore = useInjection(ToasterStore)
  return <UploadCertForm {...props} sslApis={sslApis} toasterStore={toasterStore} />
})
