/**
 * @file Input for domain protocol & cert
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, bindInput } from 'formstate-x'
import Radio from 'react-icecream/lib/radio'

import { humanizeProtocol } from 'cdn/transforms/domain'

import { Protocol, protocolValues } from 'cdn/constants/domain'

import TipIcon from 'cdn/components/TipIcon'
import HelpLink from 'cdn/components/common/HelpLink'
import OEMDisabled from 'cdn/components/common/OEMDisabled'

import { IDomainDetail } from 'cdn/apis/domain'

import ForceHTTPSInput from '../ForceHttpsInput'
import DomainCertInput from '../../CertInput'
import HTTP2Input from '../Http2Input'

import './style.less'

export interface IHttpsConfig {
  protocol: Protocol
  certId: string
  forceHttps: boolean
  http2Enable: boolean
}

export function getDefaultHttpsConfig(): IHttpsConfig {
  return {
    protocol: Protocol.Http,
    certId: null!,
    forceHttps: false,
    http2Enable: false
  }
}

export function createState(conf: IHttpsConfig) {
  return new FieldState(conf).validators(v => {
    if (v.protocol === Protocol.Https && !v.certId) {
      return '请选择证书'
    }
  })
}

export type State = ReturnType<typeof createState>

export type Value = IHttpsConfig

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  state: State
  domain: IDomainDetail
  canSwitchProtocol: boolean
  uid?: number
}

export default observer(function HttpsConfigForCreateInputWrapper(props: Props) {
  const { state, ...restProps } = props

  return (
    <HttpsConfigForCreateInput
      {...bindInput(state)}
      error={state.error}
      {...restProps}
    />
  )
})

export interface IHttpsConfigForCreateInputProps {
  domain: IDomainDetail
  canSwitchProtocol: boolean
  uid?: number
  value: IHttpsConfig
  error: any
  onChange: (value: IHttpsConfig) => void
}

@observer
class HttpsConfigForCreateInput extends React.Component<
  IHttpsConfigForCreateInputProps,
  {}
> {
  render() {
    const { domain, canSwitchProtocol, uid, value, error, onChange } = this.props
    const { protocol, certId, forceHttps, http2Enable } = value

    const protocolView = canSwitchProtocol
    ? (
      <div className="line">
        <ProtocolInput
          value={protocol}
          onChange={newProtocol => onChange({ ...value, protocol: newProtocol })}
        />
      </div>
    )
    : null

    const httpsConfigView = protocol === Protocol.Https
    ? (
      <div className="https-config-input-content">
        <DomainCertInput
          domain={domain.name}
          uid={uid}
          value={certId}
          error={error}
          onChange={newCertId => {
            // 当选择了可用的 HTTPS 证书之后，HTTP/2 开关按钮换至「开启」模式
            onChange({ ...value, http2Enable: true, certId: newCertId })
          }}
        />
        {
          !!certId && (
            <>
              <ForceHTTPSInput
                value={forceHttps}
                onChange={newForceHttps => onChange({ ...value, forceHttps: newForceHttps })}
              />
              <HTTP2Input
                isEnable={!!certId}
                value={http2Enable}
                onChange={enable => onChange({ ...value, http2Enable: enable })}
              />
            </>
          )
        }
      </div>
      )
      : null

    return (
      <div className="https-config-input-wrapper">
        {protocolView}
        {httpsConfigView}
      </div>
    )
  }
}

export function ProtocolInput(props: {
  value: Protocol
  onChange: (value: Protocol) => void
}) {
  const { value, onChange } = props
  const radios = protocolValues.map(protocol => (
    <Radio key={protocol} value={protocol}>
      {humanizeProtocol(protocol)}
    </Radio>
  ))
  return (
    <Radio.Group
      value={value}
      onChange={e => onChange((e.target as any).value)}
    >
      {radios}
    </Radio.Group>
  )
}

export function HttpsConfigInputLabel() {
  const tip = (
    <>
      开启 HTTPS 协议即可实现客户端和 CDN 节点之间请求通过 HTTPS 加密。
      <OEMDisabled>
        具体价格及优惠参考&nbsp;
        <HelpLink href="https://www.qiniu.com/prices/qcdn">CDN 价格</HelpLink>。
      </OEMDisabled>
    </>
  )

  return (
    <>
      通信协议&nbsp;
      <TipIcon tip={tip} />
    </>
  )
}
