/**
 * @desc component for 添加视频瘦身任务 Modal
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import { bindInput } from 'formstate-x'

import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import Radio from 'react-icecream/lib/radio'
import Table from 'react-icecream/lib/table'
import { useInjection } from 'qn-fe-core/di'
import { Link } from 'portal-base/common/router'
import { ToasterStore } from 'portal-base/common/toaster'
import { useLocalStore } from 'portal-base/common/utils/store'
import { bindRadioGroup, bindTextArea } from 'portal-base/common/form'

import { humanizeTraffic } from 'cdn/transforms/unit'

import { IModalProps } from 'cdn/stores/modal'

import { SERVICE_NAME } from 'cdn/constants/video-slim'

import SideModal from 'cdn/components/common/SideModal'

import { IVideoFile } from 'cdn/apis/video-slim'

import AutoEnableSwitch from '../../Inputs/AutoEnableSwitch'

import { AddFileMode, transformValueForSubmit, LocalStore } from './store'

import './style.less'

const { Column } = Table

export interface IProps extends IModalProps {
  domain?: string
  domainBucketName?: string
}

interface PropsWithDeps extends IProps {
  store: LocalStore
  toasterStore: ToasterStore
}

@observer
export class CreateModalInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @computed get store() {
    return this.props.store
  }

  @computed get addFileModeView() {
    const field = this.store.form.$.addFileMode
    const tip = (
      field.$ === AddFileMode.Hotest
      ? '热点视频：过去两天访问流量在域名 TOP 100 以内的视频资源'
      : null
    )

    return (
      <Form.Item extra={tip}>
        <Radio.Group {...bindRadioGroup(field)}>
          <Radio.Button value={AddFileMode.Hotest}>添加热点视频</Radio.Button>
          <Radio.Button value={AddFileMode.Specific}>添加指定文件</Radio.Button>
        </Radio.Group>
      </Form.Item>
    )
  }

  @computed get hotestFilesView() {
    const rowSelection = {
      selectedRowKeys: this.store.value.hotestURLs,
      onChange: this.store.form.$.hotestURLs.onChange,
      getCheckboxProps: (record: IVideoFile) => ({ disabled: record.slimed })
    }

    return (
      <div className="hotest-files-wrapper">
        <h3>热点视频文件列表 ({this.store.topFiles.length})</h3>
        <Table
          size="middle"
          dataSource={this.store.topFiles}
          rowSelection={rowSelection}
          pagination={false}
          rowKey="url"
          loading={this.store.isFetchingTopFiles}
        >
          <Column title="URL" dataIndex="url" />
          <Column title="近 2 日流量" dataIndex="value" width="200px" render={humanizeTraffic} />
          <Column title="瘦身" dataIndex="slimed" width="80px" render={humanizeSlimed} />
        </Table>
      </div>
    )
  }

  @computed get specificFilesView() {
    const tip = '指定 URL 为 H.264 编码的视频，将会瘦身并统一输出为 MP4 格式，一行一个 URL。'
    return (
      <Form.Item className="specific-files-wrapper" extra={tip}>
        <Input.TextArea
          className="files-textarea"
          placeholder="http://example.com/path/example.mp4&#10;https://example.com/example.mp4"
          {...bindTextArea(this.store.form.$.specificURLs)}
        />
      </Form.Item>
    )
  }

  @computed get filesInputView() {
    return (
      this.store.form.$.addFileMode.value === AddFileMode.Hotest
      ? this.hotestFilesView
      : this.specificFilesView
    )
  }

  @computed get autoEnableView() {
    const field = this.store.form.$.cdnAutoEnable
    return (
      <AutoEnableSwitch {...bindInput(field)} />
    )
  }

  @computed get formView() {
    return (
      <Form className="create-task-form">
        {this.addFileModeView}
        <p className="form-item-tip">
          开启视频瘦身，将授予服务（{SERVICE_NAME}）以域名所在空间的只读权限。如需进行授权管理，请至
          <Link target="_blank" rel="noopener" to={`/bucket/${this.props.domainBucketName}/share`}>对象存储 - 空间授权</Link>。<br />
          视频文件将去除 URL「?」后的全部参数进行识别、执行瘦身；瘦身后的文件将统一输出为 MP4 格式。
        </p>
        {this.filesInputView}
        {this.autoEnableView}
      </Form>
    )
  }

  @autobind
  @ToasterStore.handle()
  handleSubmit() {
    return this.store.form.validate().then(
      result => result.hasError && Promise.reject(this.store.form.error)
    ).then(
      () => this.store.doSubmit(transformValueForSubmit(this.props.domain!, this.store.value))
    ).then(
      () => {
        this.store.resetForm()
        this.props.onSubmit()
      }
    )
  }

  render() {
    return (
      <SideModal
        title="添加瘦身文件"
        okBtnText="添加"
        okBtnDisabled={!this.store.loadings.isAllFinished()}
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.handleSubmit}
      >
        {this.formView}
      </SideModal>
    )
  }
}

export default observer(function CreateModal(props: IProps) {
  const toasterStore = useInjection(ToasterStore)
  const store = useLocalStore(LocalStore, props)

  return (
    <CreateModalInner
      toasterStore={toasterStore}
      store={store}
      {...props}
    />
  )
})

function humanizeSlimed(slimed: boolean): string {
  return slimed ? '已启动' : '未启动'
}
