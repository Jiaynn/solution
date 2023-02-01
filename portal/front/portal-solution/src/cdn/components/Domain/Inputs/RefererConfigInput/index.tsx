/*
 * @file 域名防盗链配置
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { FieldState, FormState } from 'formstate-x'
import { observer } from 'mobx-react'
import Input from 'react-icecream/lib/input'
import Radio from 'react-icecream/lib/radio'
import { bindRadioGroup, bindSwitch, bindTextArea } from 'portal-base/common/form'

import { trimAndFilter } from 'cdn/transforms'

import { humanizeRefererType, validateRefererValues, isEnabled } from 'cdn/transforms/domain/referer'

import { maxRefererItemNum, refererTypes } from 'cdn/constants/domain'
import { isQiniu } from 'cdn/constants/env'

import HelpLink from 'cdn/components/common/HelpLink'

import TipIcon from 'cdn/components/TipIcon'
import Switch from '../common/Switch'
import Error from '../common/Error'

import './style.less'

export interface IRefererConfig {
  refererType: string
  refererValues: string[]
  nullReferer: boolean
}

export function getDefaultRefererConfig(): IRefererConfig {
  return {
    refererType: refererTypes.empty,
    refererValues: [],
    nullReferer: true
  }
}

export function createState(config: IRefererConfig) {
  const refererEnabled = new FieldState(isEnabled(config))
  const refererType = new FieldState(refererEnabled.value ? config.refererType : refererTypes.white)
  const refererValues = refererValuesToRefererValueForDisplay(config.refererValues)

  return new FormState({
    refererEnabled,
    config: new FormState({
      refererType,
      nullReferer: new FieldState(config.nullReferer),
      whiteRefererValues: new FieldState(config.refererType === refererTypes.white ? refererValues : '').validators(
        v => validateRefererValues(refererValueForDisplayToRefererValues(v))
      ).disableValidationWhen(() => refererType.value !== refererTypes.white),
      blackRefererValues: new FieldState(config.refererType === refererTypes.black ? refererValues : '').validators(
        v => validateRefererValues(refererValueForDisplayToRefererValues(v))
      ).disableValidationWhen(() => refererType.value !== refererTypes.black)
    }).disableValidationWhen(() => !refererEnabled.value)
  })
}

export type State = ReturnType<typeof createState>

export type Value = IRefererConfig

export function getValue(state: State): Value {
  if (!state.value.refererEnabled) {
    return {
      refererType: refererTypes.empty,
      refererValues: [],
      nullReferer: true
    }
  }

  const refererType = state.value.config.refererType
  const refererValues = refererType === refererTypes.white
    ? state.value.config.whiteRefererValues
    : state.value.config.blackRefererValues

  return {
    refererType,
    nullReferer: state.value.config.nullReferer,
    refererValues: trimAndFilter(refererValueForDisplayToRefererValues(refererValues))
  }
}

const radios = [refererTypes.white, refererTypes.black].map(
  refererType => <Radio key={refererType} value={refererType} >{humanizeRefererType(refererType)}</Radio>
)

const RefererConfigInput = observer(function _RefererConfigInput({ state }: { state: State }) {
  if (!state.value.refererEnabled) {
    return null
  }

  const refererType = state.value.config.refererType

  const refererValuesFieldState = refererType === refererTypes.black
    ? state.$.config.$.blackRefererValues
    : state.$.config.$.whiteRefererValues

  return (
    <div>
      <div className="line">
        <Radio.Group {...bindRadioGroup(state.$.config.$.refererType)}>
          {radios}
        </Radio.Group>
      </div>
      <div className="line help">
        请输入您{humanizeRefererType(refererType)}访问的来源域名，编辑域名时注意以下规则：
        <ul className="referer-value-rules">
          { isQiniu && <li>防盗链配置将不再自动同步给存储源站，如有需要请单独在存储页面配置。</li> }
          <li>域名之间请回车换行，无需填写 http://，https://；</li>
          <li>
            支持域名前使用通配符 *：*.example.com 可用于指代所有 example.com 下的多级子域名，比如 a.example.com 等，
            <span className="highlight">但是不包括 example.com，如需要请额外填写一条 example.com</span>
            ；
          </li>
          <li>防盗链个数设置不能超过 {maxRefererItemNum} 个；</li>
          <li>黑白名单生效时间为 1 小时，在此期间不能修改其它配置；</li>
          <li>不支持 IP，不支持端口号。</li>
        </ul>
      </div>
      <div className="line">
        <div className="text-input-wrapper">
          <Input.TextArea
            autosize={{ minRows: 5, maxRows: 10 }}
            placeholder="example.com&#10;*.example.com"
            {...bindTextArea(refererValuesFieldState)}
          />
        </div>
        <Error error={state.$.config.error} />
      </div>
      <h4 className="line">
        是否允许空 Referer
        <TipIcon className="tip-icon" tip="关闭防盗链时值为true" />。
        <HelpLink href="https://support.qiniu.com/hc/kb/article/112798/">相关文档</HelpLink>
      </h4>
      <p className="line">
        <Switch
          {...bindSwitch(state.$.config.$.nullReferer)}
          checkedChildren="是"
          unCheckedChildren="否"
        />
      </p>
    </div>
  )
})

export interface Props {
  state: State
}

export default observer(function DomainRefererConfigInput({ state }: Props) {
  return (
    <div className="domain-referer-config-input-wrapper">
      <div className="line">
        <Switch {...bindSwitch(state.$.refererEnabled)} />
      </div>
      <RefererConfigInput state={state} />
    </div>
  )
})

function refererValuesToRefererValueForDisplay(refererValues: string[]): string {
  return refererValues.join('\n')
}

function refererValueForDisplayToRefererValues(refererValueForDisplay: string): string[] {
  return refererValueForDisplay.split('\n')
}
