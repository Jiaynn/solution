/**
 * @file Create Domain Result Component
 * @author gakiclin@gmail.com
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'
import Page from 'portal-base/common/components/Page'

import List from './List'
import Summary from './Summary'

import LocalStore from './store'

import './style.less'

export { CreateResult, ICreateDomainResult, ICreateDomainState } from './store'

export interface IProps {
  retryImmediately?: boolean
}

export default observer(function DomainCreateResult(props: IProps) {
  const store = useLocalStore(LocalStore, props)

  return (
    <Page className="comp-domain-create-result">
      <div className="create-result-content">
        <Summary status={store.resultStatus} />
        <List
          loading={store.isLoading}
          items={store.domainsForDisplay}
          status={store.resultStatus}
          onRetry={store.retryCreateDomains}
        />
      </div>
    </Page>
  )
})
