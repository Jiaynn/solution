/**
 * @file Bucket log setting component
 * @description bucket 日志设置
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { computed, action, observable, makeObservable } from 'mobx'
import { FormState, FieldState, ValidationResponse } from 'formstate'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Switch, Form, Select, Input, Spin } from 'react-icecream/lib'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { valuesOf } from 'kodo/utils/ts'
import { bindSwitchField, ValidateStatus, bindPureValueField } from 'kodo/utils/formstate'

import { isWritable, isShared } from 'kodo/transforms/bucket/setting/authorization'

import { BucketListStore } from 'kodo/stores/bucket/list'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { LogApis, IBucketLogStatus } from 'kodo/apis/bucket/setting/log'

import SettingCardFooter from '../Card/Operators'

import styles from './style.m.less'

interface ISaveBucketFieldStatus {
  help: ValidationResponse
  validateStatus: ValidateStatus
}

enum Loading {
  SetDisable = 'setDisable',
  FetchSettings = 'fetchSettings',
  UploadSettings = 'uploadSettings'
}

const formItemProps = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 }
}

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalBucketLog extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  logApis = this.props.inject(LogApis)
  bucketListStore = this.props.inject(BucketListStore)

  @observable.ref formState = this.createFormState()
  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @action.bound
  updateFormState(data: IBucketLogStatus) {
    const { issave: enable, savebucket: saveBucket } = data
    this.formState = this.createFormState({ enable, saveBucket })
  }

  @computed
  get isLoading(): boolean {
    return !this.loadings.isAllFinished()
  }

  @computed
  get usableBucketNameList(): string[] {
    // 只有自有空间或者
    return this.bucketListStore.list.filter(bucket => isWritable(bucket.perm))
      .map(bucket => bucket.tbl)
  }

  createSaveBucketFieldStatus(
    status: ValidateStatus = undefined,
    help?: string
  ): ISaveBucketFieldStatus {
    return {
      help,
      validateStatus: status
    }
  }

  @computed
  get saveBucketFieldStatus(): ISaveBucketFieldStatus {
    const { saveBucket, enable } = this.formState.$

    // 关闭时不校验
    if (!enable.value) {
      return this.createSaveBucketFieldStatus()
    }

    if (!saveBucket.value) {
      return this.createSaveBucketFieldStatus('error', '必须指定一个存储空间')
    }

    // 如果值没有变更，不应该显示 warning
    // 防止刚进来页面 就提示 warning
    if (!saveBucket.dirty) {
      return this.createSaveBucketFieldStatus()
    }

    const bucketInfo = this.bucketListStore.getByName(saveBucket.value)

    if (bucketInfo && isShared(bucketInfo.perm)) {
      return this.createSaveBucketFieldStatus('warning', '此为分享空间，日志可能被他人访问，仍使用该空间吗？')
    }

    if (bucketInfo && !bucketInfo.private) {
      return this.createSaveBucketFieldStatus('warning', '此为公开空间，日志可能被他人访问，仍使用该空间吗？')
    }

    return this.createSaveBucketFieldStatus('success')
  }

  @autobind
  createFormState(state?: { enable?: boolean, saveBucket?: string }) {
    const data = {
      enable: false,
      saveBucket: null,
      ...state
    }

    const enable = new FieldState<boolean>(data.enable)

    return new FormState({
      enable,
      saveBucket: new FieldState<string>(data.saveBucket!).validators(
        () => this.saveBucketFieldStatus.validateStatus === 'error' && this.saveBucketFieldStatus.help
      )
    })
  }

  @Toaster.handle()
  fetchBucketList() {
    return this.bucketListStore.fetchList()
  }

  @autobind
  @Loadings.handle(Loading.FetchSettings)
  fetchSettings() {
    const { bucketName } = this.props
    const req = this.logApis.getLog(bucketName)
    req.then(this.updateFormState).catch(() => { /**/ })
    return req
  }

  @autobind
  @Toaster.handle('设置成功')
  @Loadings.handle(Loading.UploadSettings)
  uploadSettings(saveBucket: string) {
    const { bucketName } = this.props
    const req = this.logApis.setLog(bucketName, saveBucket)
    req.then(this.fetchSettings).catch(() => { /**/ })
    return req
  }

  @autobind
  @Toaster.handle('关闭成功')
  @Loadings.handle(Loading.SetDisable)
  setDisable() {
    const { bucketName } = this.props
    const req = this.logApis.setDisable(bucketName)
    req.then(this.fetchSettings).catch(() => { /**/ })
    return req
  }

  @autobind
  async handleSubmit() {
    const status = await this.formState.validate()

    if (status.hasError) {
      return
    }

    const { enable, saveBucket } = this.formState.$

    // 关闭日志
    if (!enable.value) {
      this.setDisable()
      return
    }

    this.uploadSettings(saveBucket.$)
  }

  render() {
    const { enable, saveBucket } = this.formState.$

    return (
      <Spin spinning={this.isLoading}>
        <Form
          className={styles.form}
        >
          <Form.Item
            label="启用状态"
            {...formItemProps}
          >
            <Switch
              checkedChildren="开启"
              unCheckedChildren="关闭"
              {...bindSwitchField(enable)}
            />
          </Form.Item>
          <Form.Item
            label="保存到空间"
            {...formItemProps}
            {...this.saveBucketFieldStatus}
          >
            <Select
              showSearch
              optionFilterProp="value"
              disabled={!enable.value}
              {...bindPureValueField(saveBucket)}
            >
              {
                this.usableBucketNameList.map(
                  bucket => (<Select.Option key={bucket} value={bucket}>{bucket}</Select.Option>)
                )
              }
            </Select>
          </Form.Item>
          <Form.Item
            label="日志的名称"
            {...formItemProps}
          >
            <Input readOnly value="_log/bucketname/YYYY-MM-DD-HH-mm/partN.gz" />
          </Form.Item>
          <Form.Item
            label="日志的格式"
            {...formItemProps}
          >
            <Input readOnly value="gzip" />
          </Form.Item>
          <SettingCardFooter
            onSubmit={this.handleSubmit}
            submitBtnSensorsHook="空间日志"
          />
        </Form>
      </Spin>
    )
  }

  componentDidMount() {
    this.fetchSettings()
    this.fetchBucketList()
  }
}

export default function BucketLog(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalBucketLog {...props} inject={inject} />
    )} />
  )
}
