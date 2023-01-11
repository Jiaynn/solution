/**
 * @file Source URL Schema Input
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Radio from 'react-icecream/lib/radio'
import { bindRadioGroup } from 'portal-base/common/form'

import { humanizeSourceURLScheme } from 'cdn/transforms/domain'

import { SourceURLScheme } from 'cdn/constants/domain'

import TipIcon from 'cdn/components/TipIcon'

export type State = FieldState<SourceURLScheme>

export function createState(scheme: SourceURLScheme): State {
  return new FieldState(scheme)
}

export type Value = SourceURLScheme

export interface Props {
  state: State
}

export default observer(function DomainSourceURLSchemeInput({ state }: Props) {
  const radios = [
    SourceURLScheme.Http,
    SourceURLScheme.Follow,
    SourceURLScheme.Https
  ].map(
    sourceURLScheme => {
      const label = humanizeSourceURLScheme(sourceURLScheme)
      return (
        <Radio key={sourceURLScheme} value={sourceURLScheme}>{label}</Radio>
      )
    }
  )

  return (
    <div className="line domain-source-url-scheme-input-wrapper">
      <span className="sub-input-label">
        回源协议&nbsp;<TipIcon tip={<SourceURLSchemaTip />} />
      </span>
      <Radio.Group {...bindRadioGroup(state)}>{radios}</Radio.Group>
    </div>
  )
})

function SourceURLSchemaTip() {
  return (
    <>
      回源协议即请求回源的协议。<br />
      1. HTTP 请求即 HTTP 回源。源站测试时会对 HTTP 请求进行可用性测试；<br />
      2. HTTPS 请求即 HTTPS 回源。源站测试时会对 HTTPS 请求进行可用性测试；<br />
      3. 遵循请求协议可自适应请求协议，遵循请求协议源站测试时会同时对 HTTP/HTTPS 请求进行可用性测试；
    </>
  )
}
