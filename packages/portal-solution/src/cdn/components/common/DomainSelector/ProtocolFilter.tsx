/**
 * @file ProtocolFilter Component
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Radio from 'react-icecream/lib/radio'
import { bindRadioGroup } from 'portal-base/common/form'
import { useTranslation } from 'portal-base/common/i18n'

import { Protocol, protocolValues, protocolTextMap } from 'cdn/constants/domain'

import './style.less'

const messages = {
  all: {
    cn: '全部',
    en: 'All'
  },
  protocolFilter: {
    cn: '按协议筛选',
    en: 'Protocol'
  }
}

const allProtocol = 'all' as const

export type Value = Protocol[]
export type State = FieldState<Protocol | typeof allProtocol>

export function createState(): State {
  return new FieldState(allProtocol)
}

export function getValue(state: State): Value {
  return state.value === allProtocol
    ? [Protocol.Http, Protocol.Https]
    : [state.value]
}

interface ProtocolOption {
  label: string
  value: Protocol | typeof allProtocol
}

export interface IProps {
  state: State
}

export default observer(function ProtocolFilter({ state }: IProps) {
  const t = useTranslation()

  const protocolOptions = ([{ label: t(messages.all), value: allProtocol }] as ProtocolOption[])
    .concat(protocolValues.map(
      it => ({ label: protocolTextMap[it], value: it })
    ))

  return (
    <section className="comp-protocol-filter">
      <h4 className="protocol-filter-label">{t(messages.protocolFilter)}</h4>
      <Radio.Group {...bindRadioGroup(state)}>
        {
          protocolOptions.map(it => (
            <Radio key={it.value} value={it.value}>{it.label}</Radio>
          ))
        }
      </Radio.Group>
    </section>
  )
})
