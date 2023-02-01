/**
 * @file 基本信息页面
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'

import Spin from 'react-icecream/lib/spin'
import Card from 'react-icecream/lib/card'
import Input from 'react-icecream/lib/input'
import Form from 'react-icecream/lib/form'
import Button from 'react-icecream/lib/button'
import { useLocalStore } from 'portal-base/common/utils/store'
import { bindFormItem, bindTextInput } from 'portal-base/common/form'

import LocalStore from './store'

import './style.less'

const messages = {
  nickname: {
    cn: '昵称',
    en: 'Nickname'
  },
  address: {
    cn: '联系地址',
    en: 'Address'
  },
  im: {
    cn: 'QQ',
    en: 'QQ'
  },
  update: {
    cn: '确定',
    en: 'Update'
  }
}

interface ProfileInnerProps {
  store: LocalStore
}

@observer
class ProfileInner extends React.Component<ProfileInnerProps> {

  @autobind
  onConfirm() {
    const { userState, updateProfile } = this.props.store
    userState.validate()
      .then(res => {
        if (res.hasError) {
          return
        }
        updateProfile()
      })
  }

  render() {
    const store = this.props.store
    const { userState } = store
    const formLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 8 }
    }

    const t = store.i18n.t

    return (
      <Card className="comp-profile" bordered={false}>
        <Spin spinning={store.isLoadingProfile}>
          <Form {...formLayout}>
            <Form.Item label={t(messages.nickname)} {...bindFormItem(userState.$.nickname)}>
              <Input {...bindTextInput(userState.$.nickname)} />
            </Form.Item>
            <Form.Item label={t(messages.address)} {...bindFormItem(userState.$.address)}>
              <Input {...bindTextInput(userState.$.address)} />
            </Form.Item>
            <Form.Item label={t(messages.im)} {...bindFormItem(userState.$.im)}>
              <Input {...bindTextInput(userState.$.im)} />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 2 }}>
              <Button onClick={this.onConfirm} type="primary">{t(messages.update)}</Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    )
  }
}

export default function Profile() {
  const store = useLocalStore(LocalStore)

  return (
    <ProfileInner store={store} />
  )
}
