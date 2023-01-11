/**
 * @desc Stream push task edit drawer
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { Component } from 'react'
import autobind from 'autobind-decorator'
import { action, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Drawer } from 'react-icecream'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { BucketListStore } from 'kodo/stores/bucket/list'

import SMSGSettingModal from 'kodo/components/BucketDetails/Setting/SMSG/SMSGSettingModal'

import { SMSGApis } from 'kodo/apis/bucket/setting/smsg'
import { StreamPushTask, StreamPushTaskBaseInfo } from 'kodo/apis/stream-push'

import { TaskEditForm, createTaskEditFormState, TaskEditFormState } from './TaskEditForm'
import TaskListStore from './store'
import styles from '../style.m.less'

interface CreateTaskDrawerProps {
  store: TaskListStore
  visible: boolean
  taskInfo?: StreamPushTask

  onVisibleChange(visible: boolean): void
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalTaskEditDrawer extends Component<CreateTaskDrawerProps & DiDeps> {
  constructor(props: CreateTaskDrawerProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  bucketListStore = this.props.inject(BucketListStore)
  smsgApis = this.props.inject(SMSGApis)

  disposable = new Disposable()

  @observable smsgSettingModalVisible = false

  @observable smsgSwitchState = false

  @observable formState: TaskEditFormState

  @action.bound
  updateSMSGSwitchState(checked: boolean) {
    this.smsgSwitchState = checked
  }

  @action.bound
  handleSMSGSettingModalVisibleChange(visible: boolean) {
    this.smsgSettingModalVisible = visible
  }

  @action.bound
  initFormState(taskInfo?: StreamPushTask) {
    this.formState = createTaskEditFormState(taskInfo)
    this.disposable.addDisposer(this.formState.dispose)
  }

  @autobind
  @Toaster.handle()
  fetchBucketList() {
    return this.bucketListStore.fetchList()
  }

  @autobind
  createTaskFromFormState() {
    const { name, sourceUrl, bucket, startTimeState, stopTimeState, triggerNow } = this.formState.$

    const payload: StreamPushTaskBaseInfo = {
      name: name.value,
      sourceUrls: [{ url: sourceUrl.value }],
      runType: 'normal',
      stream: name.value,
      bucket: bucket.value,
      triggerNow: triggerNow.value,
      deliverStartTime: startTimeState.$.isEnable.value ? startTimeState.$.time.value.valueOf() : 0,
      deliverStopTime: stopTimeState.$.isEnable.value ? stopTimeState.$.time.value.valueOf() : 0
    }

    return this.props.store.createTask(payload)
  }

  @autobind
  async handleSubmit() {
    const { hasError } = await this.formState.validate()

    if (hasError) return Promise.reject(this.formState.error)

    const { bucket } = this.formState.$

    const isBucketSMSGEnabled = await this.smsgApis.getBucketSMSG(bucket.value)

    if (isBucketSMSGEnabled) {
      /* 当空间的流媒体网关开关为开启状态 流媒体网关设置模态窗口应为关闭状态 */
      this.handleSMSGSettingModalVisibleChange(false)

      /* 当空间的流媒体网关开关为开启状态 才可以创建推流到该空间到推流任务 */
      await this.createTaskFromFormState()

      /* 任务创建完成 关闭创建推流任务的抽屉 */
      this.props.onVisibleChange(false)
    } else {
      /* 当空间的流媒体网关开关为关闭状态 将流媒体网关设置模态窗口中对应的开关的状态设置为关闭 */
      this.updateSMSGSwitchState(false)

      /* 当空间的流媒体网关开关为关闭状态 展示流媒体网关设置模态窗口让用户手动开启对应空间的流媒体网关功能 */
      this.handleSMSGSettingModalVisibleChange(true)
    }
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.visible,
      visible => {
        if (visible) {
          this.initFormState()
          this.fetchBucketList()
        }
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    return (
      <Drawer
        width={640}
        title="新建任务"
        visible={this.props.visible}
        onClose={() => this.props.onVisibleChange(false)}
        onOk={this.handleSubmit}
        okButtonProps={{ loading: this.props.store.isLoadingCreateTask }}
      >
        <TaskEditForm formState={this.formState} onSubmit={this.handleSubmit} />
        <SMSGSettingModal
          bucket={this.formState && this.formState.$.bucket.value}
          onSMSGSwitchChange={this.updateSMSGSwitchState}
          visible={this.smsgSettingModalVisible}
          onOk={this.handleSubmit}
          onCancel={() => this.handleSMSGSettingModalVisibleChange(false)}
          okButtonProps={{ loading: this.props.store.isLoadingCreateTask, disabled: !this.smsgSwitchState }}
        />
        <div className={styles.prompt}>
          推流策略：转推中断 3 秒后重连，连续转推中断 5 次后状态变为&quot;失败&quot;。
        </div>
      </Drawer>
    )
  }
}

export default function TaskEditDrawer(props: CreateTaskDrawerProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalTaskEditDrawer {...props} inject={inject} />
    )} />
  )
}
