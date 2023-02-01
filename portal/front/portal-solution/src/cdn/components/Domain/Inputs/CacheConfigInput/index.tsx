/**
 * @file 域名缓存配置
 * @author nighca <nighca@live.cn>
 */

import React, { ReactNode } from 'react'
import { reaction } from 'mobx'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Radio from 'react-icecream/lib/radio'
import Button from 'react-icecream/lib/button'
import Icon from 'react-icecream/lib/icon'
import Input from 'react-icecream/lib/input'
import Select from 'react-icecream/lib/select'
import { FormState, ArrayFormState, FieldState, TransformedState, DebouncedFieldState } from 'formstate-x-v3'
import { useLocalStore } from 'qn-fe-core/local-store'
import { useInjection } from 'qn-fe-core/di'

import { atoi } from 'cdn/transforms'

import { assertUnreachable } from 'cdn/utils'

import { bindInput, bindRadioGroup, bindSelect, bindSwitch } from 'cdn/utils/form/formstate-x-v3'

import {
  humanizeCacheType,
  humanizeCacheControlType,
  humanizeCacheControlTimeunit,
  cacheControlHasRule,
  shouldDisableCacheControlEdit,
  validateCustomizeCacheControl,
  tipForCacheControlTime,
  cacheControlsToCacheType
} from 'cdn/transforms/domain'

import { getPlaceHolder } from 'cdn/transforms/domain/cache'

import AbilityConfig from 'cdn/constants/ability-config'
import {
  CacheType,
  cacheTypeList,
  CacheControlType,
  cacheControlTimeunits,
  cacheControlTimeunitList,
  cacheControlForCacheTypeFollow
} from 'cdn/constants/domain'

import { SortableContainer, SortableElement, SortDragHandle } from 'cdn/components/common/Sortable'

import { ICacheControl, IDomainDetail } from 'cdn/apis/domain'

import Error from '../common/Error'
import Switch from '../common/Switch'
import Warning from '../common/Warning'
import * as ignoreParamsInput from './IgnoreParams'
import LocalStore from './store'

import './style.less'

export { getDefaultCacheConfig, getDefaultStaticCacheConfig } from 'cdn/transforms/domain/cache'

export interface ICacheConfig {
  enabled: boolean
  cacheControls: ICacheControl[]
  ignoreParamsEnabled: boolean
  ignoreParamsType: string
  ignoreParams: string[]
}

function getCacheControls(cacheType: CacheType, cacheControls: ICacheControl[]): ICacheControl[] {
  if (cacheType === CacheType.Follow) return [cacheControlForCacheTypeFollow]
  if (cacheType === CacheType.Customize) return cacheControls.filter(it => it.type !== CacheControlType.Follow)
  assertUnreachable()
}

export function createStaticCacheState(cacheConfig: ICacheConfig) {
  const enabledFieldState = new FieldState(cacheConfig.enabled)

  const uiState = new FormState({
    enabled: enabledFieldState,
    cacheType: new FieldState(cacheControlsToCacheType(cacheConfig.cacheControls)),
    cacheControls: new ArrayFormState(
      cacheConfig.cacheControls,
      createCacheControlState
    ).disableWhen(() => !enabledFieldState.value),
    ignoreParams: ignoreParamsInput.createState(cacheConfig)
      .disableWhen(() => !enabledFieldState.value)
  })

  return new TransformedState(
    uiState,
    ({ cacheType, cacheControls, enabled, ignoreParams }) => ({
      enabled,
      cacheControls: getCacheControls(cacheType, cacheControls),
      ...ignoreParams
    }),
    ({ cacheControls, enabled, ...ignoreParams }) => ({
      enabled,
      cacheType: cacheControlsToCacheType(cacheControls),
      cacheControls,
      ignoreParams
    })
  )
}

type StaticCacheState = ReturnType<typeof createStaticCacheState>

export function createState(cacheConfig: ICacheConfig) {
  const enabledFieldState = new FieldState(cacheConfig.enabled)

  const uiState = new FormState({
    enabled: enabledFieldState,
    cacheType: new FieldState(cacheControlsToCacheType(cacheConfig.cacheControls)),
    cacheControls: new ArrayFormState(
      cacheConfig.cacheControls,
      createCacheControlState
    ),
    ignoreParams: ignoreParamsInput.createState(cacheConfig)
  })
  return new TransformedState(
    uiState,
    ({ enabled, cacheType, cacheControls, ignoreParams }) => ({
      enabled,
      cacheControls: getCacheControls(cacheType, cacheControls),
      ...ignoreParams
    }),
    ({ enabled, cacheControls, ...ignoreParams }) => ({
      enabled,
      cacheType: cacheControlsToCacheType(cacheControls),
      cacheControls,
      ignoreParams
    })
  )
}

