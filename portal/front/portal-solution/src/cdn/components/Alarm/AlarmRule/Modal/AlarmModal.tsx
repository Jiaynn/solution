/**
 * @file 告警规则配置
 * @author linchen <linchen@qiniu.com> modify by zhouhang
 */

import React from 'react'
import { observer } from 'mobx-react'
import { action, computed, makeObservable, observable, reaction } from 'mobx'
import cx from 'classnames'
import autobind from 'autobind-decorator'
import { useInjection } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { ToasterStore } from 'portal-base/common/toaster'
import { FeatureConfigStore as FeatureConfig } from 'portal-base/user/feature-config'
import {
  createRecipientSelectState,
  getRecipientSelectValue,
  RecipientRefresh,
  RecipientSelect,
  RecipientSelectState
} from 'portal-base/user/notification'
import { FieldState, FormState } from 'formstate-x'
import { FormFooter, Tooltip, Alert, Button, Tag } from 'react-icecream-2'
import { AddIcon, TipIcon } from 'react-icecream-2/icons'
import { DrawerForm, FormItem, TextInput } from 'react-icecream-2/form-x'

import { IModalProps } from 'cdn/stores/modal'

import { alarmChannelId, alarmTemplateId, maxAlarmLength } from 'cdn/constants/alarm'

import AlarmRuleApis, { AlarmConfigForEdit } from 'cdn/apis/alarm/rule'

import { AlarmConfigForDisplay } from '../List'
import AlarmItemInput, * as alarmItemInput from '../Inputs/AlarmItemInput'
import DomainsSelect, * as domainsSelect from './DomainsSelect'

import './style.less'

export enum AlarmModalType {
  Edit = 'edit',
  View = 'view',
  Create = 'create'
}

export type Value = Omit<AlarmConfigForEdit, 'isEnable'>

export type State = FormState<{
  name: FieldState<string>
  domains: domainsSelect.State
  metrics: FormState<alarmItemInput.State[]>
  independent: FieldState<boolean>
  recipient: RecipientSelectState
}>

const defaultConfigValue: Value = {
  name: '',
  domains: [],
  metrics: [],
  independent: true,
  recipient: {
    recipientUserIds: [],
    recipientGroupIds: [],
    webhookIds: [],
    channelId: alarmChannelId,
    templateId: alarmTemplateId
  }
}

function getConfigForEdit(config?: AlarmConfigForDisplay): Value {
  if (!config) {
    return defaultConfigValue
  }

  if (config.recipient) {
    const { recipientUserIds, recipientGroupIds, webhookIds, channelId, templateId } = config.recipient

    return {
      ...config,
      recipient: {
        recipientUserIds: recipientUserIds || [],
        recipientGroupIds: recipientGroupIds || [],
        webhookIds: webhookIds || [],
        channelId: channelId || alarmChannelId,
        templateId: templateId || alarmTemplateId
      }
    }
  }

  return { ...defaultConfigValue, ...config }
}

export function createFormState(config?: AlarmConfigForDisplay): State {
  const data: Value = config || defaultConfigValue
  const metricsList = data.metrics.map(alarmItemInput.createState)
  // 监控指标默认含有一项
  if (!metricsList.length) {
    metricsList.push(alarmItemInput.createState())
  }

  return new FormState({
    name: new FieldState(data.name.trim()).validators(name => {
      if (!name || !name.length) {
        return '规则名称不能为空！'
      }
      if (!/^[\u4E00-\u9FA5A-Za-z0-9-_.]+$/.test(name)) {
        return '含有非法字符，请输入中英文字符、数字、下划线、短横线、小数点'
      }
    }),
    metrics: new FormState(metricsList),
    independent: new FieldState(data.independent),
    domains: domainsSelect.createState(data.domains).validators(domain => !domain && '请选择域名'),
    recipient: createRecipientSelectState({
      users: data.recipient?.recipientUserIds || [],
      groups: data.recipient?.recipientGroupIds || [],
      webhooks: data.recipient?.webhookIds || []
    })
  }).validators($ => {
    if (!$.metrics || !$.metrics.length) {
      return '请输入告警监控指标配置'
    }
    return null
  })
}

