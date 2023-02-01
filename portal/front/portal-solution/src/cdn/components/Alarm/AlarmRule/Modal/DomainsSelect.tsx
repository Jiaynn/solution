import React, { useCallback } from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { FieldState } from 'formstate-x'
import { MultiSelect } from 'react-icecream-2/form-x'

import DomainStore from 'cdn/stores/domain'

import { maxDomainsLength } from 'cdn/constants/alarm'

export type State = FieldState<string[]>

export interface Props {
  state: State
  disabled?: boolean
}

export function createState(value?: string[]): State {
  return new FieldState(value ?? []).validators(v => {
    if (v.length > maxDomainsLength) {
      return `域名绑定数量不能大于 ${maxDomainsLength} `
    }
  })
}

export function getValue(state: State): string[] {
  return state.value
}

export default observer(function DomainsSelect(props: Props) {
  const domainStore = useInjection(DomainStore)

  const fetchDomains = useCallback(
    async (keyword: string) => domainStore.searchDomains(
      { name: keyword, all: true, size: 1000 }
    ).then(res => res.domains.map(domain => ({
      value: domain.name,
      content: domain.name
    }))), [domainStore]
  )

  return (
    <MultiSelect
      style={{ width: '100%' }}
      disabled={props.disabled}
      searchable
      clearable
      collapsed={false}
      state={props.state}
      fetch={fetchDomains}
      placeholder="请选择域名"
    />
  )
})

