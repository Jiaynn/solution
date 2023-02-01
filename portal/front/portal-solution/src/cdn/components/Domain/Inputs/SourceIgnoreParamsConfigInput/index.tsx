/**
 * @file 去参数回源配置
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { computed, makeObservable } from 'mobx'
import autobind from 'autobind-decorator'
import { FieldState, bindInput } from 'formstate-x'
import { observer } from 'mobx-react'
import Input from 'react-icecream/lib/input'
import Radio, { RadioChangeEvent } from 'react-icecream/lib/radio'

import { textNotBlank } from 'cdn/transforms/form'

import { humanizeSourceIgnoreParamsType as humanizeType } from 'cdn/transforms/domain/source'

import { SourceIgnoreParamsType } from 'cdn/constants/domain'

import Switch from '../common/Switch'
import Error from '../common/Error'

import './style.less'

export interface IValue {
  enabled: boolean
  type: string
  params: string
}

export type State = FieldState<IValue>

export function createState(val: IValue = getDefaultValue(), isModify = false): State {
  return new FieldState({
    enabled: val.enabled,
    type: val.type,
    params: val.type === SourceIgnoreParamsType.All ? '' : val.params
  }).validators(v => (
    v.enabled && v.type === SourceIgnoreParamsType.Customize
      ? textNotBlank(v.params)
      : null
  )).disableValidationWhen(() => !isModify)
}

export interface Props {
  state: State
}

export default observer(function SourceIgnoreParamsConfigInput(props: Props) {
  return (
    <SourceIgnoreParamsConfigInputInner
      {...bindInput(props.state)}
      error={props.state.error}
    />
  )
})

export interface ISourceIgnoreParamsConfigInputProps {
  value: IValue
  onChange: (value: IValue) => void
  error: string | undefined
}

export function getDefaultValue(): IValue {
  return {
    enabled: false,
    type: SourceIgnoreParamsType.All,
    params: ''
  }
}

@observer
export class SourceIgnoreParamsConfigInputInner extends React.Component<ISourceIgnoreParamsConfigInputProps> {
  constructor(props: ISourceIgnoreParamsConfigInputProps) {
    super(props)
    makeObservable(this)
  }

  @computed get value() {
    return this.props.value
  }

  @autobind handleEnabledChange(enabled: boolean) {
    this.props.onChange({
      ...this.value,
      enabled
    })
  }

  @autobind handleTypeChange(e: RadioChangeEvent) {
    this.props.onChange({
      ...this.value,
      type: (e.target as any).value
    })
  }

  @autobind handleParamsChange(e: React.FormEvent<any>) {
    const params: string = (e.target as any).value
    this.props.onChange({
      ...this.value,
      params
    })
  }

  @computed get paramsError() {
    return this.props.error
  }

  @computed get paramsView() {
    if (this.value.type === SourceIgnoreParamsType.All) {
      return (
        <p className="line">请求回源时去除 URL「?」后的全部参数进行回源</p>
      )
    }
    return (
      <div>
        <p className="line">请输入参数，每行一个；请求回源时会去除您输入的指定参数然后进行回源</p>
        <div className="line">
          <div className="text-input-wrapper">
            <Input.TextArea
              autosize={{ minRows: 2, maxRows: 5 }}
              placeholder="a&#10;b"
              value={this.value.params}
              onChange={this.handleParamsChange}
            />
          </div>
          <Error error={this.paramsError} />
        </div>
      </div>
    )
  }

  @computed get typeAndParamsView() {
    if (!this.value.enabled) {
      return null
    }
    const typeRadios = [SourceIgnoreParamsType.All, SourceIgnoreParamsType.Customize].map(
      type => <Radio key={type} value={type}>{humanizeType(type)}</Radio>
    )
    return (
      <div>
        <div className="line">
          <Radio.Group
            value={this.value.type}
            onChange={this.handleTypeChange}
          >{typeRadios}</Radio.Group>
        </div>
        {this.paramsView}
      </div>
    )
  }

  render() {
    return (
      <div className="comp-source-ignore-params-config-input">
        <div className="line">
          <span className="sub-input-label">去参数回源</span>
          <Switch
            checked={this.value.enabled}
            onChange={this.handleEnabledChange}
          />
        </div>
        {this.typeAndParamsView}
      </div>
    )
  }
}
