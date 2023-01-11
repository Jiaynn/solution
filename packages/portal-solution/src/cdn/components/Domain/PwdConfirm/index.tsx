/*
 * @file 带有密码验证的 Modal 弹出框
 * @author gaoupon <gaopeng01@qiniu.com>
 */

import React, { ChangeEvent } from 'react'
import { action, observable, computed, when, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { injectProps } from 'qn-fe-core/local-store'
import { makeCancelled } from 'qn-fe-core/exception'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { ToasterStore } from 'portal-base/common/toaster'
import { UserInfoStore } from 'portal-base/user/account'
import { Loadings } from 'portal-base/common/loading'
import { useLocalStore } from 'portal-base/common/utils/store'
import { VerificationApis } from 'portal-base/user/verification'
import { IamApis } from 'portal-base/user/iam'
import { I18nStore } from 'portal-base/common/i18n'

import Input from 'react-icecream/lib/input'
import LightBox from 'react-icecream/lib/modal'
import Button from 'react-icecream/lib/button'
import Icon from 'react-icecream/lib/icon'
import Form from 'react-icecream/lib/form'

import * as messages from './messages'

import './style.less'

const FormItem = Form.Item

export interface IPwdConfirmProps {
  content?: string
  zIndex?: number
  visible: boolean
  onCancel: () => any
  onConfirm: () => any
}

@injectable()
class LocalStore extends Store {
  loadings = new Loadings('verify.password')
  @observable password = ''

  constructor(
    @injectProps() private props: IPwdConfirmProps,
    private userInfoStore: UserInfoStore,
    private iamApis: IamApis,
    private verificationApis: VerificationApis,
    public i18n: I18nStore
  ) {
    super()
  }

  @computed
  get isVerifingPwd() {
    return this.loadings.isLoading('verify.password')
  }

  @action
  updatePassword(pwd: string) {
    this.password = pwd
  }

  @autobind
  verifyIamPassword(password: string) {
    return this.iamApis.verifyIamPassword(password).then(({ valid }) => {
      if (!valid) {
        return Promise.reject(new Error(this.i18n.t(messages.passwordIncorrect)))
      }
    })
  }

  @autobind
  verifyNormalPassword(password: string) {
    return this.verificationApis.password(password)
  }

  @ToasterStore.handle()
  verifyPassword(password: string) {
    // 若为 iam 用户，则要请求 iam 用户密码验证的接口
    const verifyApi = this.userInfoStore.isIamUser ? this.verifyIamPassword : this.verifyNormalPassword
    const req = verifyApi(password).then(() => {
      this.props.onConfirm()
      this.updatePassword('')
    })
    return this.loadings.promise('verify.password', req)
  }
}

interface IPwdConfirmPropsWithDeps extends IPwdConfirmProps {
  store: LocalStore
}

@observer
class PwdConfirmInner extends React.Component<IPwdConfirmPropsWithDeps> {

  @autobind
  handlePwdChange(e: ChangeEvent<HTMLInputElement>) {
    this.props.store.updatePassword(e.target.value)
  }

  @autobind
  handleCancelConfirm() {
    this.props.store.updatePassword('')
    this.props.onCancel()
  }

  @autobind
  handleConfirm() {
    this.props.store.verifyPassword(this.props.store.password)
  }

  render() {
    const t = this.props.store.i18n.t

    return (
      <LightBox
        title={t(messages.passwordAuth)}
        visible={this.props.visible}
        width="60%"
        footer={null}
        onCancel={this.handleCancelConfirm}
        zIndex={this.props.zIndex}
      >
        <div className="pwd-confrim-wrapper">
          <p className="confirm-content">
            <Icon className="confirm-icon" type="exclamation-circle" />
            {this.props.content || t(messages.entryPassword)}
          </p>
          <Form>
            <FormItem>
              <Input
                autoComplete="off"
                className="pwd-input"
                size="default" // TODO: 不知道为什么默认的 size 是 large，好像是 icecream 的 bug
                placeholder={t(messages.entryPassword)}
                name="pwd-input"
                type="password"
                value={this.props.store.password}
                onChange={this.handlePwdChange}
              />
            </FormItem>
          </Form>
          <footer className="modal-footer">
            <Button type="ghost" onClick={this.handleCancelConfirm}>{t(messages.cancel)}</Button>
            <Button
              type="primary"
              onClick={this.handleConfirm}
              loading={this.props.store.isVerifingPwd}
            >{t(messages.ok)}</Button>
          </footer>
        </div>
      </LightBox>
    )
  }
}

export default function PwdConfirm(props: IPwdConfirmProps) {
  const store = useLocalStore(LocalStore, props)

  return (
    <PwdConfirmInner store={store} {...props} />
  )
}

const pwdConfirmStatuses = {
  none: -1,
  started: 0,
  confirmed: 1,
  cancelled: 2
}

export class PwdConfirmStore extends Store {
  @observable currentId = 0
  @observable content = ''
  @observable status = pwdConfirmStatuses.none

  constructor() {
    super()
    makeObservable(this)
  }

  @action start(
    id: number,
    content: string
  ) {
    this.currentId = id
    this.content = content
    this.status = pwdConfirmStatuses.started
  }

  @action.bound cancel() {
    this.status = pwdConfirmStatuses.cancelled
  }

  @action.bound confirm() {
    this.status = pwdConfirmStatuses.confirmed
  }

  bind() {
    return {
      content: this.content,
      visible: this.status === pwdConfirmStatuses.started,
      onCancel: this.cancel,
      onConfirm: this.confirm
    }
  }

  open(content?: string) {
    const id = this.currentId + 1

    this.start(id, content!)

    return new Promise<void>((resolve, reject) => this.addDisposer(when(
      () => (
        this.currentId === id
        && this.status > pwdConfirmStatuses.started
      ),
      () => (
        this.status === pwdConfirmStatuses.cancelled
        ? reject(makeCancelled())
        : resolve()
      )
    )))
  }
}
