/*
 * @file component SSLConfirmation
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import React from 'react'
import { observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import { useInjection } from 'qn-fe-core/di'
import Button from 'react-icecream/lib/button'
import Modal from 'react-icecream/lib/modal'
import Icon from 'react-icecream/lib/icon'

import { RouterStore } from 'portal-base/common/router'

import PageWithBreadcrumb from '../Layout/PageWithBreadcrumb'
import UploadLightboxForm, { IUploadFormProps } from './UploadLightboxForm'
import { basename } from '../../constants/app'

import './style.less'

export interface IConfimationProps {
  id: string
}

type ConfimationInnerProps = IConfimationProps & {
  routerStore: RouterStore
}

@observer
export class SSLConfirmation extends React.Component<ConfimationInnerProps> {
  constructor(props: ConfimationInnerProps) {
    super(props)
    makeObservable(this)
    this.handleFinish = this.handleFinish.bind(this)
    this.handleDownload = this.handleDownload.bind(this)
    this.toggleUploadLightbox = this.toggleUploadLightbox.bind(this)
  }

  @observable uploadLightbox = {
    visible: false
  }

  @action handleDownload() {
    const node = document.createElement('iframe')
    node.src = `/api/certificate/v1/download_confirm_letter_template/${this.props.id}`
    node.style.display = 'none'
    document.body.appendChild(node)
  }

  @action toggleUploadLightbox() {
    this.uploadLightbox.visible = !this.uploadLightbox.visible
  }

  @action handleFinish() {
    this.props.routerStore.push(`${basename}/ssl`)
  }

  render() {
    const uploadFormProps: IUploadFormProps = {
      orderid: this.props.id,
      onCancel: this.toggleUploadLightbox
    }
    return (
      <PageWithBreadcrumb>
        <div className="comp-cert-confirm">
          <div className="confirm-content-wrapper">
            <div className="clearfix">
              <div className="ant-col-7 step-block">
                <div className="step-index">1</div>
                <div className="step-name">下载确认函</div>
                <div className="step-desc">
                  <div className="step-desc-text">若您还没有公司信息确认函模板，请先点击下载。</div>
                  <Button type="link" onClick={this.handleDownload}>下载确认函</Button>
                </div>
              </div>
              <div className="ant-col-7 ant-col-offset-1 step-block">
                <div className="step-index">2</div>
                <div className="step-name">填写并盖章</div>
                <div className="step-desc">
                  <div className="step-desc-text">下载完成后，请正确填写公司信息确认函并加盖两处公章（骑缝章＋末尾盖章），再将扫描件在⎡SSL证书服务－我的订单－上传确认函⎦上传提交审核。</div>
                </div>
              </div>
              <div className="ant-col-7 ant-col-offset-1 step-block">
                <div className="step-index">3</div>
                <div className="step-name">上传确认函</div>
                <div className="step-desc">
                  <div className="step-desc-text">点击上传扫描件，上传完成后请联系人（授权代表）保持联系方式畅通以方便后续信息审核工作。</div>
                  <Button type="link" onClick={this.toggleUploadLightbox}>上传确认函</Button>
                </div>
              </div>
            </div>
            <hr className="split-line" />
            <div className="footer-submit">
              <Button size="large" type="primary" onClick={this.handleFinish}>完成</Button>
            </div>
          </div>
          <Modal
            title={<><Icon type="info-circle" style={{ color: 'orange', paddingRight: '10px' }} /><span>上传确认函</span></>}
            visible={this.uploadLightbox.visible}
            onCancel={this.toggleUploadLightbox}
            footer={null}
            width="40%"
          >
            <div className="lightbox-form-wrap confirmation-lightbox">
              <UploadLightboxForm {...uploadFormProps} />
            </div>
          </Modal>
        </div>
      </PageWithBreadcrumb>
    )
  }
}

export default observer(function _SSLConfirmation(props: IConfimationProps) {
  const routerStore = useInjection(RouterStore)
  return <SSLConfirmation {...props} routerStore={routerStore} />
})
