/**
 * @file Input for domain advancedSources
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observable, computed, autorun, reaction, action } from 'mobx'
import { observer } from 'mobx-react'
import { isEqual } from 'lodash'
import autobind from 'autobind-decorator'
import Input from 'react-icecream/lib/input'
import Button from 'react-icecream/lib/button'
import Icon from 'react-icecream/lib/icon'
import { useLocalStore, injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { FieldState } from 'formstate-x'

import { ArrayFormState } from 'cdn/utils/form/formstate-x'

import { validateAdvancedSource } from 'cdn/transforms/domain/advanced-source'

import { useStateBinding } from 'cdn/hooks/form'

import { isOEM } from 'cdn/constants/env'

import TipIcon from 'cdn/components/TipIcon'

import { IDomainDetail } from 'cdn/apis/domain'

import Error from '../common/Error'

import './style.less'

export interface IAdvancedSource {
  host: string
  port: string
  weight: number
  backup: boolean
}

export interface IDomainAdvancedSourcesInputProps {
  domains: IDomainDetail[]
  value: IAdvancedSource[]
  error: string[]
  onChange: (value: IAdvancedSource[]) => void
}

export interface IAdvancedSourceForDisplay {
  backup: boolean
  role: string
  host: string
  port: string
  weight: string
}

@injectable()
export class LocalStore extends Store {

  constructor(@injectProps() private props: IDomainAdvancedSourcesInputProps) { super() }

  init() {
    // 外部传入的 value 变更时更新 sourcesForDisplay
    this.addDisposer(reaction(
      () => this.props.value,
      sources => {
        // 排除当前组件内部的改动导致的更新
        if (isEqual(sources, this.resultSources)) { return }
        this.updateSourcesForDisplay(sourcesToSourcesForDisplay(sources))
      },
      { fireImmediately: true }
    ))

    // 当前组件内部状态变更通过 onChange 同步到外部
    this.addDisposer(reaction(
      () => this.resultSources,
      resultSources => {
        const { value, onChange } = this.props
        // 排除外部 value 传入导致的更新
        if (isEqual(resultSources, value)) { return }
        onChange(this.resultSources)
      },
      { fireImmediately: true }
    ))

    this.addDisposer(autorun(() => {
      const sources = this.props.value
      if (!sources.length) {
        this.addEmptySource(false)
      }
    }))
  }

  @observable sourcesForDisplay: IAdvancedSourceForDisplay[] = []

  @action updateSourcesForDisplay(sourcesForDisplay: IAdvancedSourceForDisplay[]) {
    this.sourcesForDisplay = sourcesForDisplay
  }

  @computed get resultSources() {
    return sourcesForDisplayToSources(this.sourcesForDisplay)
  }

  @action addEmptySource(backup: boolean) {
    this.sourcesForDisplay.push(
      sourceToSourceForDisplay(getEmptySource(backup))
    )
  }

  @action removeSource(targetIndex: number) {
    this.sourcesForDisplay.splice(targetIndex, 1)
  }

  @action updateSource(targetIndex: number, key: string, value: any) {
    (this.sourcesForDisplay as any)[targetIndex][key] = value
  }
}

@observer
export class DomainAdvancedSourcesInputInner extends React.Component<
  IDomainAdvancedSourcesInputProps & { store: LocalStore }
> {

  @autobind handleAddMainSource() {
    this.props.store.addEmptySource(false)
  }

  @autobind handleAddBackupSource() {
    this.props.store.addEmptySource(true)
  }

  @autobind handleHostChange(index: number, e: React.FormEvent<any>) {
    this.props.store.updateSource(index, 'host', (e.target as any).value.trim())
  }

  @autobind handlePortChange(index: number, e: React.FormEvent<any>) {
    this.props.store.updateSource(index, 'port', (e.target as any).value)
  }

  @autobind handleWeightChange(index: number, e: React.FormEvent<any>) {
    this.props.store.updateSource(index, 'weight', (e.target as any).value)
  }

  @autobind handleRemove(index: number) {
    this.props.store.removeSource(index)
  }

  render() {
    const errors = this.props.error

    const tableLines = this.props.store.sourcesForDisplay.map(
      (sourceForDisplay, index) => (
        <React.Fragment key={index}>
          <tr className="sources-table-line">
            <td className="sources-table-grid-role"><span>{sourceForDisplay.role}</span></td>
            <td className="sources-table-grid-host">
              <Input value={sourceForDisplay.host} onChange={e => this.handleHostChange(index, e)} />
            </td>
            <td className="sources-table-grid-port">
              <Input type="number" value={sourceForDisplay.port} onChange={e => this.handlePortChange(index, e)} />
            </td>
            <td className="sources-table-grid-weight">
              <Input type="number" value={sourceForDisplay.weight} onChange={e => this.handleWeightChange(index, e)} />
            </td>
            <td className="sources-table-grid-operation">{
              index === 0
              ? null
              : (
                <Icon
                  className="icon-remove"
                  type="minus-circle"
                  onClick={() => this.handleRemove(index)}
                />
              )
            }</td>
          </tr>
          {
            errors && errors[index] && (
              <tr>
                <td></td>
                <td className="sources-table-grid-error">
                  <Error error={errors[index]} />
                </td>
              </tr>
            )
          }
        </React.Fragment>
      )
    )

    const advancedTips = (
      <>
        多个回源地址根据权重配置进行加权轮询；<br />
        5 秒内连续回源请求失败 3 次则标记为不可用，5 秒后重新加入加权轮询调度中；<br />
        主源全部不可用后切换至备源进行加权轮询调度，特殊情况请
        {
          isOEM
          ? '联系客服人员'
          : (
            <>
              提&nbsp;
              <a
                href="https://support.qiniu.com/tickets/new/form?category=%E9%85%8D%E7%BD%AE%E9%97%AE%E9%A2%98&space=CDN"
                target="_blank"
                rel="noopener"
              >工单</a>
              &nbsp;
            </>
          )
        }
        确认。
      </>
    )

    return (
      <div className="line domain-advanced-sources-input-wrapper">
        <div className="line">
          <Button icon="plus" onClick={this.handleAddMainSource}>主线路</Button>
          <Button icon="plus" onClick={this.handleAddBackupSource}>备线路</Button>
        </div>
        <div className="line">
          <table className="sources-table">
            <thead>
              <tr>
                <th>
                  主/备
                  <TipIcon tip={advancedTips} />
                </th>
                <th>
                  回源地址
                  <TipIcon tip="回源地址不能与加速域名相同。" />
                </th>
                <th>
                  端口号
                  <TipIcon tip="回源时使用的端口号，留空则会使用回源协议的默认端口" />
                </th>
                <th>
                  权重
                  <TipIcon tip="请求概率 = 权重 / 权重总和，eg：有两个主线路 A 和 B，A 权重 1 和 B 权重 3，那么四次请求，1 次是 A，3 次是 B；" />
                </th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>{tableLines}</tbody>
          </table>
        </div>
      </div>
    )
  }
}

type AdvancedSourceState = FieldState<{
  host: string
  port: string
  weight: number
  backup: boolean
}>

export type State = ArrayFormState<AdvancedSourceState, IAdvancedSource>

export type Value = IAdvancedSource[]

export function createState(
  sources: IAdvancedSource[],
  getDomains: () => IDomainDetail[]
): State {
  return new ArrayFormState(sources, (source: IAdvancedSource) => (
    createAdvancedSourceState(source, getDomains)
  ))
}

function createAdvancedSourceState(
  source: IAdvancedSource,
  getDomains: () => IDomainDetail[]
): AdvancedSourceState {
  return new FieldState({
    host: source.host,
    port: source.port,
    weight: source.weight,
    backup: source.backup
  }).validators(
    val => validateAdvancedSource(getDomains())(val)
  )
}

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  domains: IDomainDetail[]
  state: State
}

export default observer(function DomainAdvancedSourcesInput(props: Props) {
  const { error, value, onChange } = useStateBinding<State, Value, string[]>(
    props.state
  )

  const store = useLocalStore(LocalStore, {
    ...props,
    value,
    onChange
  })

  return (
    <DomainAdvancedSourcesInputInner
      store={store}
      error={error}
      domains={props.domains}
      value={value}
      onChange={onChange}
    />
  )
})

export function getEmptySource(backup: boolean): IAdvancedSource {
  return {
    weight: 1,
    backup,
    port: '',
    host: ''
  }
}

function sourceToSourceForDisplay(source: IAdvancedSource): IAdvancedSourceForDisplay {
  return {
    backup: source.backup,
    role: source.backup ? '备线路' : '主线路',
    host: source.host,
    port: source.port,
    weight: source.weight + ''
  }
}

function sourcesToSourcesForDisplay(sources: IAdvancedSource[]): IAdvancedSourceForDisplay[] {
  return sources.map(sourceToSourceForDisplay)
}

function sourceForDisplayToSource(sourceForDisplay: IAdvancedSourceForDisplay): IAdvancedSource {
  return {
    host: sourceForDisplay.host,
    port: sourceForDisplay.port || '',
    backup: sourceForDisplay.backup,
    weight: parseInt(sourceForDisplay.weight, 10)
  }
}

function sourcesForDisplayToSources(sourcesForDisplay: IAdvancedSourceForDisplay[]): IAdvancedSource[] {
  return sourcesForDisplay.map(v => sourceForDisplayToSource(v))
}
