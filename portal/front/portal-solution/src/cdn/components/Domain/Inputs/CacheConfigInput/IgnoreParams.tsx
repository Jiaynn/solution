/**
 * @file Ignore URL Params Input
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState, TransformedState } from 'formstate-x-v3'
import Radio from 'react-icecream/lib/radio'
import Input from 'react-icecream/lib/input'

import { splitLines } from 'cdn/transforms'

import { bindSwitch, bindRadioGroup, bindTextArea } from 'cdn/utils/form/formstate-x-v3'

import { humanizeIgnoreParamsType, validateIgnoreParams } from 'cdn/transforms/domain/cache'

import { ignoreParamsTypes } from 'cdn/constants/domain/cache'
import { isQiniu } from 'cdn/constants/env'

import TipIcon from 'cdn/components/TipIcon'

import Switch from '../common/Switch'
import Error from '../common/Error'

import './style.less'

function createIgnoreParamsState(value: string[]) {
  const join = (v: string[]) => (v || []).join('\n')
  const split = (v: string) => splitLines(v)
  const uiState = new FieldState(join(value))
  return new TransformedState(uiState, split, join).withValidator(validateIgnoreParams)
}

export type Value = {
  ignoreParamsEnabled: boolean
  ignoreParamsType: string
  ignoreParams: string[]
}

export function createState(val: Value) {
  const ignoreParamsType = new FieldState(val.ignoreParamsType)
  const ignoreParamsEnabled = new FieldState(val.ignoreParamsEnabled)

  return new FormState({
    ignoreParamsType,
    ignoreParamsEnabled,
    ignoreParams: createIgnoreParamsState(val.ignoreParams).disableWhen(
      () => !(
        ignoreParamsEnabled.value
        && ignoreParamsType.value === ignoreParamsTypes.customize
      )
    )
  })
}

export type State = ReturnType<typeof createState>

export interface Props {
  state: State
}

const IgnoreParamsContent = observer(function _IgnoreParamsContent({
  state
}: { state: State }) {
  const ignoreParamsType = state.$.ignoreParamsType.value

  switch (ignoreParamsType) {
    case ignoreParamsTypes.all: {
      return (
        isQiniu
        ? <p className="line">资源缓存时去除 URL「?」后的全部参数进行缓存，忽略全部参数同时会导致图片处理等 FOP 功能失效</p>
        : <p className="line">资源缓存时去除 URL「?」后的全部参数进行缓存。</p>
      )
    }
    case ignoreParamsTypes.customize: {
      return (
        <div className="line">
          <p className="line">请输入参数，每行一个；资源缓存时会去除您输入的指定参数然后进行缓存</p>
          <div className="line">
            <div className="text-input-wrapper">
              <Input.TextArea
                autosize={{ minRows: 2, maxRows: 5 }}
                placeholder="a&#10;b"
                {...bindTextArea(state.$.ignoreParams.$)}
              />
            </div>
            <Error error={state.$.ignoreParams.error} />
          </div>
        </div>
      )
    }
    default:
      return null
  }
})

export function IgnoreParamsInputLabel() {
  const tip = (
    <>
      请求 URL 参数过多会导致资源命中率降低，当请求 URL「?」后的参数不影响文件内容时，建议忽略相关参数，可有效提高文件缓存命中率，降低回源成本。
    </>
  )

  return (
    <>
      忽略 URL 参数&nbsp;
      <TipIcon tip={tip} />
    </>
  )
}

export default observer(function IgnoreUrlParams({ state }: Props) {
  const ignoreParamsTypeRadios = [ignoreParamsTypes.all, ignoreParamsTypes.customize].map(
    type => (
      <Radio key={type} value={type}>{humanizeIgnoreParamsType(type)}</Radio>
    )
  )

  const ignoreParamsEnabled = state.$.ignoreParamsEnabled.value

  return (
    <div className="comp-domain-cache-ignore-params-input">
      <div className="line">
        <Switch {...bindSwitch(state.$.ignoreParamsEnabled)} />
      </div>
      {
        ignoreParamsEnabled && (
          <>
            <div className="line">
              <Radio.Group
                {...bindRadioGroup(state.$.ignoreParamsType)}
              >
                {ignoreParamsTypeRadios}
              </Radio.Group>
            </div>
            <div className="cache-ignore-params-input-content">
              <IgnoreParamsContent state={state} />
            </div>
          </>
        )
      }
    </div>
  )
})
