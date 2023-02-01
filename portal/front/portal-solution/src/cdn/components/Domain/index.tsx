/**
 * @file 域名管理页
 * @author linchen <gakiclin@gmail.com>
 */

import React, { useCallback } from 'react'
import { observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'
import Page from 'portal-base/common/components/Page'

import { shouldForbidOperation } from 'cdn/transforms/domain'

import Header from './Header'
import DomainList, { IFilterOptions } from './List'
import LocalStore from './store'

import './style.less'

export interface IProps {
}

export default observer(function DomainManager(props: IProps) {
  const store = useLocalStore(LocalStore, props)

  const handleTableChange = useCallback((_: unknown, filters: IFilterOptions) => {
    store.updateFilterOptions(filters)
  }, [store])

  return (
    <Page>
      <Header
        state={store.searchState}
        onRefresh={store.handleRefresh}
        batchUpdateVisible={store.batchUpdateVisible}
        selectedDomains={store.selectedDomains}
      />
      <DomainList
        domainList={store.domainList}
        loading={store.isLoading}
        pagination={store.paginationConfig}
        onChange={handleTableChange}
        onUpdate={store.handleRefresh}
        filterOptions={store.filterOptions}
        {...(store.batchUpdateVisible && {
          rowSelection: {
            selectedRowKeys: store.selectedDomainNames,
            onChange: store.updateSelectedDomains,
            getCheckboxProps: domain => ({
              disabled: !!shouldForbidOperation(domain)
            })
          }
        })}
      />
    </Page>
  )
})
