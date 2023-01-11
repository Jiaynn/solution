/**
 * @file Bucket setting referrer form component
 * @description Bucket setting referrer form
 * @author Surmon <i@surmon.me>
 */

import * as React from 'react'
import autobind from 'autobind-decorator'
import { observer } from 'mobx-react'
import { observable, action, reaction, computed, makeObservable } from 'mobx'
import { FieldState, FormState } from 'formstate'
import { Drawer, Form, Input, Radio, Switch, Button, Tooltip, Icon, Spin } from 'react-icecream/lib'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { Loadings } from 'portal-base/common/loading'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'

import { valuesOf } from 'kodo/utils/ts'
import { ValidatableObject, bindFormItem } from 'kodo/utils/formstate'
import { bindTextInputField, bindRadioField } from 'kodo/utils/formstate/bind'

import docStyles from 'kodo/styles/card.m.less'

import { KodoIamStore } from 'kodo/stores/iam'
import { BucketStore } from 'kodo/stores/bucket'
import { ConfigStore } from 'kodo/stores/config'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { NoReferrer, AntiLeechMode, antiLeechModeNameMap } from 'kodo/constants/bucket/setting/referrer'

import Prompt from 'kodo/components/common/Prompt'

import HelpDocLink from 'kodo/components/common/HelpDocLink'
import FormTrigger from 'kodo/components/common/FormTrigger'
import { Description } from 'kodo/components/common/Description'

import { IBucket } from 'kodo/apis/bucket'
import { ReferrerApis } from 'kodo/apis/bucket/setting/referrer'

import styles from './style.m.less'

enum Loading {
  UpdateReferrer = 'UpdateReferrer'
}

export interface IValue {
  status: boolean
  mode: AntiLeechMode
  referrers: string[]
  noReferrer: NoReferrer
}

export type IState = FormState<
  {
    referrers: FormState<IReferrerState[]>
  }
  & ValidatableObject<Omit<IValue, 'referrers'>>
>

type IReferrerState = FormState<{ referrer: FieldState<string> }>

function createReferrerField(info: string): IReferrerState {
  return new FormState({
    referrer: new FieldState(info).validators(
      value => {
        if (!value) {
          return '输入不能为空'
        }
      },
      value => {
        // 此处正则来自后端（首部可以是 * 或者整个内容是 *）
        if (!/^((((\*)|([-0-9a-z]+))(\.[-0-9a-z]+)+(:\d{1,5})?)|\*)$/.test(value)) {
          return '格式不正确'
        }
      }
    )
  })
}

export interface IProps extends IDetailsBaseOptions {
  visible: boolean
  onClose(): void
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalReferrerForm extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  iamStore = this.props.inject(KodoIamStore)
  userInfoStore = this.props.inject(UserInfo)
  configStore = this.props.inject(ConfigStore)
  bucketStore = this.props.inject(BucketStore)
  referrerApis = this.props.inject(ReferrerApis)

  disposable = new Disposable()
  loadings = Loadings.collectFrom(this, ...valuesOf(Loading))

  @observable form: IState

  @computed
  get regionConfig() {
    const bucketInfo = this.bucketStore.getDetailsByName(this.props.bucketName)
    if (bucketInfo == null) {
      return null
    }

    return this.configStore.getRegion({ region: bucketInfo.region })
  }

  @action.bound createFormState(bucket: IBucket) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { anti_leech_mode, refer_wl, refer_bl, no_refer } = bucket

    const baseValue: IValue = {
      status: !!anti_leech_mode,
      mode: anti_leech_mode || AntiLeechMode.WhiteList,
      noReferrer: no_refer ? NoReferrer.Allow : NoReferrer.Disallow,
      referrers: {
        [AntiLeechMode.Disabled]: [],
        [AntiLeechMode.WhiteList]: refer_wl || [],
        [AntiLeechMode.BlackList]: refer_bl || []
      }[anti_leech_mode]
    }

    const initialValue: IValue = {
      status: false,
      mode: 0,
      referrers: [],
      noReferrer: NoReferrer.Allow
    }

    Object.assign(initialValue, baseValue)

