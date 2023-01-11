/**
 * @desc 空间 流媒体网关（Stream Media Storage Gateway，SMSG） 推流地址查询 Modal
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { ChangeEvent, Component } from 'react'
import { Button, Form, Input, Modal, Typography } from 'react-icecream'
import { action, observable, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { valuesOf } from 'kodo/utils/ts'

import { SMSGApis } from 'kodo/apis/bucket/setting/smsg'

import styles from './style.m.less'

enum Loading {
  GetStreamPushUrl = 'GetStreamPushUrl'
}

interface StreamPushAddrQueryModalProps {
  bucketName: string
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalStreamPushAddrQueryModal extends Component<StreamPushAddrQueryModalProps & DiDeps> {
  constructor(props: StreamPushAddrQueryModalProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  SMSGApis = this.props.inject(SMSGApis)
  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @observable visible = false
  @observable streamName = ''
  @observable streamPushUrl = ''

  @action.bound
  updateStreamPushUrl(url: string) {
    this.streamPushUrl = url
  }

  @action.bound
  handleVisibleChange(visible: boolean) {
    this.visible = visible
  }

  @action.bound
  handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    this.streamName = e.target.value
  }

  @Toaster.handle('查询成功')
  @Loadings.handle(Loading.GetStreamPushUrl)
  getStreamPushUrl(stream: string) {
    return this.SMSGApis.getBucketSMSGStreamPushAddr(this.props.bucketName, stream)
  }

  @autobind
  async handleSearch() {
    const data = await this.getStreamPushUrl(this.streamName)
    this.updateStreamPushUrl(data && data.url ? data.url : '')
  }

  render() {
    return (
      <>
        <Button className={styles.queryBtn} onClick={_ => this.handleVisibleChange(true)}>
          查询推流地址
        </Button>
        <Modal
          destroyOnClose
          visible={this.visible}
          title="查询推流地址"
          onCancel={_ => this.handleVisibleChange(false)}
          onOk={this.handleSearch}
          okText="查询"
          okButtonProps={{ disabled: this.loadings.isLoading(Loading.GetStreamPushUrl) }}
        >
          <div className={styles.modalContent}>
            <Form.Item label="流名" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Input placeholder="请输入流名" value={this.streamName} onChange={this.handleInputChange} />
            </Form.Item>
            <Form.Item label="推流地址" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Typography.Paragraph copyable={Boolean(this.streamPushUrl)} style={{ margin: 0 }}>
                {this.streamPushUrl}
              </Typography.Paragraph>
            </Form.Item>
          </div>
        </Modal>
      </>
    )
  }
}

export default function StreamPushAddrQueryModal(props: StreamPushAddrQueryModalProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalStreamPushAddrQueryModal {...props} inject={inject} />
    )} />
  )
}
