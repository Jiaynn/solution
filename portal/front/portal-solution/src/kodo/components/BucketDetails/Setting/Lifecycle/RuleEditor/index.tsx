/**
 * @author: corol
 * @github: github.com/huangbinjie
 * @created: Wed Jun 12 2019
 * @desc: 规则编辑器，用于创建和修改规则。
 *
 * Copyright (c) 2019 Qiniu
 */

import * as React from 'react'
import { computed, observable, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import { Inject, InjectFunc } from 'qn-fe-core/di'
import { Form, Input, Row, Switch, Alert } from 'react-icecream/lib'
import Drawer from 'react-icecream/lib/drawer'
import Radio from 'react-icecream/lib/radio'
import Role from 'portal-base/common/components/Role'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import { bindFormItem, bindTextInputField, bindSwitchField, bindRadioField } from 'kodo/utils/formstate'

import { ConfigStore } from 'kodo/stores/config'

import { BucketSettingLifecycleRole } from 'kodo/constants/role'
import { StorageType } from 'kodo/constants/statistics'

import Prompt from 'kodo/components/common/Prompt'
import FormTrigger from 'kodo/components/common/FormTrigger'

import { LifecycleRule } from 'kodo/apis/bucket/setting/lifecycle-rules'

import RuleEditorStore, { RuleEditorFormState, EditType, PrefixType } from './store'

import styles from './style.m.less'

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 }
} as const

const innerFormItemLayout = {
  labelCol: { span: 0 }
} as const

