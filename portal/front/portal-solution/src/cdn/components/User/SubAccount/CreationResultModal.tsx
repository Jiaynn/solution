/**
 * @file 显示子账户创建结果
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import Modal from 'react-icecream/lib/modal'
import Icon from 'react-icecream/lib/icon'
import Button from 'react-icecream/lib/button'
import { I18nStore } from 'portal-base/common/i18n'

import { IModalProps } from 'cdn/stores/modal'

import { ISubAccountCreateResult } from 'cdn/constants/oem'

import * as commonMessages from './messages'

const messages = {
  ...commonMessages,
  createSuccessTitle: {
    cn: '创建成功',
    en: 'Create completed'
  },
  createSuccess: {
    cn: '子账号创建成功！',
    en: 'User create completed.'
  },
  confirm: {
    cn: '确定',
    en: 'Done'
  }
}

export interface IExtraProps {
  i18n: I18nStore
  value: ISubAccountCreateResult
}

@observer
export default class CreationResultModal extends React.Component<IExtraProps & IModalProps> {
  render() {
    const { value, i18n } = this.props
    if (!this.props.value) {
      return null
    }
    const t = i18n.t
    const { email, name, password } = value

    return (
      <Modal
        title={t(messages.createSuccessTitle)}
        visible={this.props.visible}
        width="60%"
        closable={false}
        onCancel={this.props.onCancel}
        footer={
          <Button onClick={this.props.onSubmit}>{t(messages.confirm)}</Button>
        }
      >
        <div className="subaccout-creation-wrapper">
          <h3><Icon type="check-circle" style={{ marginRight: '3px' }} />{i18n.t(messages.createSuccess)}</h3>
          <div className="new-subaccount-info">
            <div className="msg-row">
              <span className="label">{t(messages.username)}</span><span className="content">{name}</span>
            </div>
            <div className="msg-row">
              <span className="label">{t(messages.password)}</span><span className="content">{password}</span>
            </div>
            <div className="msg-row">
              <span className="label">{t(messages.email)}</span><span className="content">{email}</span>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}
