/*
 * @file IP 黑白名单配置
 * @author yncst <yncst@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import Input from 'react-icecream/lib/input'
import Radio from 'react-icecream/lib/radio'
import { bindRadioGroup, bindSwitch, bindTextArea } from 'portal-base/common/form'

import { splitLines, trimAndFilter } from 'cdn/transforms'

import {
  isEnabled,
  humanizeIpACLType,
  validateIpACLValues,
  ipACLValueInputTips
} from 'cdn/transforms/domain/ip-acl'

import { ipACLTypes } from 'cdn/constants/domain'

import Switch from '../common/Switch'
import Error from '../common/Error'

import './style.less'

export interface IIpACLConfig {
  ipACLType: string
  ipACLValues: string[]
}

export function getDefaultIpACLConfig(): IIpACLConfig {
  return {
    ipACLType: ipACLTypes.empty,
    ipACLValues: []
  }
}

export type State = ReturnType<typeof createState>

export type Value = IIpACLConfig

export function createState(conf: IIpACLConfig) {
  const enabled = new FieldState(isEnabled(conf))
  const ipACLType = new FieldState(enabled.value ? conf.ipACLType : ipACLTypes.white)
  const ipACLValues = ipACLValuesToIpACLValueForDisplay(conf.ipACLValues)

  return new FormState({
    enabled,
    config: new FormState({
      ipACLType,
      whiteACLValues: new FieldState(conf.ipACLType === ipACLTypes.white ? ipACLValues : '').validators(
        v => validateIpACLValues(ipACLValueForDisplayToIpACLValues(v))
      ).disableValidationWhen(() => ipACLType.value !== ipACLTypes.white),
      blackACLValues: new FieldState(conf.ipACLType === ipACLTypes.black ? ipACLValues : '').validators(
        v => validateIpACLValues(ipACLValueForDisplayToIpACLValues(v))
      ).disableValidationWhen(() => ipACLType.value !== ipACLTypes.black)
    }).disableValidationWhen(() => !enabled.value)
  })
}

export function getValue(state: State): Value {
  if (!state.value.enabled) {
    return {
      ipACLType: ipACLTypes.empty,
      ipACLValues: []
    }
  }

  const ipACLType = state.value.config.ipACLType
  const ipACLValues = ipACLType === ipACLTypes.white
    ? state.value.config.whiteACLValues
    : state.value.config.blackACLValues

  return {
    ipACLType,
    ipACLValues: trimAndFilter(ipACLValueForDisplayToIpACLValues(ipACLValues))
  }
}

const radios = [ipACLTypes.white, ipACLTypes.black].map(
  ipACLType => <Radio key={ipACLType} value={ipACLType} >{humanizeIpACLType(ipACLType)}</Radio>
)

const ipACLActionNamesMap = {
  [ipACLTypes.black]: {
    action: '禁止',
    ruleText: '落在黑名单'
  },
  [ipACLTypes.white]: {
    action: '允许通过',
    ruleText: '不在白名单'
  }
}

const IpACLConfigInput = observer(function _IpACLConfigInput({ state }: { state: State }) {
  if (!state.value.enabled) {
    return null
  }

  const ipACLType = state.value.config.ipACLType

  const ipACLValuesFieldState = ipACLType === ipACLTypes.black
    ? state.$.config.$.blackACLValues
    : state.$.config.$.whiteACLValues

  return (
    <div>
      <div className="line">
        <Radio.Group {...bindRadioGroup(state.$.config.$.ipACLType)}>
          {radios}
        </Radio.Group>
      </div>
      <div className="line help">
        <ul className="ip-acl-value-rules">
          <li>请在下面文本框中填入你想要{ipACLActionNamesMap[ipACLType].action}的 IP 或网段，每行为一个 IP 或网段；</li>
          <li>当请求的客户端出口 IP {ipACLActionNamesMap[ipACLType].ruleText}中时，CDN 服务将会响应禁止访问的状态码（403）；</li>
          { /* eslint-disable-next-line max-len */ }
          <li>网段可以用来描述一个 IP 区间，含义为：例如 127.0.0.1/24，其中 24 表示采用子网掩码中的前 24 位为有效位，即 2 进制的 IP 地址中，前 32 位有效，后 8 位表达了该网段的范围。故 127.0.0.1/24 表示 IP 网段范围是：127.0.0.1~127.0.0.255。目前仅支持 &quot;/8&quot;，&quot;/16&quot;，&quot;/24&quot; 三种。</li>
        </ul>
      </div>
      <div className="line">
        <div className="text-input-wrapper">
          <p>{ipACLValueInputTips(getValue(state).ipACLValues.length)}</p>
          <Input.TextArea
            autosize={{ minRows: 5, maxRows: 10 }}
            placeholder="请输入公网 IP 或网段"
            {...bindTextArea(ipACLValuesFieldState)}
          />
        </div>
        <Error error={state.$.config.error} />
      </div>
    </div>
  )
})

export interface Props {
  state: State
}

export default observer(function DomainIpACLConfigInputWrapper({ state }: Props) {
  return (
    <div className="ip-acl-config-input-wrapper">
      <div className="line">
        <Switch {...bindSwitch(state.$.enabled)} />
      </div>
      <IpACLConfigInput state={state} />
    </div>
  )
})

function ipACLValuesToIpACLValueForDisplay(ipACLValues: string[]): string {
  return ipACLValues.join('\n')
}

function ipACLValueForDisplayToIpACLValues(ipACLValueForDisplay: string): string[] {
  return splitLines(ipACLValueForDisplay)
}