export interface ExtraProps {
  config?: AlarmConfigForDisplay
  type?: AlarmModalType
}

export type Props = ExtraProps & IModalProps<Value>

export interface AlarmSideModalProps extends Props {
  featureConfigStore: FeatureConfig
  toasterStore: ToasterStore
  alarmRuleApis: AlarmRuleApis
}

function createState() {
  return {
    visible: new FieldState<boolean>(false)
  }
}

@observer
class AlarmSideModal extends React.Component<AlarmSideModalProps> {
  @observable.ref configState = createFormState(this.props.config)
  @observable.ref configForEdit = getConfigForEdit()
  visibleState = createState()
  disposable = new Disposable()

  constructor(props: AlarmSideModalProps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @computed get modalType() {
    return this.props.type
  }

  @computed get isEdit() {
    return this.modalType === AlarmModalType.Edit
  }

  @computed get isCreate() {
    return this.modalType === AlarmModalType.Create
  }

  @computed get isView() {
    return this.modalType === AlarmModalType.View
  }

  @computed get modalTitle() {
    if (this.isEdit) {
      return '编辑告警规则'
    }
    if (this.isView) {
      return '查看告警规则'
    }
    return '新建告警规则'
  }

  @computed get configValue(): Value {
    const metrics = this.configState.$.metrics.$.map(alarmItemInput.getValue)
    const { users, groups, webhooks } = getRecipientSelectValue(this.configState.$.recipient)

    return {
      name: this.configState.$.name.$.replace(/\s*/g, ''),
      domains: this.configState.$.domains.value,
      independent: this.configState.$.independent.value,
      metrics,
      recipient: {
        recipientUserIds: users,
        recipientGroupIds: groups,
        webhookIds: webhooks,
        channelId: this.configForEdit.recipient?.channelId,
        templateId: this.configForEdit.recipient?.templateId
      }
    }
  }

  @computed get alarmLength() {
    return this.configState.$.metrics.value.length
  }

  @computed get bindDomainsLength() {
    return this.configState.$.domains.$.length
  }

  @computed get allowAddAlarm() {
    return this.alarmLength < maxAlarmLength
  }

  @computed get alarmRuleNameLength() {
    return this.configState.$.name.value.length
  }

  @action.bound
  handleDeleteAlarmItem(index: number) {
    this.configState.$.metrics.$.splice(index, 1)
  }

  @action.bound
  handleAddAlarmItem() {
    this.configState.$.metrics.$.push(alarmItemInput.createState())
  }

  @autobind handleSubmit() {
    this.props.onSubmit(this.configValue)
  }

  @autobind handleDomainsSelectOk() {
    this.visibleState.visible.onChange(true)
  }

  @autobind handleDomainsSelectCancel() {
    this.visibleState.visible.onChange(false)
  }

  @action.bound
  resetFormState(config?: AlarmConfigForDisplay) {
    this.configState.dispose()
    this.configState = createFormState(config)
    this.disposable.addDisposer(this.configState.dispose)
  }

  componentDidMount() {
    this.disposable.addDisposer(reaction(
      () => this.props.config,
      config => {
        this.resetFormState(config)
      }
    ))

    // 每次弹窗关闭时重置表单
    this.disposable.addDisposer(reaction(
      () => this.props.visible,
      visible => {
        if (!visible) {
          // 这里本来应该是使用 reset 的，但由于 reset 不会清空`监控指标配置`的条数，改用 createState 来代替
          this.resetFormState(this.props.config)
        }
      }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  renderRuleNameInput() {
    return (
      <FormItem
        label="规则名称"
      >
        <TextInput
          state={this.configState.$.name}
          style={{ width: '100%' }}
          disabled={this.isView}
          placeholder="请输入规则名称"
          clearable
        />
      </FormItem>
    )
  }

  renderDomainSelect() {
    return (
      <div className="form-item-config">
        <div className="config-header">
          {this.isView && this.renderBindDomains()}
        </div>
        {
          !this.isView && (
            <FormItem label="监控域名">
              <DomainsSelect state={this.configState.$.domains} />
            </FormItem>
          )
        }
      </div>
    )
  }

  renderBindDomains() {
    const domains = this.configState.$.domains
    return (
      <FormItem
        label="监控域名"
        state={this.configState.$.domains}
      >
        {domains.value.map((value, index) => (
          <Tag
            filled
            style={{ margin: '5px', color: '#333333', backgroundColor: '#F5F5F5' }}
            key={domains.value[index]}
          >
            {value}
          </Tag>
        ))}
      </FormItem>
    )
  }

  renderAlarmListController() {
    const independent = this.configState.$.independent
    const handleChange = () => {
      independent.onChange(!independent.value)
    }
    const and = cx('controller-option', { 'controller-option-active': !independent.value })
    const or = cx('controller-option', { 'controller-option-active': independent.value })

    return (
      <div className="alarm-list-controller">
        <span className="controller-split" />
        <div className="controller-options">
          <div onClick={handleChange} className={and}>且</div>
          <div onClick={handleChange} className={or}>或</div>
        </div>
      </div>
    )
  }

  renderAlarmListContent() {
    const metrics = this.configState.$.metrics.$

    return (
      <div className="alarm-list">
        {
          metrics.map((alarmItemState, index) => (
            <div key={index} className="alarm-list-item">
              <AlarmItemInput
                disabled={this.isView}
                state={alarmItemState}
                onDelete={() => this.handleDeleteAlarmItem(index)}
                deletable={metrics.length > 1}
              />
            </div>
          ))
        }
      </div>
    )
  }

  renderAlarmItemList() {
    const addAlarmLink = (
      <Button
        type="link"
        icon={<AddIcon />}
        {...(this.allowAddAlarm && { onClick: this.handleAddAlarmItem })}
        className={cx('add-alarm-link', { 'is-disabled': !this.allowAddAlarm })}
      >
        添加监控指标
      </Button>
    )

    return (
      <div className="form-item-config">
        <div className="config-header">
          <div className="header-title">监控指标配置</div>
          <div className="add-alarm-link-wrapper">
            { !this.allowAddAlarm
                ? (
                  <Tooltip
                    title={`最多支持 ${maxAlarmLength} 条告警规则`}
                    placement="right"
                  >
                    {addAlarmLink}
                  </Tooltip>
                )
                : !this.isView && addAlarmLink }
          </div>
        </div>
        <div className="alarm-list-wrapper">
          {this.alarmLength > 1 && this.renderAlarmListController()}
          {this.alarmLength > 0 && this.renderAlarmListContent()}
        </div>
      </div>
    )
  }

  renderNotificationGroups() {
    return (
      <FormItem className="form-item-contact">
        <div className="contact-header">
          <div className="header-title">监控接收人</div>
          { (this.isEdit || this.isCreate) && <RecipientRefresh /> }
        </div>
        <RecipientSelect disabled={this.isView} state={this.configState.$.recipient} />
      </FormItem>
    )
  }

  renderTip() {
    return (
      <Alert
        type="info"
        message="当监控指标超过您的预设值时，会发送告警通知；如果 1 小时内有多次超过您的预设值，只告警一次；告警延迟平均为 15 分钟（最久不超过 30 分钟）"
        style={{ marginBottom: 12 }}
        icon={<TipIcon />}
      />
    )
  }

  render() {
    return (
      <DrawerForm
        autoDestroy
        width={735}
        visible={this.props.visible}
        state={this.configState}
        onSubmit={this.handleSubmit}
        onCancel={this.props.onCancel}
        title={this.modalTitle}
        footer={this.isView ? null : <FormFooter />}
      >
        <div className="comp-alarm-content">
          {this.renderTip()}
          {this.renderRuleNameInput()}
          {this.renderAlarmItemList()}
          {this.renderNotificationGroups()}
          {this.renderDomainSelect()}
        </div>
      </DrawerForm>
    )
  }
}

export default observer(function AlarmModal(props: Props) {
  const featureConfigStore = useInjection(FeatureConfig)
  const toasterStore = useInjection(ToasterStore)
  const alarmRuleApis = useInjection(AlarmRuleApis)
  return (
    <AlarmSideModal
      {...props}
      toasterStore={toasterStore}
      featureConfigStore={featureConfigStore}
      alarmRuleApis={alarmRuleApis}
    />
  )
})
