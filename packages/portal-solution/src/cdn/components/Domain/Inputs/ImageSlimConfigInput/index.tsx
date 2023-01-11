/**
 * @file 域名图片瘦身配置
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { assign } from 'lodash'
import { FormState, FieldState } from 'formstate-x'
import autobind from 'autobind-decorator'
import Disposable from 'qn-fe-core/disposable'
import Radio, { RadioChangeEvent } from 'react-icecream/lib/radio'
import Input from 'react-icecream/lib/input'

import { humanizeSlimType } from 'cdn/transforms/domain'
import { deriveSlimTypeFromValue, validatePrefixImageSlims, validateRegexpImageSlims } from 'cdn/transforms/domain/image-slim'
import { ErrorOfMap } from 'cdn/transforms/form'

import { useStateBinding } from 'cdn/hooks/form'

import { slimTypes, slimTypeList } from 'cdn/constants/domain'

import Switch from '../common/Switch'
import Error from '../common/Error'

import './style.less'

export interface IImageSlimConfig {
  enableImageSlim: boolean
  slimType?: number
  prefixImageSlims: string
  regexpImageSlims: string
}

export function getDefaultImageSlimConfig(): IImageSlimConfig {
  return {
    enableImageSlim: false,
    slimType: slimTypes.defaults,
    prefixImageSlims: '',
    regexpImageSlims: ''
  }
}

export interface IDomainImageSlimConfigInputProps {
  value: IImageSlimConfig,
  error: ErrorOfMap<IImageSlimConfig>
  onChange: (value: IImageSlimConfig) => void
}

@observer
class DomainImageSlimConfigInput extends React.Component<IDomainImageSlimConfigInputProps, {}> {

  disposable = new Disposable()

  componentDidMount() {
    // 若传入的 value 中的 slimType 与 value 中其他信息不匹配（外部可能不提供 slimType）
    // 根据 value 更新当前的 slimType
    this.disposable.addDisposer(reaction(
      () => deriveSlimTypeFromValue(this.props.value),
      slimType => {
        const currentValue = this.props.value
        if (slimType !== currentValue.slimType) {
          this.props.onChange({
            ...currentValue,
            slimType
          })
        }
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  @autobind handleEnableImageSlimChange(enableImageSlim: boolean) {
    const { value: imageSlimConfig, onChange } = this.props
    onChange({
      ...imageSlimConfig,
      enableImageSlim
    })
  }

  @autobind handleSlimTypeChange(e: RadioChangeEvent) {
    const { value: imageSlimConfig, onChange } = this.props
    const slimType: number = (e.target as any).value

    const newImageSlimConfig = assign({}, imageSlimConfig, {
      slimType
    })
    if (slimType === slimTypes.prefix) {
      newImageSlimConfig.regexpImageSlims = ''
    }
    if (slimType === slimTypes.regexp) {
      newImageSlimConfig.prefixImageSlims = ''
    }
    onChange(newImageSlimConfig)
  }

  @autobind handlePrefixImageSlimsChange(e: React.FormEvent<any>) {
    const { value: imageSlimConfig, onChange } = this.props
    onChange({
      ...imageSlimConfig,
      prefixImageSlims: (e.target as any).value.trim()
    })
  }

  @autobind handleRegexpImageSlimsChange(e: React.FormEvent<any>) {
    const { value: imageSlimConfig, onChange } = this.props
    onChange({
      ...imageSlimConfig,
      regexpImageSlims: (e.target as any).value.trim()
    })
  }

  getRuleContent() {
    const { value: slimConfig, error } = this.props

    if (slimConfig.slimType === slimTypes.defaults) {
      return (
        <p className="line">该域名下全部 jpg 和 png 将会自动瘦身</p>
      )
    }

    if (slimConfig.slimType === slimTypes.prefix) {
      return (
        <div>
          <div className="line">
            <div className="text-input-wrapper">
              <Input.TextArea
                autosize={{ minRows: 2, maxRows: 5 }}
                placeholder="/a;/b"
                value={slimConfig.prefixImageSlims}
                onChange={this.handlePrefixImageSlimsChange}
              />
            </div>
            <Error error={error && error.prefixImageSlims} />
          </div>
          <p className="line">该域名该路径下的 jpg 和 png 将会自动瘦身，多个路径请用英文分号「;」分隔；</p>
        </div>
      )
    }

    if (slimConfig.slimType === slimTypes.regexp) {
      return (
        <div>
          <div className="line">
            <div className="text-input-wrapper">
              <Input.TextArea
                autosize={{ minRows: 2, maxRows: 5 }}
                placeholder=".*\\.png;.*\\.jpg"
                value={slimConfig.regexpImageSlims}
                onChange={this.handleRegexpImageSlimsChange}
              />
            </div>
            <Error error={error && error.regexpImageSlims} />
          </div>
          <p className="line">该域名下符合该匹配规则的 jpg 和 png 将会自动瘦身，多个规则请用英文分号「;」分隔；</p>
        </div>
      )
    }
  }

  getDetailContent() {
    const imageSlimConfig = this.props.value
    if (!imageSlimConfig.enableImageSlim) {
      return null
    }

    const slimType = imageSlimConfig.slimType
    const slimTypeRadios = slimTypeList.map(
      type => (
        <Radio key={type} value={type}>{humanizeSlimType(type)}</Radio>
      )
    )
    return (
      <div>
        <div className="line">
          <Radio.Group
            value={slimType}
            onChange={this.handleSlimTypeChange}
          >{slimTypeRadios}</Radio.Group>
        </div>
        {this.getRuleContent()}
      </div>
    )
  }

  render() {
    const imageSlimConfig = this.props.value

    return (
      <div className="domain-image-slim-config-input-wrapper">
        <p className="line">1. 图片瘦身目前仅支持 jpg，png 的图片格式；</p>
        <p className="line">2. 无需添加任何参数，自动瘦身；图片体积大幅减少，节省 CDN 流量；</p>
        <p className="line">3. 价格：0.1 元/千次。</p>
        <div className="line">
          <Switch checked={imageSlimConfig.enableImageSlim} onChange={this.handleEnableImageSlimChange} />
        </div>
        {this.getDetailContent()}
      </div>
    )
  }
}

export type State = FormState<{
  enableImageSlim: FieldState<boolean>
  slimType: FieldState<number>
  prefixImageSlims: FieldState<string>
  regexpImageSlims: FieldState<string>
}>

export type Value = IImageSlimConfig

export function createState(conf: IImageSlimConfig): State {
  const slimType = new FieldState(conf.slimType!)
  const enableImageSlim = new FieldState(conf.enableImageSlim)

  return new FormState({
    slimType,
    enableImageSlim,
    prefixImageSlims: new FieldState(conf.prefixImageSlims).validators(
      v => validatePrefixImageSlims(slimType.value)(v)
    ).disableValidationWhen(() => slimType.value !== slimTypes.prefix),
    regexpImageSlims: new FieldState(conf.regexpImageSlims).validators(
      v => validateRegexpImageSlims(slimType.value)(v)
    ).disableValidationWhen(() => slimType.value !== slimTypes.regexp)
  }).disableValidationWhen(() => !enableImageSlim.value)
}

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  state: State
}

export default observer(function DomainImageSlimConfigInputWrapper({ state }: Props) {
  const { value, onChange, error } = useStateBinding<State, Value, ErrorOfMap<IImageSlimConfig>>(state)

  return (
    <DomainImageSlimConfigInput
      error={error}
      value={value}
      onChange={onChange}
    />
  )
})