export interface IProps {
  store: RuleEditorStore
  bucketName: string
  confirmLoading?: boolean
  onClose?: () => void
  onOk?: (rule: LifecycleRule, type: EditType) => void | Promise<any>
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalRuleEditor extends React.Component<IProps & DiDeps> {
  configStore = this.props.inject(ConfigStore)
  featureStore = this.props.inject(FeatureConfigStore)
  @observable.ref errorMessageRef: React.RefObject<HTMLDivElement> = React.createRef()

  handleOk = async () => {
    const store = this.props.store
    const result = await store.form.validate()

    if (result.hasError) {
      return
    }

    store.validateSetDaysError()
    if (store.hasSetDaysError) {
      if (this.errorMessageRef.current) {
        this.errorMessageRef.current.scrollTo(0, 0)
      }
      return
    }

    if (this.props.onOk) {
      try {
        await this.props.onOk(store.getRuleData(), store.type)
      } catch {
        return
      }

      store.close()
    }
  }

  handleClose = () => {
    this.props.store.close()

    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  handleArchiveInputBlur = () => {
    if (!this.props.store.form.$.toArchiveAfterDays.value) {
      this.props.store.form.$.toArchiveAfterDays.reset('90')
    }
  }

  handleDeleteInputBlur = () => {
    if (!this.props.store.form.$.deleteAfterDays.value) {
      this.props.store.form.$.deleteAfterDays.reset('360')
    }
  }

  handleHistoryDeleteInputBlur = () => {
    if (!this.props.store.form.$.historyDeleteAfterDays.value) {
      this.props.store.form.$.historyDeleteAfterDays.reset('360')
    }
  }

  handleHistoryToLineInputBlur = () => {
    if (!this.props.store.form.$.historyToLineAfterDays.value) {
      this.props.store.form.$.historyToLineAfterDays.reset('60')
    }
  }

  handleLineInputBlur = () => {
    if (!this.props.store.form.$.toLineAfterDays.value) {
      this.props.store.form.$.toLineAfterDays.reset('60')
    }
  }

  handleDeepArchiveInputBlur = () => {
    if (!this.props.store.form.$.toDeepArchiveAfterDays.value) {
      this.props.store.form.$.toDeepArchiveAfterDays.reset('180')
    }
  }

  constructor(props: IProps & DiDeps) {
    super(props)
    makeObservable(this)
  }

  // 转为低频存储当前文件, 公有云才显示
  renderToLineAfterDays(formFields: RuleEditorFormState) {
    // 低频模块关闭
    if (
      !this.props.store.globalConfig
      || !this.props.store.globalConfig.objectStorage.storageType.lowFrequency.enable
    ) {
      return null
    }

    return (
      <Role name={BucketSettingLifecycleRole.RuleToLowFrequencyTypeCtrl}>
        <Form.Item
          label="转为低频存储"
          {...formItemLayout}
        >
          {this.isVerCtrlEnabled && <div>当前版本文件</div>}
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            {...bindSwitchField(formFields.showToLineAfterDays)}
          />
          <Prompt className={formFields.showToLineAfterDays.value ? '' : styles.hide}>
            <div className={styles.promptText}>请设定时间 (天)，用户新创建的文件将在您设定的时间之后自动转为低频存储</div>
            <Form.Item
              className={styles.formItemWithPrompt}
              {...innerFormItemLayout}
              {...bindFormItem(formFields.toLineAfterDays)}
            >
              <Input
                size="small"
                onBlur={this.handleLineInputBlur}
                className={styles.promptInput}
                {...bindTextInputField(formFields.toLineAfterDays)}
              /> 天
            </Form.Item>
          </Prompt>
          {this.renderToLineAfterDaysHistory(formFields)}
        </Form.Item>
      </Role>
    )
  }

  // 归档存储目前没有支持多版本，所以不存在历史文件
  renderToArchiveAfterDays(formFields: RuleEditorFormState) {
    if (
      !this.props.store.globalConfig
      || !this.props.store.globalConfig.objectStorage.storageType.archive.enable
    ) {
      return null
    }
    return (
      <Role name={BucketSettingLifecycleRole.RuleToArchiveTypeCtrl}>
        <Form.Item
          label="转为归档存储"
          {...formItemLayout}
        >
          {this.isVerCtrlEnabled && <div>当前版本文件</div>}
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            {...bindSwitchField(formFields.showToArchiveAfterDays)}
          />
          <Prompt className={formFields.showToArchiveAfterDays.value ? '' : styles.hide}>
            <div className={styles.promptText}>请设定时间 (天)，用户新创建的文件将在您设定的时间之后自动转为归档存储</div>
            <Form.Item
              className={styles.formItemWithPrompt}
              {...innerFormItemLayout}
              {...bindFormItem(formFields.toArchiveAfterDays)}
            >
              <Input
                size="small"
                onBlur={this.handleArchiveInputBlur}
                className={styles.promptInput}
                {...bindTextInputField(formFields.toArchiveAfterDays)}
              /> 天
            </Form.Item>
          </Prompt>
        </Form.Item>
      </Role>
    )
  }

  // 低频存储历史文件处理，公有云不显示。下面的代码暂时不起作用。
  renderToLineAfterDaysHistory(formFields: RuleEditorFormState) {
    if (
      !this.props.store.globalConfig
      || !this.props.store.regionConfig
      || !this.props.store.regionConfig.objectStorage.fileMultiVersion.enable
      || !this.props.store.globalConfig.objectStorage.storageType.lowFrequency.enable
      || this.featureStore.isDisabled('KODO.KODO_VERSION')
    ) {
      return null
    }

    return (
      <>
        <div>历史版本文件</div>
        <Switch
          checkedChildren="开"
          unCheckedChildren="关"
          {...bindSwitchField(formFields.showHistoryToLineAfterDays)}
        />
        <Prompt className={formFields.showHistoryToLineAfterDays.value ? '' : styles.hide}>
          <div className={styles.promptText}>请设定时间 (天)，产生的历史版本文件将在您设定的时间之后自动转为低频存储</div>
          <Form.Item
            className={styles.formItemWithPrompt}
            {...innerFormItemLayout}
            {...bindFormItem(formFields.historyToLineAfterDays)}
          >
            <Input
              onBlur={this.handleHistoryToLineInputBlur}
              size="small"
              className={styles.promptInput}
              {...bindTextInputField(formFields.historyToLineAfterDays)}
            /> 天
          </Form.Item>
        </Prompt>
      </>
    )
  }

  renderToDeepArchiveAfterDays(formFields: RuleEditorFormState) {
    if (!this.configStore.supportedStorageTypes.includes(StorageType.DeepArchive)) { return null }
    return (
      <Role name={BucketSettingLifecycleRole.RuleToDeepArchiveTypeCtrl}>
        <Form.Item
          label="转为深度归档存储"
          {...formItemLayout}
        >
          {this.isVerCtrlEnabled && <div>当前版本文件</div>}
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            {...bindSwitchField(formFields.showToDeepArchiveAfterDays)}
          />
          <Prompt className={formFields.showToDeepArchiveAfterDays.value ? '' : styles.hide}>
            <div className={styles.promptText}>请设定时间 (天)，用户新创建的文件将在您设定的时间之后自动转为深度归档存储</div>
            <Form.Item
              className={styles.formItemWithPrompt}
              {...innerFormItemLayout}
              {...bindFormItem(formFields.toDeepArchiveAfterDays)}
            >
              <Input
                size="small"
                onBlur={this.handleDeepArchiveInputBlur}
                className={styles.promptInput}
                {...bindTextInputField(formFields.toDeepArchiveAfterDays)}
              /> 天
            </Form.Item>
          </Prompt>
        </Form.Item>
      </Role>
    )
  }

  // 删除当前文件，都显示
  renderDeleteAfterDays(formFields: RuleEditorFormState) {
    return (
      <Role name={BucketSettingLifecycleRole.RuleToDeleteCtrl}>
        <Form.Item
          label="删除文件"
          {...formItemLayout}
        >
          {this.isVerCtrlEnabled && <div>当前版本文件</div>}
          <Switch
            checkedChildren="开"
            unCheckedChildren="关"
            {...bindSwitchField(formFields.showDeleteAfterDays)}
          />
          <Prompt className={formFields.showDeleteAfterDays.value ? '' : styles.hide}>
            <div className={styles.promptText}>请设定时间 (天)，用户新创建的文件将在您设定的时间之后自动删除</div>
            <Form.Item
              className={styles.formItemWithPrompt}
              {...innerFormItemLayout}
              {...bindFormItem(formFields.deleteAfterDays)}
            >
              <Input
                size="small"
                onBlur={this.handleDeleteInputBlur}
                className={styles.promptInput}
                {...bindTextInputField(formFields.deleteAfterDays)}
              /> 天
            </Form.Item>
          </Prompt>
          {this.renderDeleteAfterDaysHistory(formFields)}
        </Form.Item>
      </Role>
    )
  }

  // 删除策略历史文件，公有云暂时没有启用版本管理
  renderDeleteAfterDaysHistory(formFields: RuleEditorFormState) {
    if (
      !this.props.store.regionConfig
      || !this.props.store.regionConfig.objectStorage.fileMultiVersion.enable
      || this.featureStore.isDisabled('KODO.KODO_VERSION')
    ) {
      return null
    }

    return (
      <>
        <div>历史版本文件</div>
        <Switch
          checkedChildren="开"
          unCheckedChildren="关"
          {...bindSwitchField(formFields.showHistoryDeleteAfterDays)}
        />
        <Prompt className={formFields.showHistoryDeleteAfterDays.value ? '' : styles.hide}>
          <div className={styles.promptText}>请设定时间 (天)，产生的历史版本文件将在您设定的时间之后自动删除</div>
          <Form.Item
            className={styles.formItemWithPrompt}
            {...innerFormItemLayout}
            {...bindFormItem(formFields.historyDeleteAfterDays)}
          >
            <Input
              size="small"
              className={styles.promptInput}
              onBlur={this.handleHistoryDeleteInputBlur}
              {...bindTextInputField(formFields.historyDeleteAfterDays)}
            /> 天
          </Form.Item>
        </Prompt>
      </>
    )
  }

  @computed
  get isVerCtrlEnabled() {
    // 判断版本控制配置是否开启
    return this.props.store.regionConfig
    && this.props.store.regionConfig.objectStorage.fileMultiVersion.enable
    && !this.featureStore.isDisabled('KODO.KODO_VERSION')
  }
  @computed
  get globalConfig() {
    return this.configStore.getFull()
  }

  @computed
  get dayConstraint() {
    const isLowFrequencyEnabled = this.configStore.supportedStorageTypes.includes(StorageType.LowFrequency)
    const isArchiveEnabled = this.configStore.supportedStorageTypes.includes(StorageType.Archive)
    const isDeepArchiveEnabled = this.configStore.supportedStorageTypes.includes(StorageType.DeepArchive)

    const dayConstraint: string[] = []

    if (isLowFrequencyEnabled) { dayConstraint.push('转为低频存储') }
    if (isArchiveEnabled) { dayConstraint.push('转为归档存储') }
    if (isDeepArchiveEnabled) { dayConstraint.push('转为深度归档存储') }

    if (dayConstraint.length < 1) { return null }

    dayConstraint.push('删除文件')

    return `天数设置必须满足：${dayConstraint.join(' < ')}。`
  }

  @computed
  get setDaysErrorTextView() {
    return this.props.store.hasSetDaysError
      ? (
        <Alert
          closable
          showIcon
          type="warning"
          message={this.dayConstraint}
        />
      )
      : null
  }

  // 删除文件提醒
  @computed
  get deleteFilePromptView() {
    const versionEnabled = (
      this.props.store.regionConfig
      && this.props.store.regionConfig.objectStorage.fileMultiVersion.enable
      && !this.featureStore.isDisabled('KODO.KODO_VERSION')
    )

    const isLowFrequencyEnabled = this.configStore.supportedStorageTypes.includes(StorageType.LowFrequency)
    const isArchiveEnabled = this.configStore.supportedStorageTypes.includes(StorageType.Archive)
    const isDeepArchiveEnabled = this.configStore.supportedStorageTypes.includes(StorageType.DeepArchive)

    return (
      <Prompt className={styles.drawerTip} type="assist">
        文件删除是不可逆的，请根据需求合理配置文件生命周期时间计划。<br />
        策略配置完成后即时生效，且<span>只对规则存续期间新建的文件</span>{versionEnabled ? '，及生成的历史版本文件' : ''}执行，请谨慎选择。<br />
        {this.dayConstraint && (<>{this.dayConstraint}<br /></>)}
        {isLowFrequencyEnabled && (
          <>
            文件转为低频存储类型后需要<span>至少保存 30天</span>，
            若<span>（转为其它类型或删除文件 - 转为低频）的时间 &lt; 30天</span>，
            则会产生低频存储提前删除费用。<br />
          </>
        )}
        {isArchiveEnabled && (
          <>
            文件转为归档存储类型后需要<span>至少保存 60天</span>，
            若<span>（{isDeepArchiveEnabled && '转为其它类型或'}删除文件 - 转为归档）的时间 &lt; 60天</span>，
            则会产生归档存储的提前删除费用。<br />
          </>
        )}
        {isDeepArchiveEnabled && (
          <>
            文件转为深度归档存储后需要<span>至少保存 180天</span>，
            若<span>（删除文件 - 转为深度归档）的时间 &lt; 180天</span>，
            则会产生深度归档存储的提前删除费用。
          </>
        )}
      </Prompt>
    )
  }

  render() {
    const { store, confirmLoading } = this.props
    const formFields = store.form.$

    return (
      <Drawer
        width={640}
        title={store.type === EditType.Update ? '编辑规则' : '创建新规则'}
        visible={store.visible}
        confirmLoading={confirmLoading}
        onOk={this.handleOk}
        onClose={this.handleClose}
        className={styles.drawer}
      >
        <div ref={this.errorMessageRef} style={{ overflow: 'auto', padding: 24 }}>
          {this.deleteFilePromptView}
          <Role name={BucketSettingLifecycleRole.EditRuleBlock}>
            <Form
              layout="horizontal"
              className={styles.form}
              onSubmit={event => {
                event.preventDefault()
                this.handleOk()
              }}
            >
              <FormTrigger />
              <Role name={BucketSettingLifecycleRole.RuleNameInput}>
                <Form.Item
                  required
                  label="规则名称"
                  {...formItemLayout}
                  {...bindFormItem(formFields.name)}
                >
                  <Input
                    type="text"
                    placeholder="请输入规则名称"
                    disabled={store.type === EditType.Update}
                    {...bindTextInputField(formFields.name)}
                  />
                </Form.Item>
              </Role>
              <Role name={BucketSettingLifecycleRole.RulePrefixInput}>
                <Form.Item
                  required
                  label="规则策略"
                  {...formItemLayout}
                  {...bindFormItem(formFields.prefix)}
                >
                  <Row>
                    <Radio.Group {...bindRadioField(formFields.prefixType)}>
                      <Radio value={PrefixType.Global}>对整个空间生效</Radio>
                      <Radio value={PrefixType.Prefix}>对前缀生效</Radio>
                    </Radio.Group>
                  </Row>
                  <Input
                    type="text"
                    className={formFields.prefixType.value === PrefixType.Global ? styles.hide : ''}
                    placeholder="请输入前缀"
                    {...bindTextInputField(formFields.prefix)}
                  />
                </Form.Item>
              </Role>
              {this.setDaysErrorTextView}
              {this.renderToLineAfterDays(formFields)}
              {this.renderToArchiveAfterDays(formFields)}
              {this.renderToDeepArchiveAfterDays(formFields)}
              {this.renderDeleteAfterDays(formFields)}
            </Form>
          </Role>
        </div>
      </Drawer>
    )
  }
}

export default function RuleEditor(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalRuleEditor {...props} inject={inject} />
    )} />
  )
}
