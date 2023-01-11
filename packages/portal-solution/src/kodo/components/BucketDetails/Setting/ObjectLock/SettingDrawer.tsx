/**
 * @file Bucket Object Lock Setting SettingDrawer
 * @author hovenjay <hovenjay@outlook.com>
 */

import React, { Component } from 'react'
import { FieldState, FormState } from 'formstate'
import autobind from 'autobind-decorator'
import { action, computed, observable, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Drawer, Form, Switch, Spin, Select, Input, InputNumber, Tooltip, Icon } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import { valuesOf } from 'kodo/utils/ts'
import { ValidatableObject, bindFormItem } from 'kodo/utils/formstate'

import docStyles from 'kodo/styles/card.m.less'

import { KodoIamStore } from 'kodo/stores/iam'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import {
  objectLockEnabled,
  reservedModes,
  reservedModeNameMap,
  reservedTimeUnits,
  reservedTimeUnitNameMap,
  reservedTimeMaxValueMap
} from 'kodo/constants/bucket/setting/worm'

import HelpDocLink from 'kodo/components/common/HelpDocLink'
import FormTrigger from 'kodo/components/common/FormTrigger'
import Prompt from 'kodo/components/common/Prompt'

import { IWorm, WormApis } from 'kodo/apis/bucket/worm'

import styles from './style.m.less'

enum Loading {
  UpdateObjectLockSetting = 'UpdateObjectLockSetting'
}

export interface IFormFields {
  isEnabled: boolean
  reservedMode: string
  reservedTime: {
    val: number
    unit: string
  }
}

export interface IProps extends IDetailsBaseOptions {
  visible: boolean

  onClose(): void
}

interface DiDeps {
  inject: InjectFunc
}

export type IFormState = FormState<ValidatableObject<IFormFields>>