export type State = ReturnType<typeof createState> | ReturnType<typeof createStaticCacheState>

// 构造一个 value 为 number，但包了一个 value 为 string 的 field state 的 state
// 用于基于值为 string 的 input / select 输入 number 值
function createNumState(value: number, emptyValue?: number) {

  const uiState = new FieldState(value + '')

  if (emptyValue != null) {
    // 当 input 中被清空时，自动填充 emptyValue
    // eslint-disable-next-line dot-notation
    uiState['addDisposer'](reaction(
      () => uiState.value,
      uiValue => uiValue === '' && uiState.set(emptyValue + '')
    ))
  }

  return new TransformedState(
    uiState,
    (v: string) => atoi(v),
    (v: number) => v + ''
  )
}

function createCacheControlState(value: ICacheControl) {
  return new FormState({
    type: new FieldState(value.type),
    rule: new DebouncedFieldState(value.rule ?? ''),
    time: createNumState(value.time ?? 30, 0),
    timeunit: createNumState(value.timeunit ?? cacheControlTimeunits.day)
  }).withValidator(validateCustomizeCacheControl)
}

type CacheControlState = ReturnType<typeof createCacheControlState>

interface CacheControlLineProps {
  state: CacheControlState
  onRemove?: () => void
}

const CacheControlLine = observer(function CacheControlLine({ state, onRemove }: CacheControlLineProps) {
  const { useStaticCacheConfig } = useInjection(AbilityConfig)

  const cacheControl = state.value
  // cdn 下全局配置不允许操作（移动或删除），dcdn 下可删除
  const canOperate = cacheControl.type !== CacheControlType.All
  const hasRuleInput = cacheControlHasRule(cacheControl)
  const shouldDisableInput = shouldDisableCacheControlEdit(cacheControl)

  const ruleInput = (
    hasRuleInput
    ? (
      <Input
        className="rule-input"
        placeholder={getPlaceHolder(cacheControl.type)}
        disabled={shouldDisableInput}
        {...bindInput(state.$.rule)}
      />
    )
    : null
  )

  const timeunitSelect = (
    <Select
      className="timeunit-input"
      disabled={shouldDisableInput}
      {...bindSelect(state.$.timeunit.$)}
    >
      {cacheControlTimeunitList.map(
        timeunit => (
          <Select.Option key={timeunit} value={timeunit + ''}>
            {humanizeCacheControlTimeunit(timeunit)}
          </Select.Option>
        )
      )}
    </Select>
  )

  const timeInput = (
    <Input
      className="time-input"
      type="number"
      placeholder="缓存时间"
      addonAfter={timeunitSelect}
      disabled={shouldDisableInput}
      {...bindInput(state.$.time.$)}
    />
  )

  const operationPart = (
    (canOperate || useStaticCacheConfig)
    ? (
      <div className="handle-remove">
        <Icon
          className="icon-remove"
          type="minus-circle"
          onClick={onRemove}
        />
      </div>
    )
    : null
  )

  const movePart = (
    canOperate
    ? <SortDragHandle />
    : null
  )

  const lineClassName = classNames({
    'cache-controls-table-line': true,
    // 加这个长 className 是为了防止拖拽时样式错乱，具体原因见 ./style.less
    'cache-controls-table-line-in-domain-cache-config-input-wrapper': true
  })

  const warning = useStaticCacheConfig ? null : tipForCacheControlTime(cacheControl.time!)

  return (
    <li className={lineClassName}>
      <div className="cache-controls-table-grid cache-controls-table-grid-type-rule">
        <Button style={{ color: '#595959', backgroundColor: '#eee' }} disabled>
          {humanizeCacheControlType(cacheControl.type)}
        </Button>
        {ruleInput}
      </div>
      <div className="cache-controls-table-grid cache-controls-table-grid-time">
        <span>缓存时间</span>
        {timeInput}
      </div>
      <div className="cache-controls-table-grid cache-controls-table-grid-operation">{operationPart}</div>
      <div className="cache-controls-table-grid cache-controls-table-grid-move">{movePart}</div>
      { state.error && <div className="cache-controls-table-grid cache-controls-table-grid-error"><Error error={state.error} /></div> }
      { warning && <div className="cache-controls-table-grid cache-controls-table-grid-warning"><Warning warning={warning} /></div> }
    </li>
  )
})

const SortableCacheControlLine = SortableElement(CacheControlLine)

interface CacheControlListProps {
  states: CacheControlState[]
  onRemove: (index: number) => void
}

