/**
 * @desc Search form items.
 * @author hovenjay <hovenjay@outlook.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { Select, SelectOption, TextInput } from 'react-icecream-2/form-x'

import { SearchType } from 'kodo/routes/bucket'

import styles from './style.m.less'

export interface SearchNameInputProps {
  width: number
  dataSource: string[]
  fieldState: FieldState<string | null>
}

export const SearchNameInput = observer(
  ({ width, fieldState, dataSource }: SearchNameInputProps) => (
    <Select
      clearable
      searchable
      state={fieldState}
      placeholder="请输入空间名称"
      style={{ flex: `0 0 ${width}px` }}
    >
      {dataSource.map(item => (
        <SelectOption key={item} value={item}>
          <div className={styles.selectContent}>{item}</div>
        </SelectOption>
      ))}
    </Select>
  )
)

export interface SearchTagInputProps {
  width: number
  fieldState: FieldState<string>
  placeholder?: string
}

export const SearchTagInput = observer(
  ({ width, fieldState, placeholder }: SearchTagInputProps) => (
    <TextInput
      state={fieldState}
      placeholder={placeholder}
      style={{ flex: `0 0 ${width}px` }}
    />
  )
)

export interface SearchTypeSelectProps {
  width: number
  fieldState: FieldState<SearchType>
}

export const SearchTypeSelect = observer(
  ({ width, fieldState }: SearchTypeSelectProps) => (
    <Select state={fieldState} style={{ flex: `0 0 ${width}px` }}>
      <SelectOption value="name">空间名称</SelectOption>
      <SelectOption value="tag">标签</SelectOption>
    </Select>
  )
)
