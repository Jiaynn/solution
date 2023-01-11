/**
 * @file Input for domain panNames
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { InputGroup, InputGroupItem } from 'react-icecream-2'
import { TextInput } from 'react-icecream-2/form-x'
import { FormState, FieldState } from 'formstate-x'

import { textRequired, textPattern } from 'cdn/transforms/form'

import { panNamePattern } from 'cdn/constants/domain'

import { IDomainDetail } from 'cdn/apis/domain'
import Error from '../common/Error'
import MultiInputs from '../MultiInputs'

import './style.less'

export type State = FormState<SinglePanNameState[]>

export type Value = string[]

export function createState(domains: string[]): State {
  return new FormState((domains || []).map(name => createSinglePanNameState(name)))
}

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  limit: number
  state: State
  domain: IDomainDetail
}

type SinglePanNameState = FieldState<string>

function createSinglePanNameState(name: string): SinglePanNameState {
  return new FieldState(name != null ? name : '', 500)
    .validators(
      v => textRequired(v, '域名前缀不能为空'),
      v => textPattern(panNamePattern)(v, '请正确填写域名前缀，泛子域名前缀只支持一级。')
    )
}

interface PanNameInputProps {
  pareDomain: string
  state: SinglePanNameState
}

const PanNameInput = observer(function _PanNameInput(props: PanNameInputProps) {
  const { pareDomain, state } = props
  return (
    <>
      <InputGroup style={{ width: 'fit-content' }}>
        <TextInput style={{ width: '260px' }} placeholder="请输入域名前缀" state={state} />
        <InputGroupItem>{pareDomain}</InputGroupItem>
      </InputGroup>
      <Error error={state.error} />
    </>
  )
})

export default observer(function DomainPanNameInput(props: Props) {
  const { domain, limit, state } = props

  const handleAddInput = React.useCallback(() => {
    runInAction(() => {
      state.$.push(createSinglePanNameState(''))
    })
  }, [state])

  const handleDeleteInput = React.useCallback((index: number) => {
    runInAction(() => {
      const inputs = state.$.splice(index, 1)
      inputs.forEach(it => it.dispose())
    })
  }, [state])

  return (
    <div className="domain-pan-name-input-wrapper">
      <MultiInputs
        state={state.$}
        onAdd={handleAddInput}
        onDelete={handleDeleteInput}
        limit={limit}
        renderInput={s => (
          <PanNameInput pareDomain={domain.pareDomain} state={s} />
        )}
      />
    </div>
  )
})