function CacheControlList({ states, onRemove }: CacheControlListProps) {
  const lines = states.map((state, index) => (
    <SortableCacheControlLine
      key={index}
      index={index}
      state={state}
      onRemove={() => onRemove(index)}
    />
  ))
  return (
    <ul>{lines}</ul>
  )
}

export const SortableCacheControlList = SortableContainer(CacheControlList)

export interface Props {
  state: State
  domain: IDomainDetail
  isQiniuPrivate: boolean
  modify: boolean
}

export default observer(function DomainCacheConfigInput(props: Props) {

  const store = useLocalStore(LocalStore, props)

  function renderCacheControlActions() {
    return (
      <div className="line">
        <Button icon="plus" onClick={store.handleUseRecommendedCacheControls}>使用推荐配置</Button>
        <Button icon="plus" onClick={store.handleAddSuffixCacheControl}>添加后缀</Button>
        <Button icon="plus" onClick={store.handleAddPathCacheControl}>添加目录</Button>
      </div>
    )
  }

  function renderCacheControlsContent() {
    const state = props.state.$
    const cacheType = state.$.cacheType.value

    if (cacheType === CacheType.Follow) {
      return (
        <p className="line help">缓存时间将跟源站同步。</p>
      )
    }

    if (cacheType === CacheType.Customize) {
      const cacheControlStates = state.$.cacheControls.$.slice()
      const tailCacheControlState = cacheControlStates.pop()!
      return (
        <div>
          <p className="help line">
            按从上至下顺序，采取优先匹配原则。
          </p>
          {renderCacheControlActions()}
          <div className="line">
            <div className="cache-controls-table">
              <SortableCacheControlList
                onSortEnd={store.handleCacheControlSortEnd}
                helperClass="sortable-list-in-domain-cache-config-input-wrapper"
                useDragHandle
                states={cacheControlStates}
                onRemove={store.handleRemoveCacheControl}
              />
              <ul className="default-type-all-cache-control-block">
                <CacheControlLine state={tailCacheControlState} />
              </ul>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  function renderStaticCacheControlsContent() {
    const state = props.state as unknown as StaticCacheState
    const enabled = state.value.enabled

    const tips = enabled
      ? '请配置静态缓存规则，命中规则部分遵循静态边缘缓存逻辑，未命中部分使用最优链路动态回源。'
      : '使用最优链路动态回源，不做任何边缘缓存。'

    const cacheControlStates = state.$.$.cacheControls.$.slice()

    let cacheControlCnt = null
    if (cacheControlStates.length
      && cacheControlStates[cacheControlStates.length - 1].value.type === CacheControlType.All) {
      const tailCacheControlState = cacheControlStates.pop()!
      cacheControlCnt = (
        <>
          <SortableCacheControlList
            onSortEnd={store.handleCacheControlSortEnd}
            helperClass="sortable-list-in-domain-cache-config-input-wrapper"
            useDragHandle
            states={cacheControlStates}
            onRemove={store.handleRemoveCacheControl}
          />
          <ul className="default-type-all-cache-control-block">
            <CacheControlLine state={tailCacheControlState} />
          </ul>
        </>
      )
    } else {
      cacheControlCnt = (
        <SortableCacheControlList
          onSortEnd={store.handleCacheControlSortEnd}
          helperClass="sortable-list-in-domain-cache-config-input-wrapper"
          useDragHandle
          states={cacheControlStates}
          onRemove={store.handleRemoveCacheControl}
        />
      )
    }

    const content = (
      <div className="cache-config-input-content">
        {renderCacheControlActions()}
        <div className="line">
          <div className="cache-controls-table">
            {cacheControlCnt}
          </div>
        </div>
        <p className="help line">
          按从上至下顺序，采取优先匹配原则。
        </p>
        {state.$.$.cacheControls.hasError && <Error error={state.$.$.cacheControls.error} />}
      </div>
    )

    return (
      <>
        <div className="line">
          <Switch {...bindSwitch(state.$.$.enabled)} />
          <p className="cache-control-tips">{tips}</p>
        </div>
        {enabled && content}
      </>
    )
  }

  let cnt: ReactNode = null

  if (store.abilityConfig.useStaticCacheConfig) {
    cnt = renderStaticCacheControlsContent()
  } else {
    cnt = (
      <>
        <div className="line">
          <Radio.Group {...bindRadioGroup(props.state.$.$.cacheType)}>
            {cacheTypeList.map(type => (
              <Radio key={type} value={type}>{humanizeCacheType(type)}</Radio>
            ))}
          </Radio.Group>
        </div>
        <div className="cache-config-input-content">
          {renderCacheControlsContent()}
        </div>
      </>
    )
  }

  return (
    <div className="domain-cache-config-input-wrapper">
      {cnt}
    </div>
  )
})
