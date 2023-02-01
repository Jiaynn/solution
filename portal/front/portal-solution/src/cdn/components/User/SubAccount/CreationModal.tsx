/**
 * @file 创建子账号带有结果的弹出框
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observable, computed, reaction, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { FormState, FieldState } from 'formstate-x'

import Disposable from 'qn-fe-core/disposable'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { mailReg } from 'portal-base/user/account'
import Input from 'react-icecream/lib/input'
import Modal from 'react-icecream/lib/modal'
import Button from 'react-icecream/lib/button'
import Icon from 'react-icecream/lib/icon'
import Form from 'react-icecream/lib/form'
import { bindFormItem, bindTextInput } from 'portal-base/common/form'
import { I18nStore } from 'portal-base/common/i18n'

import { IModalProps } from 'cdn/stores/modal'

import { pleaseEnterField, pleaseEnterValidField } from 'cdn/locales/messages'

import { ISubAccountCreateResult } from 'cdn/constants/oem'

import SubAccountApis, { ICreateSubAccountResp } from 'cdn/apis/oem/sub-account'
import * as commonMessages from './messages'

import './style.less'

const messages = {
  ...commonMessages,
  create: {
    cn: '创建',
    en: 'Create'
  },
  cancel: {
    cn: '取消',
    en: 'Cancel'
  },
  createAccount: {
    cn: '创建子账号',
    en: 'Create new user'
  },
  inputUsername: {
    cn: '请输入用户名',
    en: 'Please enter user name.'
  },
  inputUserEmail: {
    cn: '请输入邮箱',
    en: 'Please enter user email.'
  }
}

export type IState = FormState<{
  name: FieldState<string>
  email: FieldState<string>
}>

export function createState(i18n: I18nStore): IState {
  const t = i18n.t
  return new FormState({
    name: new FieldState('').validators(v => !v && t(pleaseEnterField, i18n.t(messages.username))),
    email: new FieldState('').validators(
      val => !val && t(pleaseEnterField, t(messages.email)),
      val => !mailReg.test(val)
        && t(pleaseEnterValidField, t(messages.email))
    )
  })
}

export const defaultFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { pull: 2, span: 14 }
}

export function getValue(state: IState) {
  return state.value
}

enum LoadingType {
  CreateSubAccount = 'createSubAccount'
}

type PropsWithDeps = IModalProps<ISubAccountCreateResult> & {
  toasterStore: ToasterStore
  subAccountApis: SubAccountApis
  i18n: I18nStore
}

@observer
class CreationModalInner extends React.Component<PropsWithDeps> {
  disposable = new Disposable()
  @observable.ref formState = createState(this.props.i18n)

  loadings = Loadings.collectFrom(this, LoadingType)

  constructor(props: PropsWithDeps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @computed
  get isCreating() {
    return this.loadings.isLoading(LoadingType.CreateSubAccount)
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.visible,
        _ => { this.formState = createState(this.props.i18n) }
      )
    )
  }

  @ToasterStore.handle()
  @Loadings.handle(LoadingType.CreateSubAccount)
  createSubAccount() {
    return this.props.subAccountApis.createSubAccount({ ...this.formState.value })
      .then((res: ICreateSubAccountResp) => ({
        password: res.pwd,
        ...this.formState.value
      }))
  }

  @autobind
  handleConfirm() {
    return this.createSubAccount().then(this.props.onSubmit)
  }

  @autobind
  renderCreation() {
    const t = this.props.i18n.t

    return (
      <div className="subaccout-creation-wrapper">
        <Icon type="idcard" style={{ fontSize: '35px' }} />
        <h3>{t(messages.createAccount)}</h3>
        <Form className="creation-form" {...defaultFormItemLayout}>
          <Form.Item label={t(messages.inputUsername)} {...bindFormItem(this.formState.$.name)}>
            <Input
              type="text"
              style={{ width: '300px' }}
              {...bindTextInput(this.formState.$.name)}
            />
          </Form.Item>
          <Form.Item label={t(messages.inputUserEmail)} {...bindFormItem(this.formState.$.email)}>
            <Input
              type="text"
              style={{ width: '300px' }}
              {...bindTextInput(this.formState.$.email)}
            />
          </Form.Item>
        </Form>
      </div>
    )
  }

  render() {
    const t = this.props.i18n.t

    return (
      <Modal
        title={t(messages.createAccount)}
        visible={this.props.visible}
        width="60%"
        footer={null}
        closable={false}
        onCancel={this.props.onCancel}
      >
        <div className="pwd-confrim-wrapper">
          {this.renderCreation()}
          <footer className="modal-footer">
            <Button type="ghost" onClick={this.props.onCancel}>{t(messages.cancel)}</Button>
            <Button
              type="primary"
              onClick={this.handleConfirm}
              loading={this.isCreating}
              disabled={this.formState.hasError}
            >{t(messages.create)}</Button>
          </footer>
        </div>
      </Modal>
    )
  }
}

export default function CreationModal(props: IModalProps<ISubAccountCreateResult>) {
  const subAccountApis = useInjection(SubAccountApis)
  const toasterStore = useInjection(ToasterStore)
  const i18n = useInjection(I18nStore)

  return (
    <CreationModalInner
      {...props}
      i18n={i18n}
      subAccountApis={subAccountApis}
      toasterStore={toasterStore}
    />
  )
}
