/**
 * @file Source Host Input
 * @author nighca <nighca@live.cn>
 */

import React, { ReactNode } from 'react'
import { observer } from 'mobx-react'
import { FieldState, bindInput } from 'formstate-x'
import Input from 'react-icecream/lib/input'
import Radio, { RadioChangeEvent } from 'react-icecream/lib/radio'

import { humanizeSourceHostConfigOptionTextMap, sourceHostForm2Api } from 'cdn/transforms/domain/source'

import { textPattern } from 'cdn/transforms/form'

import { SourceHostConfigType, SourceType } from 'cdn/constants/domain'
import { hostname } from 'cdn/constants/pattern'

import TipIcon from 'cdn/components/TipIcon'

import { IDomainDetail } from 'cdn/apis/domain'

import Error from '../common/Error'

import './style.less'

export interface ISourceHost {
  type: SourceHostConfigType
  domainValue: string
  sourceValue: string
  customValue: string
}

export type Value = ISourceHost

export type State = FieldState<ISourceHost>

function validateSourceHost(sourceHost: ISourceHost) {
  const host = sourceHostForm2Api(sourceHost)

  if (sourceHost.type === SourceHostConfigType.Custom) {
    return host
      ? textPattern(hostname)(host, '请正确填写回源 HOST')
      : '回源 HOST 不能为空'
  }

  if (!host) {
    return '回源 HOST 不能为空'
  }

  return null
}

export function createState(
  source: ISourceHost
): State {
  return new FieldState({
    type: source.type,
    domainValue: source.domainValue,
    sourceValue: source.sourceValue,
    customValue: source.customValue
  }).validators(
    val => validateSourceHost(val)
  )
}

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  domains?: IDomainDetail[]
  state: State
}

export default observer(function DomainSourceHostInputWrapper(props: Props) {
  return (
    <DomainSourceHostInput
      domains={props.domains}
      error={props.state.error}
      {...bindInput(props.state)}
    />
  )
})

export interface IDomainSourceHostInputProps {
  domains?: IDomainDetail[]
  value: ISourceHost
  error?: string
  onChange: (value: ISourceHost) => void
}

function DomainSourceHostInput({ domains, value, onChange, error }: IDomainSourceHostInputProps) {
  const { sourceDomain, sourceType } = domains?.[0].source ?? { sourceDomain: undefined, sourceType: undefined }
  const domainNames = (domains || []).map(domain => domain.name).filter(name => !!name)

  function handleHostTypeChange(sourceHostType: SourceHostConfigType) {
    if (sourceHostType === SourceHostConfigType.Domain) {
      onChange({ ...value, type: sourceHostType, domainValue: domainNames.length > 0 ? domainNames[0] : null! })
      return
    }
    if (sourceHostType === SourceHostConfigType.Source) {
      if (sourceType === SourceType.Domain) {
        onChange({ ...value, type: sourceHostType, sourceValue: sourceDomain! })
      }
      return
    }
    onChange({ ...value, type: sourceHostType })
  }

  let sourceHostInput: ReactNode = null

  switch (value.type) {
    case SourceHostConfigType.Domain:
    case SourceHostConfigType.Source:
      // 回源 HOST 类型选择加速域名、源站域名的时候，不需要把加速域名、源站域名显示出来。
      sourceHostInput = null
      break
    case SourceHostConfigType.Custom:
      sourceHostInput = (
        <Input
          placeholder="请输入自定义回源 HOST"
          value={value.customValue}
          onChange={e => {
            const customValue = e.target.value.trim()
            onChange({ ...value, customValue })
          }}
        />
      )
      break
    default:
      sourceHostInput = null
  }

  return (
    <div className="line domain-source-host-input-wrapper">
      <div className="line">
        <span className="sub-input-label">
          回源 HOST&nbsp;<TipIcon tip="如果回源 HOST 非加速域名和源站域名请选择自定义填写；若没有特殊回源 HOST，请选择加速域名或者源站域名。" />
        </span>
        <SourceHostTypeSelect
          value={value.type}
          sourceType={sourceType as SourceType}
          onChange={handleHostTypeChange}
        />
      </div>
      {
        sourceHostInput && (
          <div style={{ marginLeft: '140px' }} className="line text-input-wrapper">
            {sourceHostInput}
            <Error error={error} />
          </div>
        )
      }
    </div>
  )
}

export interface ISourceHostTypeSelectProps {
  sourceType: SourceType
  value: SourceHostConfigType
  onChange: (value: SourceHostConfigType) => void
}

export function SourceHostTypeSelect({ value, sourceType, onChange }: ISourceHostTypeSelectProps) {
  const sourceHostConfigTypeList = [SourceHostConfigType.Domain]
  if (sourceType === SourceType.Domain) {
    sourceHostConfigTypeList.push(SourceHostConfigType.Source)
  }

  sourceHostConfigTypeList.push(SourceHostConfigType.Custom)

  return (
    <Radio.Group value={value} onChange={(e: RadioChangeEvent) => onChange(e.target.value)}>
      {
        sourceHostConfigTypeList.map(configType => (
          <Radio
            key={configType}
            value={configType}
          >
            {humanizeSourceHostConfigOptionTextMap(configType, sourceType)}
          </Radio>
        ))
      }
    </Radio.Group>
  )
}

export function getDefaultSourceHost(): ISourceHost {
  return {
    type: SourceHostConfigType.Domain,
    domainValue: '',
    sourceValue: '',
    customValue: ''
  }
}
