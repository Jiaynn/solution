/*
 * @file component UploadLightboxForm in SSLOvConfirmation
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import React from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import Modal from 'react-icecream/lib/modal'
import Button from 'react-icecream/lib/button'
import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import Icon from 'react-icecream/lib/icon'

import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import SslApis from '../../apis/ssl'

import './style.less'

const FormItem = Form.Item
const createForm = Form.create

export interface IUploadFormProps {
  orderid: string,
  onCancel: () => any
}
interface IAddonFormProps {
  form?: any
}

export type LightboxFormProps = IUploadFormProps & IAddonFormProps

type LightboxFormInnerProps = LightboxFormProps & {
  sslApis: SslApis
  toasterStore: ToasterStore
}

export type FileStatus = 'pending' | 'done' | 'failed'

export type FieldItem = {
  file: File
  status: FileStatus
}

@(createForm as any)()
@observer
class LightboxForm extends React.Component<LightboxFormInnerProps> {
  constructor(props: LightboxFormInnerProps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, props.toasterStore)
    this.handleUpload = this.handleUpload.bind(this)
    this.handleFileChange = this.handleFileChange.bind(this)
    this.setUploadStatus = this.setUploadStatus.bind(this)
  }

  @observable fieldData: FieldItem[] = []

  loadings = new Loadings('upload')
  @computed get isUploading() {
    return this.loadings.isLoading('upload')
  }

  @action handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.fieldData = []
    const files = e.target.files
    if (files == null) {
      return
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const canAccept = this.handleBeforeUpload(file)
      if (canAccept) {
        this.fieldData.push({ file, status: 'pending' })
      } else {
        Modal.error({
          content: `${file.name}文件大小或类型错误，请重新选择！`
        })
      }
    }
  }

  @action handleBeforeUpload(file: File) {
    const isLt5M = file.size / 1024 / 1024 < 5.0001
    const isFileType = ['application/pdf', 'application/zip', 'image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/pdf']
      .indexOf(file.type) !== -1
    return isLt5M && isFileType
  }

  @action setUploadStatus(index: number, status: FileStatus) {
    this.fieldData[index].status = status
  }

  @ToasterStore.handle()
  @action handleUpload() {
    const result = new Promise<void>(resolve => {
      let failNum = 0
      this.fieldData.forEach((info, index) => {
        const data = new FormData()
        data.append('order_id', this.props.orderid)
        data.append('file_data', info.file)
        new Promise<void>((innerResolve, reject) => {
          this.props.sslApis.uploadConfirmLetter(data).then(() => {
            this.setUploadStatus(index, 'done')
            if (index === this.fieldData.length - 1 && failNum === 0) {
              innerResolve()
            }
          }).catch(error => {
            this.setUploadStatus(index, 'failed')
            failNum++
            reject({
              filename: info.file.name,
              error
            })
          })
        }).then(() => {
          Modal.success({
            title: '上传成功！',
            content: '证书申请进入人工审核阶段，预计需要3～5个工作日，请联系人保持联系方式(手机、邮箱)畅通以方便后续信息审核工作。'
          })
          resolve()
        }).catch(errorData => {
          Modal.error({
            content: `${errorData.filename}上传失败：${errorData.error.message}`
          })
          resolve()
        })
      })
    })
    return this.loadings.promise('upload', result)
  }

  render() {
    const fileProps = {
      multiple: true,
      accept: 'image/*, application/pdf, application/zip'
    }
    return (
      <Form layout="horizontal">
        <FormItem
          className="ssl-upload"
        >
          <Button type="ghost" className="upload-btn" icon="plus">
            选择文件
            <Input
              className="upload-input"
              type="file"
              name="file_data"
              id="file_data"
              onChange={files => this.handleFileChange(files)}
              {...fileProps}
            />
          </Button>
          <div className="file-name">
            {
            this.fieldData && this.fieldData.length > 0
            ? this.fieldData.map((info, index) => <div key={info.file.name}>
              {`${index + 1}. ${info.file.name}`}
              {
                        info.status !== 'pending'
                        ? <Icon type={info.status === 'done' ? 'check' : 'close'} className={info.status} />
                        : null
              }
            </div>)
            : null
            }
          </div>
          <p className="upload-notice">不支持多文件上传，如果有多个文件，请压缩成一个文件后再上传。</p>
          <hr className="split-line sub-split-line" />
          <p className="help">
            1. 上传文件类型可以是zip、jpg、jpeg、png、gif、tiff、pdf，单个文件大小不得大于5MB。<br />
            2. 请正确填写公司信息确认函并加盖两处公章(骑缝章＋末尾盖章)，再将扫描件上传提交进行人工审核。<br />
            3. 上传后请联系人保持联系方式(手机、邮箱)畅通以方便后续信息审核工作。<br />
          </p>
        </FormItem>
        <hr className="split-line sub-split-line" />
        <div className="footer-right">
          <Button
            key="submit"
            type="primary"
            onClick={this.handleUpload}
            disabled={!(!this.isUploading && this.fieldData && this.fieldData.length > 0)}
          >
            确定上传
          </Button>
          <Button key="back" type="ghost" onClick={this.props.onCancel}>取消</Button>
        </div>
      </Form>
    )
  }
}

export default observer(function _LightboxForm(props: LightboxFormProps) {
  const sslApis = useInjection(SslApis)
  const toasterStore = useInjection(ToasterStore)
  return <LightboxForm {...props} sslApis={sslApis} toasterStore={toasterStore} />
})
