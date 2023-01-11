/**
 * @file Financial User SearchBar Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'

import SearchAccountInput, * as searchAccountInput from '../common/Inputs/SearchAccountInput'

import './style.less'

export { State, createState, getValue } from '../common/Inputs/SearchAccountInput'

export interface IProps {
  state: searchAccountInput.State
}

export default function SearchBar(props: IProps) {
  return (
    <div className="comp-financial-user-searchbar">
      <SearchAccountInput state={props.state} />
    </div>
  )
}
