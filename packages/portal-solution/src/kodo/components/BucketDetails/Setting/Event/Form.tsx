/**
 * @file Bucket setting event form component
 * @description Bucket setting event form
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { observer } from 'mobx-react'
import { action, computed, observable, reaction, makeObservable } from 'mobx'
import { FieldState, FormState } from 'formstate'
import { Button, Drawer, Form, Icon, Input, Radio, Select, Tooltip } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import Role from 'portal-base/common/components/Role'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import { bindPureValueField, bindRadioField, bindTextInputField } from 'kodo/utils/formstate/bind'
import { bindFormItem, ValidatableObject } from 'kodo/utils/formstate'
import { isURL } from 'kodo/utils/url'
import { valuesOfEnum } from 'kodo/utils/ts'

import docStyles from 'kodo/styles/card.m.less'

import { ConfigStore } from 'kodo/stores/config'

import { eventTypeDescMap, eventTypeTextMap } from 'kodo/constants/bucket/setting/event'
import { StorageType } from 'kodo/constants/statistics'
import { BucketSettingEventRole } from 'kodo/constants/role'
import { RegionSymbol } from 'kodo/constants/region'

import Prompt from 'kodo/components/common/Prompt'
import FormTrigger from 'kodo/components/common/FormTrigger'
import HelpDocLink from 'kodo/components/common/HelpDocLink'

import { EventType, EventNotificationRule } from 'kodo/apis/bucket/setting/event-notification-rules'

import styles from './style.m.less'

enum FormAffixType {
  All = 'all',
  Prefix = 'prefix',
  Suffix = 'suffix'
}

type IFormFields = ValidatableObject<{
  name: string
  affixType: FormAffixType
  affix: string
  events: EventType[]
}> & {
  callbackUrls: FormState<Array<FieldState<string>>>
}

export interface IProps {
  region: RegionSymbol

  title: string
  visible: boolean
  isSubmitting: boolean
  baseData: EventNotificationRule

  onSubmit(event: EventNotificationRule): any

  onCancel(): void

  existingData?: EventNotificationRule[]
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalEventNotificationRuleForm extends React.Component<IProps & DiDeps> {
  configStore = this.props.inject(ConfigStore)
  featureStore = this.props.inject(FeatureConfigStore)
  disposable = new Disposable()
  @observable.ref form: FormState<IFormFields>

  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  @computed get isAppendExisted() {
    // 不再支持append，判断是否存在append
    if (this.props.baseData) {
      return this.props.baseData.events.some(val => val === EventType.Append)
    }
    return false
  }
  @computed get regionConfig() {
    return this.configStore.getRegion({ region: this.props.region })
  }

  @computed get shouldDisableDeleteButton(): boolean {
    return this.form.$.callbackUrls.$.length <= 1
  }

  @computed get shouldDisableAddButton(): boolean {
    return this.form.$.callbackUrls.$.length >= 5
  }

  @computed get events() {
    return valuesOfEnum(EventType).filter(eventType => {
      // 未启用多版本时过滤掉 CreateDeleteMarker 事件
      if (eventType === EventType.CreateDeleteMarker) {
        return this.regionConfig.objectStorage.fileMultiVersion.enable
          && !this.featureStore.isDisabled('KODO.KODO_VERSION')
      }

      if (eventType === EventType.RestoreComplete) {
        return this.configStore.supportedStorageTypes.includes(StorageType.Archive)
          || this.configStore.supportedStorageTypes.includes(StorageType.DeepArchive)
      }

      // 服务端Append接口已下线
      if (eventType === EventType.Append) {
        return false
      }

      return true
    })
  }

  @computed get rulePlaceholder() {
    if (!this.form) {
      return undefined
    }

    const { affixType } = this.form.$
    if (affixType.value === FormAffixType.All) {
      return undefined
    }

    if (affixType.value === FormAffixType.Prefix) {
      return '请输入前缀如：myPrefix/'
    }

    if (affixType.value === FormAffixType.Suffix) {
      return '请输入后缀'
    }

  }

  @computed get defaultAffixType() {
    if (this.props.baseData) {
      if (this.props.baseData.prefix) {
        return FormAffixType.Prefix
      }

      if (this.props.baseData.suffix) {
        return FormAffixType.Suffix
      }

      if (!this.props.baseData.suffix && !this.props.baseData.prefix) {
        return FormAffixType.All
      }
    }
    return FormAffixType.Prefix
  }

  @autobind isLastCallbackUrlData(index: number): boolean {
    return index !== this.form.$.callbackUrls.$.length - 1
  }

  @action.bound createAndResetForm() {
    this.form = this.createFormState()
  }

  @action.bound addCallbackFormUrl() {
    this.form.$.callbackUrls.$.push(this.createUrlFieldState(''))
  }

  @action.bound removeCallbackFormUrl(targetIndex: number) {
    this.form.$.callbackUrls.$.splice(targetIndex, 1)
  }

  @autobind createUrlFieldState(value: string) {
    const validateUrl = val => (!val || !isURL(val)) && '请输入合法的 URL'
    return new FieldState(value).validators(validateUrl)
  }

  @autobind createFormState() {
    const baseData = { ...this.props.baseData }
    const { prefix, suffix, callback_urls: urls } = baseData

    const baseState = {
      affixType: this.defaultAffixType,
      affix: prefix || suffix,
      ...baseData,
      // 过滤掉已经下线的append
      events: baseData.events ? baseData.events.filter(val => !(val === EventType.Append)) : [],
      callbackUrls: urls && urls.length ? urls : ['']
    }

    const validateArray = val => (!val || !val.length) && '不能为空'
    return new FormState<IFormFields>({
      name: (
        new FieldState(baseState.name)
          .validators(name => {
            const isNameVerified = /^[0-9a-zA-Z_]{1,50}$/.test(name)
            if (!name || !isNameVerified) {
              return '请输入正确的规则名称'
            }

            // 如果是编辑模式且没有修改过数据则无需做重复校验
            if (this.props.baseData && this.props.baseData.name === name) {
              return null
            }

            // 判断是否已存在
            if (
              this.props.existingData
              && this.props.existingData.some(event => event.name === name)
            ) {
              return '规则名称已存在'
            }
          })
      ),
      affixType: (
        new FieldState(baseState.affixType)
          .validators(value => !value && '请选择一个规则策略')
          .onDidChange(({ newValue: value }) => {
            // 当切换规则策略类型时，如果切换至全部空间，则应该清空输入框中的具体规则
            if (value === FormAffixType.All) {
              this.form.$.affix.reset('')
            }
            // 同时需要即时验证规则字段，否则会维持为切换前的验证状态
            this.form.$.affix.validate()
          })
      ),
      affix: (
        new FieldState(baseState.affix!)
          .validators(value => {
            const type = this.form.$.affixType.value

            // 非全局规则名称不能为空
            if (type !== FormAffixType.All && !value) {
              return '不能为空'
            }
          })
      ),
      events: new FieldState(baseState.events).validators(validateArray),
      callbackUrls: new FormState(baseState.callbackUrls.map(this.createUrlFieldState)).validators(validateArray)
    })
  }

  @autobind handleSubmit(event) {
    event.preventDefault()
    this.form.validate().then(result => {
      if (result.hasError) {
        return
      }

      const formFields = this.form.$
      const { affixType, affix } = formFields

      const values: EventNotificationRule = {
        callback_urls: formFields.callbackUrls.$.map(
          value => value.value.replace(
            /^https?/i, (protocol: string) => protocol.toLowerCase()
          )
        ),
        name: formFields.name.$,
        events: formFields.events.$
      }
      if (affixType.$ !== FormAffixType.All) {
        values[affixType.$] = affix.$
      }
      this.props.onSubmit(values)
    })
  }

  render() {
    const { visible } = this.props
    if (!visible || !this.form) {
      return null
    }

    const formFields = this.form.$
    const formItemProps = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 }
    }
    return (
      <Drawer
        width={600}
        title={
          <span>
            {this.props.title}
            <Tooltip title="文档">
              <HelpDocLink className={docStyles.extraButton} doc="event" anchor="set">
                <Icon type="file-text" />
              </HelpDocLink>
            </Tooltip>
          </span>
        }
        visible={this.props.visible}
        onClose={this.props.onCancel}
        onOk={this.handleSubmit}
        confirmLoading={this.props.isSubmitting}
      >
        <Role name={BucketSettingEventRole.EditRuleBlock}>
          <Form onSubmit={this.handleSubmit}>
            <FormTrigger />
            <Role name={BucketSettingEventRole.RuleNameInput}>
              <Form.Item
                required
                label="规则名称"
                {...formItemProps}
                {...bindFormItem(formFields.name)}
              >
                <Input
                  disabled={!!this.props.baseData}
                  {...bindTextInputField(formFields.name)}
                  prefix={(
                    <Tooltip title="规则名称由 1 ~ 50 个字符组成，可包含：字母、数字和下划线">
                      <Icon type="question-circle" className={styles.question} />
                    </Tooltip>
                  )}
                  placeholder="请输入规则名称"
                />
              </Form.Item>
            </Role>
            <Role name={BucketSettingEventRole.RulePrefixInput}>
              <Form.Item
                required
                label="规则策略"
                {...formItemProps}
                {...bindFormItem(formFields.affix)}
              >
                <Radio.Group
                  className={styles.formRadioGroup}
                  {...bindRadioField(formFields.affixType)}
                >
                  <Radio value={FormAffixType.All}>
                    对整个空间生效
                  </Radio>
                  <Radio value={FormAffixType.Prefix}>对前缀生效</Radio>
                  <Radio value={FormAffixType.Suffix}>对后缀生效</Radio>
                </Radio.Group>
                <Input
                  disabled={formFields.affixType.value === FormAffixType.All}
                  placeholder={this.rulePlaceholder}
                  {...bindTextInputField(formFields.affix)}
                />
              </Form.Item>
            </Role>
            <Role name={BucketSettingEventRole.RuleEventsInput}>
              <Form.Item
                required
                label="事件"
                {...formItemProps}
                {...bindFormItem(formFields.events)}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择事件"
                  {...bindPureValueField(formFields.events)}
                  value={formFields.events.value.slice()}
                  optionLabelProp="title"
                >
                  {this.events.map(
                    event => (
                      <Select.Option key={event} value={event} title={eventTypeTextMap[event]}>
                        {eventTypeTextMap[event]}（{eventTypeDescMap[event]}）
                      </Select.Option>
                    )
                  )}
                </Select>
                {this.isAppendExisted
                  && <Prompt className={styles.eventPrompt}>不再支持添加 append（创建/覆盖文件：追加上传）事件</Prompt>}
              </Form.Item>
            </Role>
            <Form.Item
              required
              label="回调地址"
              {...formItemProps}
            >
              <Prompt className={styles.callbackPrompt}>可设置多个回调用于失败后依次尝试</Prompt>
            </Form.Item>
            {formFields.callbackUrls.$.map((urlField, index) => (
              <Role key={index} name={BucketSettingEventRole.RuleCallbackUrlBlock}>
                <Form.Item
                  label=" "
                  colon={false}
                  {...formItemProps}
                  {...bindFormItem(urlField)}
                >
                  <div className={styles.formUrlItem}>
                    <Input
                      placeholder="请输入回调地址如：http(s)://test.com "
                      {...bindTextInputField(urlField)}
                    />
                    <div className={styles.buttons}>
                      <Role name={BucketSettingEventRole.RuleCallbackUrlRemoveCtrl}>
                        <Button
                          icon="delete"
                          className={styles.item}
                          disabled={this.shouldDisableDeleteButton}
                          onClick={() => this.removeCallbackFormUrl(index)}
                        />
                      </Role>
                      {
                        this.isLastCallbackUrlData(index)
                          ? null
                          : (
                            <Role name={BucketSettingEventRole.RuleCallbackUrlAddCtrl}>
                              <Button
                                icon="plus"
                                type="primary"
                                className={styles.item}
                                disabled={this.shouldDisableAddButton}
                                onClick={this.addCallbackFormUrl}
                              />
                            </Role>
                          )
                      }
                    </div>
                  </div>
                </Form.Item>
              </Role>
            ))}
          </Form>
        </Role>
      </Drawer>
    )
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.visible,
        visible => visible && this.createAndResetForm(),
        { fireImmediately: true }
      )
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }
}

export default function EventNotificationRuleForm(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalEventNotificationRuleForm {...props} inject={inject} />
    )} />
  )
}
