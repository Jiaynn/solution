/**
 * @file Input for pan wildcard domain
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState, bindInput } from 'formstate-x'
import Select from 'react-icecream/lib/select'
import Disposable from 'qn-fe-core/disposable'

import { truthy } from 'cdn/transforms/form'

import { IDomain } from 'cdn/apis/domain'
import Error from '../common/Error'

import './style.less'

export type State = FieldState<string>

export type Value = string

export function createState(name: string): State {
  return new FieldState(name).validators(
    (v: string) => truthy(v, '必选项')
  )
}

export interface Props {
  state: State
  wildcardDomains: IDomain[]
}

export default observer(function DomainPanWildcardInputWrapper(props: Props) {
  return (
    <DomainPanWildcardInput
      error={props.state.error}
      wildcardDomains={props.wildcardDomains}
      {...bindInput(props.state)}
    />
  )
})

interface IDomainPanWildcardInputProps {
  wildcardDomains: IDomain[]
  value: string
  error: any
  onChange: (value: string) => void
}

@observer
class DomainPanWildcardInput extends React.Component<IDomainPanWildcardInputProps, {}> {

  disposable = new Disposable()

  componentDidMount() {
    // 自动选中 wildcard domain 列表的中的第一个可用项
    this.disposable.addDisposer(reaction(
      () => this.props.wildcardDomains,
      wildcardDomains => {
        if (wildcardDomains.length > 0 && !this.props.value) {
          this.props.onChange(wildcardDomains[0].name)
        }
      },
      { fireImmediately: true }
    ))
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  render() {
    const { wildcardDomains, value, error, onChange } = this.props
    const options = wildcardDomains.map(
      domain => (
        <Select.Option key={domain.name} value={domain.name}>{domain.name}</Select.Option>
      )
    )
    return (
      <div className="domain-pan-wildcard-input-wrapper">
        <div className="line">
          <div className="text-input-wrapper">
            <Select
              placeholder="请选择一个泛域名"
              showSearch
              value={value}
              onChange={onChange}
            >{options}</Select>
          </div>
          <Error error={error} />
        </div>
      </div>
    )
  }
}
