/**
 * @file DomainList Component
 * @author linchen <gakiclin@gmail.com>
 */

import React, { useCallback } from 'react'
import { observer, Observer } from 'mobx-react'
import Spin from 'react-icecream/lib/spin'
import Button from 'react-icecream/lib/button'
import Checkbox, { CheckboxChangeEvent } from 'react-icecream/lib/checkbox'
import { List as VirtualizedList, ListRowRenderer } from 'react-virtualized'
import { useLocalStore } from 'qn-fe-core/local-store'
import { useTranslation } from 'portal-base/common/i18n'

import { OperatingState } from 'cdn/constants/domain'

import { IDomain } from 'cdn/apis/domain'

import * as messages from './messages'
import LocalStore, { State } from './store'

export { State, createState, getValue } from './store'

export interface IProps {
  state: State
  loading: boolean
  domainList: IDomain[]
}

interface ISelectAllProps {
  store: LocalStore
}

const SelectAll = observer(function _SelectAll({ store }: ISelectAllProps) {
  const t = useTranslation()

  const handleFullSelected = useCallback(
    (event: CheckboxChangeEvent) => {
      store.handleFullSelected(event.target.checked)
    },
    [store]
  )

  return (
    <div className="domain-list-select-all">
      <Checkbox
        checked={store.isFullSelected}
        onChange={handleFullSelected}
        indeterminate={store.isPartialSelected}
      >
        {t(messages.selectAll)}
      </Checkbox>
      <Button
        type="link"
        onClick={store.handleClear}
        disabled={store.isEmptySelected}
      >
        {t(messages.clearSelected)}
      </Button>
    </div>
  )
})

const domainListWidth = 312 // px

interface DomainListProps {
  store: LocalStore
}

const DomainListContent = observer(function _DomainListContent({ store }: DomainListProps) {
  const renderDomainItem: ListRowRenderer = ({ key, index, style }) => (
    <Observer
      key={key}
      render={() => {
        const domain = store.domainList[index]
        return (
          <li className="domain-list-item"
            style={{
              ...style,
              lineHeight: style.height + 'px'
            }}
          >
            <Checkbox
              checked={store.props.state.value.findIndex(it => it.name === domain.name) > -1}
              onChange={e => store.handleCheckDomainChange(domain, e.target.checked)}
            >
              { domain.name }{ domain.operatingState === OperatingState.Deleted ? '(已删除)' : '' }
            </Checkbox>
          </li>
        )
      }}
    />
  )

  return (
    <div className="domain-list">
      <VirtualizedList
        className="domain-list-content"
        width={domainListWidth}
        height={180}
        rowHeight={36}
        rowCount={store.domainList.length}
        rowRenderer={renderDomainItem}
      />
    </div>
  )
})

export default observer(function DomainList(props: IProps) {
  const store = useLocalStore(LocalStore, props)
  const t = useTranslation()

  if (store.domainList.length === 0) {
    return (
      <section className="comp-domain-list">
        <p className="empty-data">{t(messages.noData)}</p>
      </section>
    )
  }

  return (
    <section className="comp-domain-list">
      <Spin spinning={props.loading}>
        <SelectAll store={store} />
        <DomainListContent store={store} />
      </Spin>
    </section>
  )
})
