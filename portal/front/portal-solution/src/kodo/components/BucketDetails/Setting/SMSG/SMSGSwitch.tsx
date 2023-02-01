/**
 * @desc 空间 流媒体网关（Stream Media Storage Gateway，SMSG） 开关
 * @author hovenjay <hovenjay@outlook.com>
 */

import autobind from 'autobind-decorator'
import { action, observable, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Switch } from 'react-icecream'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import { valuesOf } from 'kodo/utils/ts'

import { SMSGApis } from 'kodo/apis/bucket/setting/smsg'

import { injectMainBtnClickHookProps } from '../Card/sensors'
import styles from './style.m.less'

enum Loading {
  GetBucketSMSG = 'GetBucketSMSG',
  SetBucketSMSG = 'SetBucketSMSG'
}

interface SMSGSwitchProps {
  bucketName: string
  renderWhenChecked?: React.ReactNode

  onChange?(val: boolean): void
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalSMSGSwitch extends Component<SMSGSwitchProps & DiDeps> {
  constructor(props: SMSGSwitchProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  SMSGApis = this.props.inject(SMSGApis)
  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @observable smsgSwitchState = false

  @action.bound
  updateSMSGSwitchState(state: boolean) {
    this.smsgSwitchState = state
  }

  async initState() {
    this.getSMSG().then(data => this.updateSMSGSwitchState(data)).catch(() => { /**/ })
  }

  @Toaster.handle()
  @Loadings.handle(Loading.GetBucketSMSG)
  getSMSG() {
    return this.SMSGApis.getBucketSMSG(this.props.bucketName)
  }

  @Toaster.handle('设置成功')
  @Loadings.handle(Loading.SetBucketSMSG)
  async setSMSG(isEnabled: boolean) {
    const state = await this.SMSGApis.setBucketSMSG(this.props.bucketName, isEnabled)
    this.updateSMSGSwitchState(state)
    return state
  }

  @autobind
  async handleSwitchChange(isEnabled: boolean) {
    const state = await this.setSMSG(isEnabled)

    if (this.props.onChange) {
      this.props.onChange(state)
    }
  }

  componentDidMount() {
    this.initState()
  }

  render() {
    return (
      <>
        <Switch
          className={styles.SMSGSwitch}
          checked={this.smsgSwitchState}
          onChange={this.handleSwitchChange}
          checkedChildren="开启"
          unCheckedChildren="关闭"
          disabled={this.loadings.isLoading(Loading.GetBucketSMSG) || this.loadings.isLoading(Loading.SetBucketSMSG)}
          {...injectMainBtnClickHookProps('流媒体网关')}
        />
        {this.smsgSwitchState && this.props.renderWhenChecked}
      </>
    )
  }
}

export default function SMSGSwitch(props: SMSGSwitchProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSMSGSwitch {...props} inject={inject} />
    )} />
  )
}
