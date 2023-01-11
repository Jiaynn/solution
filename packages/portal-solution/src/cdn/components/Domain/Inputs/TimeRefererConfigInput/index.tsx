/**
 * @file Domain Time Referer Config
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'
import Form, { FormProps } from 'react-icecream/lib/form'
import Row from 'react-icecream/lib/row'
import Col from 'react-icecream/lib/col'
import Input from 'react-icecream/lib/input'
import Button from 'react-icecream/lib/button'
import { bindSwitch, bindTextInput, bindFormItem } from 'portal-base/common/form'

import { isEnabled } from 'cdn/transforms/domain/bs-auth'

import timeRefererDoc from 'cdn/docs/time-referer.pdf'

import Link from 'cdn/components/common/Link/LegacyLink'
import HelpLink from 'cdn/components/common/HelpLink'

import { IDomainDetail } from 'cdn/apis/domain'

import Switch from '../common/Switch'

import LocalStore, { State } from './store'

import './style.less'

export { State, createState, getValue } from './store'

export interface ITimeRefererConfig {
  timeACL: boolean
  timeACLKeys: string[]
  checkUrl: string
}

export function getDefaultTimeRefererConfig(): ITimeRefererConfig {
  return {
    timeACL: false,
    timeACLKeys: ['', ''],
    checkUrl: ''
  }
}

export interface IProps {
  domain: IDomainDetail
  state: State
  onEditBsAuth?: () => void
}

const normalFormLayout: FormProps = {
  colon: false,
  labelCol: {
    span: 3
  },
  wrapperCol: {
    span: 21
  }
}

const keyItemProps: FormProps = {
  colon: false,
  labelAlign: 'left',
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 19
  }
}

const KeyContent = observer(function KeyContent({ store }: { store: LocalStore }) {
  const { timeACLKey1, timeACLKey2 } = store.props.state.$
  return (
    <div className="key-content">
      <Form.Item label="主要 KEY" {...keyItemProps} {...bindFormItem(timeACLKey1)}>
        <div className="key-row">
          <Input placeholder="请输入 24-40 位小写字母和数字组成的字符串" {...bindTextInput(timeACLKey1)} />
          <div className="key-row-action">
            <Button type="link" disabled={!timeACLKey1.value} onClick={() => store.copyKey(timeACLKey1.value)}>复制</Button>
          </div>
        </div>
      </Form.Item>
      <Form.Item label="备用 KEY" {...keyItemProps} {...bindFormItem(timeACLKey2)}>
        <div className="key-row">
          <Input placeholder="请输入 24-40 位小写字母和数字组成的字符串" {...bindTextInput(timeACLKey2)} />
          <div className="key-row-action">
            <Button type="link" disabled={!timeACLKey2.value} onClick={() => store.copyKey(timeACLKey2.value)}>复制</Button>
          </div>
        </div>
      </Form.Item>
      <Row className="key-operation">
        <Col offset={4} >
          <Button type="primary" onClick={store.generateKeys}>随机生成</Button>
        </Col>
      </Row>
    </div>
  )
})

export default observer(function DomainTimeRefererConfigInput(props: IProps) {
  const { domain, state } = props
  const store = useLocalStore(LocalStore, props)

  const shouldDisableSwitch = isEnabled(domain.bsauth) && !state.$.timeACL.value
  const tipForDisable = (
    shouldDisableSwitch
      ? <>此功能已禁用，时间戳防盗链和回源鉴权功能不能同时开启，如果要使用该功能请先关闭<Link onClick={props.onEditBsAuth}>回源鉴权</Link></>
      : null
  )

  const timeRefererUsageTip = (
    <div className="time-referer-tip">
      <h4 className="time-referer-tip-title">配置并开启防盗链之前，请参考以下说明：</h4>
      <span className="time-referer-tip-desc">
        请将生成的两组可用的 key 配置到您的源站服务，具体配置方式及时间戳防盗链生成规则请按照文档进行操作，点击进入
        <HelpLink oemHref={timeRefererDoc} href="https://developer.qiniu.com/fusion/kb/1670/timestamp-hotlinking-prevention">时间戳防盗链文档</HelpLink>。
        开启后 CDN 将自动忽略 t、sign 参数缓存，无需重复配置。
      </span>
    </div>
  )

  const checkUrlErrorTip = state.$.checkUrl.hasError && (
    <>
      您可以查看 <HelpLink oemHref={timeRefererDoc} href="https://developer.qiniu.com/fusion/kb/1670/timestamp-hotlinking-prevention">时间戳防盗链</HelpLink> 文档进行配置，
      或使用 <HelpLink oemHref="https://codesandbox.io/s/time-referer-demo-j011v" href="https://codesandbox.io/s/qiniu-time-referer-demo-trnw9">时间戳计算器</HelpLink> 校验配置是否正确
    </>
  )

  const { timeACL, checkUrl } = state.$

  return (
    <div className="comp-time-referer-config">
      {timeRefererUsageTip}
      <Form {...normalFormLayout} labelAlign="left">
        <Form.Item label="当前状态" extra={tipForDisable} >
          <Switch disabled={shouldDisableSwitch} {...bindSwitch(timeACL)} />
        </Form.Item>
        {
          timeACL.value && (
            <>
              <Form.Item label="KEY" extra={<KeyContent store={store} />}>
                <span>您可以手动输入 KEY，也可以点击下方随机生成按钮，随机生成 KEY</span>
              </Form.Item>
              <Form.Item className="check-url" {...bindFormItem(checkUrl)} label="校验时间戳防盗链" extra={checkUrlErrorTip} >
                <Input placeholder="请输入您生成的时间戳防盗链 URL 进行校验" {...bindTextInput(checkUrl)} />
              </Form.Item>
            </>
          )
        }
      </Form>
    </div>
  )
})
