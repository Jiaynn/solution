/**
 * @file Financial Bill Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useLocalStore } from 'qn-fe-core/local-store'

import SearchBar from './SearchBar'
import ListView from './ListView'

import { IProps, LocalStore } from './store'

import './style.less'

export default observer(function Bill(props: IProps) {

  const store = useLocalStore(LocalStore, props)

  return (
    <div className="comp-bill">
      <SearchBar size={props.size} state={store.formState} />
      <ListView
        size={props.size}
        pagination={store.pagination}
        loading={store.isLoading}
        dataSource={store.billList}
      />
    </div>
  )
})
