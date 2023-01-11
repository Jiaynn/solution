/**
 * @file Component TranscodeDrawer
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observable, computed, action, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Drawer, Icon, Tooltip } from 'react-icecream/lib'
import autobind from 'autobind-decorator'
import Role from 'portal-base/common/components/Role'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import Disposable from 'qn-fe-core/disposable'
import { Inject, InjectFunc } from 'qn-fe-core/di'

import { getTranscodeCommand } from 'kodo/transforms/transcode-style'

import cardStyles from 'kodo/styles/card.m.less'

import { BucketStore } from 'kodo/stores/bucket'

import { custom } from 'kodo/constants/transcode-style'
import { BucketTranscodeStyleRole } from 'kodo/constants/role'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import { TranscodeStyleApis, IPrivatePipeline } from 'kodo/apis/transcode-style'

import Form, { createFormState, TranscodeForm } from './Form'
import { ITranscodeValue } from '..'

interface IProps {
  bucketName: string
  visible: boolean
  title: string
  onClose(): void
  onSubmit(): void
  nameList: string[]
  isEditing?: boolean
  data?: ITranscodeValue
}

interface DiDeps {
  inject: InjectFunc
}

const loadingId = 'transcode'

@observer
class InternalTranscodeDrawer extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  bucketStore = this.props.inject(BucketStore)
  transcodeStyleApis = this.props.inject(TranscodeStyleApis)

  @observable.ref form: TranscodeForm
  @observable.ref privatePipelines: IPrivatePipeline[] = []

  disposable = new Disposable()

  loadings = Loadings.collectFrom(this, loadingId)

  @autobind
  async handleSubmit() {
    const result = await this.form.validate()
    if (result.hasError) {
      return
    }

    this.doSubmit().then(this.props.onClose)
  }

  @Toaster.handle('保存成功')
  @Loadings.handle(loadingId)
  doSubmit() {
    const formValue = this.form.value
    const req = this.transcodeStyleApis.setTranscodeStyle(this.props.bucketName, formValue.name, {
      ...this.form.value,
      command: formValue.command.normalCommand === custom
        ? getTranscodeCommand(formValue.command.customCommand, formValue.bucket, formValue.targetName)
        : getTranscodeCommand(formValue.command.normalCommand, formValue.bucket, formValue.targetName),
      callback_url: formValue.callbackUrl
    })

    req.then(this.props.onSubmit).catch(() => { /**/ })
    return req
  }

  @computed
  get transcodeNameList() {
    const bucketInfo = this.bucketStore.getDetailsByName(this.props.bucketName)
    return bucketInfo && bucketInfo.transcode_styles ? Object.keys(bucketInfo.transcode_styles) : []
  }

  @action.bound
  createFormState() {
    this.form = createFormState(
      this.props.data,
      this.transcodeNameList,
      this.privatePipelines,
      !!this.props.isEditing
    )
    this.disposable.addDisposer(this.form.dispose)
  }

  @action.bound
  updatePrivatePipeline(data: IPrivatePipeline[]) {
    this.privatePipelines = data
  }

  @Toaster.handle()
  fetchPrivatePipeline() {
    const req = this.transcodeStyleApis.getPrivatePipeline()
    req.then(this.updatePrivatePipeline).catch(() => { /**/ })
    return req
  }

  async initFormState() {
    await this.fetchPrivatePipeline()
    this.createFormState()
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.visible,
      visible => {
        if (visible) {
          this.initFormState()
        }
      }
    ))
  }

  render() {
    const { isEditing, visible, onClose, title, bucketName } = this.props
    return (
      <Drawer
        visible={visible}
        onClose={onClose}
        width={620}
        title={
          <span>
            {title}
            <Tooltip title="文档">
              <HelpDocLink className={cardStyles.extraButton} doc="transcodeStyle">
                <Icon type="file-text" />
              </HelpDocLink>
            </Tooltip>
          </span>
        }
        onOk={this.handleSubmit}
        confirmLoading={this.loadings.isLoading(loadingId)}
      >
        <Role name={BucketTranscodeStyleRole.EditBlock}>
          <Form
            formState={this.form}
            isEditing={!!isEditing}
            handleSubmit={this.handleSubmit}
            privatePipelines={this.privatePipelines}
            bucketName={bucketName}
          />
        </Role>
      </Drawer>
    )
  }
}

export default function TranscodeDrawer(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalTranscodeDrawer {...props} inject={inject} />
    )} />
  )
}