@observer
class InternalSettingDrawer extends Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  wormApis = this.props.inject(WormApis)
  iamStore = this.props.inject(KodoIamStore)

  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))
  disposable = new Disposable()

  @observable isEnabled = false
  @observable formState: IFormState

  @action.bound
  initFormState(worm: IWorm) {
    const enabled = Boolean(worm && worm.objectLockEnabled === objectLockEnabled)
    const hasRule = Boolean(worm && worm.rule)
    const reservedMode = hasRule && worm.rule!.mode || reservedModes.COMPLIANCE
    const reservedTimeVal = hasRule ? worm.rule!.days || worm.rule!.years : 1
    const reservedTimeUnit = hasRule && worm.rule!.years ? reservedTimeUnits.years : reservedTimeUnits.days

    const reservedTimeValidator = ({ val, unit }: IFormFields['reservedTime']) => {
      const unitName = unit === reservedTimeUnits.days
        ? reservedTimeUnitNameMap[reservedTimeUnits.days]
        : reservedTimeUnitNameMap[reservedTimeUnits.years]

      if (!Number.isFinite(val!)) {
        return '保留周期必须为数字'
      }

      if (val < 1) {
        return '保留周期不能小于 1 ' + unitName
      }

      if (Math.floor(val) !== val) {
        return '保留周期必须为整数'
      }

      if (unit === reservedTimeUnit) {
        if (reservedTimeVal! > val) {
          return '只能延长保留周期'
        }
      } else if (unit === reservedTimeUnits.days) {
        if (reservedTimeVal! * 365 > val) {
          return '只能延长保留周期'
        }
      } else if (unit === reservedTimeUnits.years) {
        if (reservedTimeVal! > val * 365) {
          return '只能延长保留周期'
        }
      }

      if (val > reservedTimeMaxValueMap[unit]) {
        return '最大保留周期不能超过 ' + reservedTimeMaxValueMap[unit] + ' ' + unitName
      }
    }

    this.formState = new FormState({
      isEnabled: new FieldState(enabled),
      reservedMode: new FieldState(reservedMode),
      reservedTime: new FieldState({
        val: reservedTimeVal!,
        unit: reservedTimeUnit
      }).validators(reservedTimeValidator)
    })
    this.isEnabled = enabled
  }

  @autobind
  @Toaster.handle('修改成功')
  @Loadings.handle(Loading.UpdateObjectLockSetting)
  updateWorm(bucketName: string, rule: IWorm) {
    return this.wormApis.setWorm(bucketName, rule)
  }

  @autobind
  async handleSubmit() {
    const { hasError } = await this.formState.validate()
    const { reservedMode, reservedTime } = this.formState.$

    if (hasError) {
      return
    }

    await this.updateWorm(
      this.props.bucketName,
      {
        objectLockEnabled,
        rule: {
          mode: reservedMode.value,
          [reservedTime.value.unit]: reservedTime.value.val
        }
      }
    )

    this.props.onClose()
  }

  @autobind
  handleReservedTimeBlur() {
    if (!this.formState.$.reservedTime.value.val) {
      this.formState.$.reservedTime.onChange({ ...this.formState.$.reservedTime.value, val: 1 })
    }
  }

  @computed
  get formView() {
    const { isEnabled, reservedMode, reservedTime } = this.formState.$

    const formItemProps = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 }
    }

    const Option = Select.Option

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormTrigger />
        <Form.Item
          label="当前状态"
          extra={
            isEnabled.value
              ? <Prompt type="warning">一旦开启，不可关闭，将永久允许锁定此存储空间中的对象。</Prompt>
              : null
          }
          {...formItemProps}
          {...bindFormItem(isEnabled)}
        >
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            checked={isEnabled.value}
            onChange={isEnabled.reset}
            disabled={this.isEnabled}
          />
        </Form.Item>
        {isEnabled.value && (
          <>
            <Form.Item
              label="保留模式"
              {...formItemProps}
              {...bindFormItem(isEnabled)}
            >
              <Select
                value={reservedMode.value}
                onChange={reservedMode.onChange}
                style={{ width: '160px' }}
                disabled
              >
                {Object.values(reservedModes).map(item => (
                  <Option key={item} value={item}>
                    {reservedModeNameMap[item]}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="保留周期"
              extra={
                reservedMode.value === reservedModes.COMPLIANCE
                  ? <Prompt type="warning">保留周期设置后，只可延长、不可缩短。</Prompt>
                  : null
              }
              {...formItemProps}
              {...bindFormItem(reservedTime)}
            >
              <Input.Group compact>
                <InputNumber
                  value={reservedTime.value.val}
                  onChange={val => reservedTime.onChange({ ...reservedTime.value, val: val! })}
                  onBlur={this.handleReservedTimeBlur}
                  style={{ width: '100px' }}
                />
                <Select
                  value={reservedTime.value.unit}
                  onChange={(val: string) => reservedTime.onChange({ ...reservedTime.value, unit: val })}
                  style={{ width: '60px' }}
                >
                  {Object.values(reservedTimeUnits).map(item => (
                    <Option key={item} value={item}>
                      {reservedTimeUnitNameMap[item]}
                    </Option>
                  ))}
                </Select>
              </Input.Group>
            </Form.Item>
          </>
        )}
      </Form>
    )
  }

  @autobind
  @Toaster.handle()
  async initForm() {
    const worm = await this.wormApis.getWorm(this.props.bucketName)
    this.initFormState(worm)
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.visible,
      visible => {
        if (visible) {
          this.initForm()
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
        title={
          <span>
            对象锁定
            <Tooltip title="文档">
              <HelpDocLink doc="wormSetting" className={docStyles.extraButton}>
                <Icon type="file-text" />
              </HelpDocLink>
            </Tooltip>
          </span>
        }
        visible={this.props.visible}
        onOk={this.handleSubmit}
        onClose={this.props.onClose}
        confirmLoading={this.loadings.isLoading(Loading.UpdateObjectLockSetting)}
        okButtonProps={{
          disabled: this.iamStore.isIamUser || (this.formState && this.formState.$ && !this.formState.$.isEnabled.value)
        }}
      >
        <Prompt type="assist" className={styles.prompt}>
          使用一次写入多次读取（WORM）模型存储对象，以防止对象在固定的时间段内或无限期地被删除或覆盖，规则配置完成后即时生效，且<span>仅作用在设置生效后空间内新上传的对象上</span>。
        </Prompt>
        {this.formState ? this.formView : <Spin className={styles.formLoading} />}
      </Drawer>
    )
  }
}

export default function SettingDrawer(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSettingDrawer {...props} inject={inject} />
    )} />
  )
}
