/**
 * @file DomainSelector Component
 * @author linchen <gakiclin@gmail.com>
 */

import React, { useCallback, ReactNode } from 'react'
import { observer } from 'mobx-react'
import Input from 'react-icecream/lib/input'
import Select from 'react-icecream/lib/select'
import { useInjection } from 'qn-fe-core/di'
import { I18nStore } from 'portal-base/common/i18n'
import { useLocalStore } from 'portal-base/common/utils/store'

import { MAX_DOMAIN_COUNT } from 'cdn/constants/domain'

import { SimpleTagSelector } from 'cdn/components/common/TagSelector'
import Popover, { PopoverProps } from 'cdn/components/common/Popover'

import { IQueryParams } from 'cdn/apis/domain'

import DomainFilter from './DomainFilter'
import ProtocolFilter from './ProtocolFilter'
import DomainList from './DomainList'
import FullSelector from './FullSelector'

import LocalStore, { State } from './store'

import './style.less'

export { createState, getValue, State } from './store'

export interface IProps {
  withTags?: boolean
  showFullCheck?: boolean
  queryParams?: Partial<IQueryParams>
  state: State
}

export default observer(function DomainSelector(props: IProps) {
  const store = useLocalStore(LocalStore, props)

  const selectorCnt = (
    <>
      <DomainFilter
        state={store.props.state.$.domainFilter}
        onSearch={store.searchDomains}
      />
      <ProtocolFilter
        state={store.props.state.$.protocolFilter}
      />
      <DomainList
        loading={store.isLoading}
        domainList={store.domainsForSelect}
        state={store.props.state.$.domains}
      />
      <FullSelector
        total={store.total}
        maxDomainCount={MAX_DOMAIN_COUNT}
        state={store.props.state.$.fullSelector}
        showFullCheck={props.showFullCheck}
      />
    </>
  )

  const handleVisibleChange = useCallback((visible: boolean) => {
    if (visible) {
      store.reorderDomains()
    }
  }, [store])

  return (
    <div className="comp-domain-selector">
      <Input.Group compact>
        {
          store.shouldShowTags && (
            <SimpleTagSelector
              style={{ marginRight: '8px' }}
              state={store.props.state.$.tags}
            />
          )
        }
        <DomainSelectorContainer
          content={selectorCnt}
          onVisibleChange={handleVisibleChange}
        >
          <DomainSelectorSummary
            isLoading={store.isLoading}
            isFullDomainChecked={store.isFullDomainChecked}
            selectedTagCount={store.selectedTags.length}
            selectedDomainCount={store.selectedDomains.length}
          />
        </DomainSelectorContainer>
      </Input.Group>
    </div>
  )
})

interface DomainSelectorSummaryProps {
  isLoading: boolean
  selectedTagCount: number
  selectedDomainCount: number
  isFullDomainChecked: boolean
}

function DomainSelectorSummary({
  isLoading,
  selectedTagCount,
  selectedDomainCount,
  isFullDomainChecked
}: DomainSelectorSummaryProps) {
  const i18n = useInjection(I18nStore)
  return (
    <Select
      loading={isLoading}
      style={{ width: 200 }}
      value={getSummary(i18n, selectedTagCount, selectedDomainCount, isFullDomainChecked)}
      dropdownRender={() => <span></span>}
    />
  )
}

const messages = {
  fulldomainChecked: {
    cn: '已选择全量域名',
    en: 'All domain names selected'
  },
  domainSelected: {
    cn: (num: number) => `已选 ${num} 个域名`,
    en: (num: number) => `${num} domain names selected.`
  },
  pleaseSelectDomain: {
    cn: '请选择域名',
    en: 'Please select a domain name'
  }
}

function getSummary(
  i18n: I18nStore,
  selectedTagCount: number,
  selectedDomainCount: number,
  isFullDomainChecked: boolean
) {
  if (isFullDomainChecked) {
    return i18n.t(messages.fulldomainChecked)
  }
  if (selectedDomainCount > 0) {
    return i18n.t(messages.domainSelected, selectedDomainCount)
  }
  if (selectedTagCount > 0) {
    return i18n.t(messages.domainSelected, 0)
  }
  return i18n.t(messages.pleaseSelectDomain)
}

interface DomainSelectorContainerProps extends Pick<PopoverProps, 'onVisibleChange'> {
  content: ReactNode
  children: ReactNode
}

function DomainSelectorContainer({
  content,
  children,
  onVisibleChange
}: DomainSelectorContainerProps) {
  return (
    <div className="comp-domain-selector">
      <Popover
        trigger="click"
        placement="bottomLeft"
        onVisibleChange={onVisibleChange}
        overlayClassName="domain-selector-overlay"
        content={<div className="domain-selector">{content}</div>}
        autoAdjustOverflow={false}
      >
        <div>
          {children}
        </div>
      </Popover>
    </div>
  )
}
