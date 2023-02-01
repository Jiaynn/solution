/**
 * @file 子账户管理页面
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'
import autobind from 'autobind-decorator'

import Modal from 'react-icecream/lib/modal'
import Spin from 'react-icecream/lib/spin'
import Button from 'react-icecream/lib/button'
import Table from 'react-icecream/lib/table'
import Tag from 'react-icecream/lib/tag'
import Card from 'react-icecream/lib/card'
import { ToasterStore } from 'portal-base/common/toaster'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'portal-base/common/utils/store'
import { I18nStore } from 'portal-base/common/i18n'

import { ModalStore } from 'cdn/stores/modal'

import { noMore, loadMore } from 'cdn/locales/messages'

import { SubAccountStatus, subAccountStatusTextMap, ISubAccountCreateResult } from 'cdn/constants/oem'

import PwdConfirm, { PwdConfirmStore } from 'cdn/components/Domain/PwdConfirm'

import { ISubAccount } from 'cdn/apis/oem/sub-account'

import CreationModal from './CreationModal'
import CreationResultModal, { IExtraProps as ICreationResultExtraProps } from './CreationResultModal'
import SearchBar from './SearchBar'
import * as commonMessages from './messages'
import LocalStore from './store'

import './style.less'

const messages = {
  ...commonMessages,
  noMore,
  loadMore,
  resetPassword: {
    cn: '重制密码',
    en: 'Reset password'
  },
  emulateLogin: {
    cn: '模拟登录',
    en: 'Emulate login'
  },
  copyPassword: {
    cn: '请复制密码',
    en: 'Please copy the password.'
  },
  createAccount: {
    cn: '创建子账号',
    en: 'Create new user'
  },
  confirmResetPassword: {
    cn: (email: string) => `确定要重置子账户 ${email} 的密码吗？`,
    en: (email: string) => `Are you sure you want to reset the password of the sub account ${email}?`
  }
}

export interface IResetPasswordResp {
  download_id: string
  result: [{
    email: string
    password: string
  }]
}

interface ISubAccountInnerProps {
  i18n: I18nStore
  toasterStore: ToasterStore
  store: LocalStore
}

@observer
class SubAccountInner extends React.Component<ISubAccountInnerProps> {

  pwdConfirmStore = new PwdConfirmStore()
  creationStore = new ModalStore<{}, ISubAccountCreateResult>()
  creationResultStore = new ModalStore<ICreationResultExtraProps>()

  constructor(props: ISubAccountInnerProps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @autobind
  @ToasterStore.handle()
  openCreationModal() {
    const store = this.props.store
    return this.creationStore.open()
      .then(
        (result: ISubAccountCreateResult) => this.creationResultStore.open({ value: result, i18n: this.props.i18n })
      )
      .then(() => {
        store.fetchSubAccounts()
      })
  }

  @autobind
  openResetPasswordModal(email: string) {
    const store = this.props.store
    const t = this.props.i18n.t
    return this.pwdConfirmStore.open(t(messages.confirmResetPassword, email))
      .then(() => store.resetPassword(email))
      .then((resp: IResetPasswordResp) => {
        if (resp.result && resp.result.length) {
          Modal.success({
            title: t(messages.copyPassword),
            content: resp.result[0].password
          })
        }
      })
  }

  @autobind
  renderSubAccountStatus(account: ISubAccount) {
    const store = this.props.store
    const t = this.props.i18n.t
    let status: JSX.Element | null = null

    if (account.state === SubAccountStatus.UnFreeze) {
      status = <Tag className="tag" color="green3" onClick={() => store.freezeSubAccount(account.uid)}>{t(subAccountStatusTextMap[account.state])}</Tag>
    } else {
      status = account.state === SubAccountStatus.Freeze
        ? <Tag className="tag" color="red3" onClick={() => store.unfreezeSubAccount(account.uid)}>{t(subAccountStatusTextMap[account.state])}</Tag>
        : null
    }

    return (
      <>
        {status}
        <span className="status-time">({moment(account.modifyAt).format('YYYY-MM-DD hh:mm:ss')})</span>
      </>
    )
  }

  @autobind
  renderSubAccountOperations(account: ISubAccount) {
    const t = this.props.i18n.t

    return (
      <>
        <a onClick={() => this.openResetPasswordModal(account.email)} className="op-item">{t(messages.resetPassword)}</a>
        <a onClick={() => this.props.store.proxySubAccount(account.email)} className="op-item">{t(messages.emulateLogin)}</a>
      </>
    )
  }

  @computed get columns() {
    const t = this.props.i18n.t

    return [
      {
        title: t(messages.username),
        dataIndex: 'name'
      },
      {
        title: t(messages.email),
        dataIndex: 'email'
      },
      {
        title: t(messages.state),
        key: 'status',
        render: this.renderSubAccountStatus
      },
      {
        title: t(messages.operation),
        key: 'operation',
        render: this.renderSubAccountOperations
      }
    ]
  }

  componentWillUnmount() {
    this.creationStore.dispose()
    this.pwdConfirmStore.dispose()
    this.creationResultStore.dispose()
  }

  render() {
    const store = this.props.store
    const t = this.props.i18n.t

    return (
      <Card className="sub-account-wrapper" bordered={false}>
        <Spin spinning={store.isLoadingSubAccounts}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={this.openCreationModal} type="primary" ghost>+ {t(messages.createAccount)}</Button>
            <SearchBar state={store.searchState} />
          </div>
          <Table pagination={false} rowKey="email" columns={this.columns} dataSource={store.subAccounts} />
          <div className="load-more">
            <Button
              className="load-more-btn"
              loading={store.isLoadingSubAccounts}
              disabled={store.hasNoMoreSubAccounts}
              onClick={store.loadMoreSubAccounts}
            >
              {store.hasNoMoreSubAccounts ? t(messages.noMore) : t(messages.loadMore)}
            </Button>
          </div>
        </Spin>
        <PwdConfirm {...this.pwdConfirmStore.bind()} />
        <CreationModal {...this.creationStore.bind()} />
        <CreationResultModal {...this.creationResultStore.bind()} i18n={this.props.i18n} />
      </Card>
    )
  }
}

export default function SubAccount() {
  const toasterStore = useInjection(ToasterStore)
  const store = useLocalStore(LocalStore)
  const i18n = useInjection(I18nStore)

  return (
    <SubAccountInner store={store} toasterStore={toasterStore} i18n={i18n} />
  )
}