    this.form = new FormState({
      status: new FieldState(initialValue.status),
      mode: new FieldState(initialValue.mode).validators(val => !val && '请选择配置模式'),
      referrers: new FormState(initialValue.referrers.map(
        referrer => createReferrerField(referrer)
      )),
      noReferrer: new FieldState(initialValue.noReferrer)
    })
  }

  @action.bound addReferrer() {
    this.form.$.referrers.$.push(createReferrerField(''))
  }

  @action.bound deleteReferrer(index: number) {
    this.form.$.referrers.$.splice(index, 1)
  }

  @autobind
  @Toaster.handle('更新成功！')
  @Loadings.handle(Loading.UpdateReferrer)
  updateReferrer(value: Omit<IValue, 'status'>) {
    return this.referrerApis.updateReferrer(this.props.bucketName, {
      mode: value.mode,
      norefer: value.noReferrer,
      pattern: value.referrers.join(';'),
      source_enabled: 1 // 后端需要该参数
    })
  }

  @autobind
  handleSubmit(event) {
    event.preventDefault()

    this.form.validate().then(result => {
      if (result.hasError) {
        return
      }

      const value = {
        mode: this.form.$.status.value ? this.form.$.mode.value : 0,
        referrers: this.form.$.referrers.$.map(item => item.$.referrer.value.trim()),
        noReferrer: this.form.$.noReferrer.value
      }

      this.updateReferrer(value).then(this.props.onClose)
    })
  }

  renderReferrer() {
    return (
      this.form.$.referrers.$.map(
        (item: IReferrerState, index: number) => (
          <div key={index} className={styles.referrerBox}>
            <Form.Item {...bindFormItem(item.$.referrer)}>
              <div className={styles.referrer}>
                <Input placeholder="请输入 Referrer" {...bindTextInputField(item.$.referrer)} />
                <Button
                  icon="minus-circle"
                  type="link"
                  className={styles.deleteButton}
                  onClick={() => this.deleteReferrer(index)}
                />
              </div>
            </Form.Item>
          </div>
        )
      )
    )
  }

  renderLoading(): JSX.Element {
    return (
      <div className={styles.formLoading}>
        {/* TODO：drawer / modal 的 loading 后面需要统一 @huangbinjie */}
        <Spin />
      </div>
    )
  }

  renderForm(): JSX.Element {
    const formFields = this.form.$
    const formItemProps = {
      labelCol: { span: 5 },
      wrapperCol: { span: 17 }
    }

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormTrigger />
        <Form.Item
          label="当前状态"
          {...formItemProps}
          {...bindFormItem(formFields.status)}
        >
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            checked={formFields.status.value}
            onChange={formFields.status.reset}
          />
        </Form.Item>
        {formFields.status.value && (
          <>
            <Form.Item
              label="黑白名单配置"
              {...formItemProps}
              {...bindFormItem(formFields.mode)}
            >
              <Radio.Group {...bindRadioField(formFields.mode)}>
                {
                  [AntiLeechMode.WhiteList, AntiLeechMode.BlackList].map(mode => (
                    <Radio value={mode} key={mode}>{antiLeechModeNameMap[mode]}</Radio>
                  ))
                }
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="Referer"
              {...formItemProps}
            >
              <div className={styles.formReferrer}>
                {this.renderReferrer()}
                <div className={styles.addReferrerAction}>
                  <Button
                    onClick={this.addReferrer}
                    icon="plus"
                    type="dashed"
                  >
                    新增
                  </Button>
                  <Tooltip title={<div>当前仅支持以下三种格式：<br />a.b.com<br />*.b.com<br />*</div>}>
                    <Icon type="question-circle" className={styles.helpQuestion} />
                  </Tooltip>
                </div>
              </div>
            </Form.Item>
            <Form.Item
              label="允许空 Referer"
              {...formItemProps}
              {...bindFormItem(formFields.noReferrer)}
            >
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
                checked={!!formFields.noReferrer.value}
                onChange={checked => {
                  formFields.noReferrer.onChange(checked ? NoReferrer.Allow : NoReferrer.Disallow)
                }}
              />
            </Form.Item>
          </>
        )}
      </Form>
    )
  }

  render() {
    return (
      <Drawer
        width={640}
        title={
          <span>
            Referer 防盗链设置
            <Tooltip title="文档">
              <HelpDocLink className={docStyles.extraButton} doc="safetyReferrer" anchor="#set">
                <Icon type="file-text" />
              </HelpDocLink>
            </Tooltip>
          </span>
        }
        visible={this.props.visible}
        onClose={this.props.onClose}
        confirmLoading={this.loadings.isLoading(Loading.UpdateReferrer)}
        okButtonProps={{ disabled: this.iamStore.isIamUser || this.userInfoStore.isBufferedUser }}
        onOk={this.handleSubmit}
      >
        {this.regionConfig && this.regionConfig.objectStorage.referrerVerification.description && (
          <Prompt type="assist" className={styles.prompt}>
            <Description dangerouslyText={
              this.regionConfig.objectStorage.referrerVerification.description
            } />
          </Prompt>
        )}
        {this.form ? this.renderForm() : this.renderLoading()}
      </Drawer>
    )
  }

  @Toaster.handle()
  initForm() {
    return this.bucketStore.fetchDetailsByName(
      this.props.bucketName
    ).then(
      this.createFormState
    )
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.visible,
        visible => {
          if (visible) {
            this.initForm()
          }
        },
        { fireImmediately: true }
      )
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }
}

export default function ReferrerForm(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalReferrerForm {...props} inject={inject} />
    )} />
  )
}
