/**
 * @file Input for domain ipTypes
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React, { ReactNode } from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Radio from 'react-icecream/lib/radio'
import { bindRadioGroup } from 'portal-base/common/form'

import { humanizeIpTypes } from 'cdn/transforms/domain'

import { GeoCover, IpTypes, ipTypesValues } from 'cdn/constants/domain'

import './style.less'

export type State = FieldState<IpTypes>

export type Value = IpTypes

export function createState(ipTypes?: IpTypes): State {
  return new FieldState(ipTypes == null ? IpTypes.IPv6 : ipTypes)
}

export interface Props {
  state: State
  geoCover: GeoCover
}

export default observer(function DomainIpTypesInput(props: Props) {
  const { state, geoCover } = props
  const validIpTypesValues = geoCover === GeoCover.Foreign
    ? ipTypesValues.filter(it => it !== IpTypes.IPv6)
    : ipTypesValues
  const radios = validIpTypesValues.map(
    ipTypes => <Radio key={ipTypes} value={ipTypes}>{humanizeIpTypes(ipTypes)}</Radio>
  )

  let helpBlock: ReactNode

  if (state.value === IpTypes.IPv6 && geoCover === GeoCover.Global) {
    helpBlock = <p className="line help">中国大陆支持 IPv4 / IPv6 双协议访问，海外节点仅支持 IPv4 访问</p>
  } else if (state.value === IpTypes.IPv4 && geoCover === GeoCover.Foreign) {
    helpBlock = <p className="line help">海外节点暂不支持 IPv6 请求</p>
  }

  return (
    <div className="domain-iptypes-input-wrapper">
      <div className="line">
        <Radio.Group {...bindRadioGroup(state)}>
          {radios}
        </Radio.Group>
      </div>
      {helpBlock}
    </div>
  )
})
