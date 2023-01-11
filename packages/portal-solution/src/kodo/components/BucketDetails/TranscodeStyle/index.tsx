/**
 * @file Component TranscodeStyle
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, action, observable, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Alert, Link } from 'react-icecream-2'
import { Button, Table, Modal } from 'react-icecream/lib'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import Role from 'portal-base/common/components/Role'

import { keysOf } from 'kodo/utils/ts'

import { decodeTargetName } from 'kodo/transforms/transcode-style'

import { ConfigStore } from 'kodo/stores/config'
import { BucketStore, Loading } from 'kodo/stores/bucket'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { getCreateWorkflowPath } from 'kodo/routes/transcode-style'

import { BucketTranscodeStyleRole } from 'kodo/constants/role'
import { transcodeCommand, custom } from 'kodo/constants/transcode-style'

import { Auth } from 'kodo/components/common/Auth'

import { ITranscodeStyleInfo } from 'kodo/apis/bucket'
import { TranscodeStyleApis } from 'kodo/apis/transcode-style'

import TranscodeDrawer from './TranscodeDrawer'
import styles from './style.m.less'

export interface ITranscodeValue extends ITranscodeStyleInfo {
  name: string
  process: string
  targetName: string
}

export interface IProps extends IDetailsBaseOptions {
  isCreateDrawerOpen?: boolean
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalTranscodeStyle extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  userInfoStore = this.props.inject(UserInfo)
  bucketStore = this.props.inject(BucketStore)
  configStore = this.props.inject(ConfigStore)
  transcodeStyleApis = this.props.inject(TranscodeStyleApis)

  @observable isCreateVisible = false
  @observable.ref editData: ITranscodeValue | undefined
  @observable.ref cloneData: ITranscodeValue | undefined
  @observable.shallow transcodeStyles: ITranscodeValue[] = []

  @action.bound
  updateCreateTranscodeVisible(visible: boolean) {
    this.isCreateVisible = visible
  }

  @action.bound
  updateEditData(data?: ITranscodeValue) {
    this.editData = data
  }

  @action.bound
  updateCloneData(data?: ITranscodeValue) {
    this.cloneData = data
  }

  @autobind
  @Toaster.handle()
  fetchBucketInfo() {
    return this.bucketStore.fetchDetailsByName(this.props.bucketName)
  }

  @autobind
  refresh() {
    this.fetchBucketInfo()
  }

  @autobind
  @Toaster.handle()
  deleteTranscodeStyle(name: string) {
    const req = this.transcodeStyleApis.deleteTranscodeStyle(this.props.bucketName, name)
    req.then(this.refresh).catch(() => { /**/ })
    return req
  }

  @autobind
  handleTranscodeDelete(name: string) {
    Modal.confirm({
      title: '删除转码样式',
      content: `确定删除转码样式 ${name} 吗？`,
      onOk: () => this.deleteTranscodeStyle(name)
    })
  }

  componentDidMount() {
    this.refresh()
    if (!this.userInfoStore.isBufferedUser) {
      this.updateCreateTranscodeVisible(!!this.props.isCreateDrawerOpen)
    }
  }

  @computed
  get transcodeNameList() {
    return this.transcodeStyles.map(item => item.name)
  }

  @computed
  get commandMap() {
    return Object.assign({}, ...keysOf(transcodeCommand).map(key => ({
      [transcodeCommand[key]]: key
    })))
  }

  @computed
  get transcodeList() {
    const bucketInfo = this.bucketStore.getDetailsByName(this.props.bucketName)
    if (!bucketInfo || !bucketInfo.transcode_styles) {
      return []
    }

    const data = bucketInfo.transcode_styles
    const commandMap = this.commandMap

    return Object.keys(data).map(key => {
      const process = data[key].command.split('|saveas/')[0]
      return {
        bucket: data[key].bucket,
        targetName: decodeTargetName(data[key]),
        command: commandMap[process] || custom,
        callback_url: data[key].callback_url,
        pipeline: data[key].pipeline,
        name: key,
        process
      }
    })
  }

  @computed
  get isLoading() {
    return this.bucketStore.isLoading(Loading.Details)
  }

  @autobind
  renderAction(data: ITranscodeValue) {
    return (
      <>
        <Auth notProtectedUser>
          <Role name={BucketTranscodeStyleRole.ListItemCopyEntry}>
            <Button onClick={() => this.updateCloneData(data)} type="link">复制</Button>
          </Role>
          <Role name={BucketTranscodeStyleRole.ListItemEditEntry}>
            <Button onClick={() => this.updateEditData(data)} type="link">编辑</Button>
          </Role>
        </Auth>
        <Role name={BucketTranscodeStyleRole.ListItemDeleteEntry}>
          <Button type="link" onClick={() => this.handleTranscodeDelete(data.name)}>删除</Button>
        </Role>
      </>
    )
  }

  @computed
  get createTranscodeDrawerView() {
    return (
      <TranscodeDrawer
        title="新建转码样式"
        bucketName={this.props.bucketName}
        visible={this.isCreateVisible}
        nameList={this.transcodeNameList}
        onSubmit={this.refresh}
        onClose={() => this.updateCreateTranscodeVisible(false)}
      />
    )
  }

  @computed
  get cloneTranscodeDrawerView() {
    const isCloneTranscodeDrawerVisible = !!this.cloneData
    return (
      <TranscodeDrawer
        title="复制转码样式"
        bucketName={this.props.bucketName}
        visible={isCloneTranscodeDrawerVisible}
        data={this.cloneData}
        onSubmit={this.refresh}
        onClose={() => this.updateCloneData()}
        nameList={this.transcodeNameList}
      />
    )
  }

  @computed
  get editTranscodeDrawerView() {
    const isEditTranscodeDrawerVisible = !!this.editData
    return (
      <TranscodeDrawer
        title="编辑转码样式"
        bucketName={this.props.bucketName}
        visible={isEditTranscodeDrawerVisible}
        data={this.editData}
        onSubmit={this.refresh}
        onClose={() => this.updateEditData()}
        nameList={this.transcodeNameList}
        isEditing
      />
    )
  }

  @computed
  get descriptionView() {
    const bucketInfo = this.bucketStore.getDetailsByName(this.props.bucketName)
    if (!bucketInfo) return null

    const url = getCreateWorkflowPath(bucketInfo.region, this.props.bucketName)
    const href = (<strong><Link target="_blank" href={url}>转码任务触发器</Link></strong>)
    const message = (<span>转码样式仅适用于控制台上传文件。您可以为空间配置{href}，在上传的文件满足规则策略时自动触发处理。</span>)
    return (<Alert closable type="info" className={styles.description} message={message} />)
  }

  render() {
    return (
      <div>
        {this.descriptionView}
        <div className={styles.head}>
          <Auth
            notProtectedUser
            render={disabled => (
              <Role name={BucketTranscodeStyleRole.CreateEntry}>
                <Button
                  type="primary"
                  icon="plus"
                  disabled={disabled}
                  onClick={() => this.updateCreateTranscodeVisible(true)}
                  loading={this.bucketStore.isLoading(Loading.Details)}
                >
                  新建转码样式
                </Button>
              </Role>
            )}
          />
          <Role name={BucketTranscodeStyleRole.RefreshListEntry}>
            <Button icon="reload" onClick={this.refresh}>刷新列表</Button>
          </Role>
        </div>
        <div>
          {this.createTranscodeDrawerView}
          {this.editTranscodeDrawerView}
          {this.cloneTranscodeDrawerView}
        </div>
        <Role name={BucketTranscodeStyleRole.TranscodeStyleList}>
          <Table dataSource={this.transcodeList.slice()} rowKey="name" pagination={false}>
            <Table.Column title="名称" key="name" dataIndex="name" />
            <Table.Column title="处理接口" key="process" dataIndex="process" className={styles.tdWrap} width="30%" />
            <Table.Column title="转码命令" key="command" dataIndex="command" />
            <Table.Column title="目标空间" key="bucket" dataIndex="bucket" />
            <Table.Column title="目标文件名" key="targetName" dataIndex="targetName" />
            <Table.Column title="操作" key="action" render={this.renderAction} />
          </Table>
        </Role>
      </div>
    )
  }
}

export default function TranscodeStyle(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalTranscodeStyle {...props} inject={inject} />
    )} />
  )
}
