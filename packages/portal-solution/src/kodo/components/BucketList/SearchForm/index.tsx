/**
 * @desc Search form.
 * @author hovenjay <hovenjay@outlook.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { InputGroup } from 'react-icecream-2'
import { FormItem } from 'react-icecream-2/form-x'
import { FieldState, FormState } from 'formstate-x'

import { validateSearchTag } from 'kodo/transforms/bucket'

import { createTagSizeValidator, tagStringToTag } from 'kodo/transforms/bucket/setting/tag'

import { IListOptions, SearchType } from 'kodo/routes/bucket'

import { ITag } from 'kodo/apis/bucket/setting/tag'

import { SearchNameInput, SearchTagInput, SearchTypeSelect } from './form-items'

export interface SearchFormFields {
  searchType: SearchType
  searchName?: string | null
  searchTagKey?: ITag['Key']
  searchTagVal?: ITag['Value']
}

export type SearchFormState = FormState<{
  searchType: FieldState<SearchType>
  searchName: FieldState<string | null>
  searchTagKey: FieldState<ITag['Key']>
  searchTagVal: FieldState<ITag['Value']>
}>

interface SearchFormProps {
  dataSource: string[]
  formState: SearchFormState
}

export function createSearchFormState(options: IListOptions): SearchFormState {
  const tag = (options && tagStringToTag(options.searchTag))

  const Key = tag ? tag.Key : ''
  const Value = tag ? tag.Value : ''

  const searchType = new FieldState(options && options.searchType || 'name')
  const searchName = new FieldState(options && options.searchName || null)
  const searchTagKey = new FieldState<string>(Key)
  const searchTagVal = new FieldState<string>(Value)
  const formState = new FormState({
    searchType,
    searchName,
    searchTagKey,
    searchTagVal
  })

  formState.validators(value => {
    if (value.searchType === 'name') return
    if (!value.searchTagKey && value.searchTagVal) return '请输入标签键'
    return validateSearchTag('标签键', value.searchTagKey)
      || createTagSizeValidator(64, '标签键')(value.searchTagKey)
      || validateSearchTag('标签值', value.searchTagVal)
      || createTagSizeValidator(32, '标签值')(value.searchTagVal)
  })

  return formState
}

const SearchForm = observer(({ formState, dataSource }: SearchFormProps) => {
  if (!formState) return null

  const { searchType, searchName, searchTagKey, searchTagVal } = formState.$

  return (
    <FormItem layout="horizontal" state={formState}>
      <InputGroup style={{ width: '450px' }}>
        <SearchTypeSelect fieldState={searchType} width={110} />
        {searchType.value === 'name' && (
          <SearchNameInput
            width={338}
            fieldState={searchName}
            dataSource={dataSource}
          />
        )}
        {searchType.value === 'tag' && [
          (
            <SearchTagInput
              key="tag-key"
              width={169}
              fieldState={searchTagKey}
              placeholder="请输入标签键"
            />
          ),
          (
            <SearchTagInput
              key="tag-val"
              width={169}
              fieldState={searchTagVal}
              placeholder="请输入标签值"
            />
          )
        ]}
      </InputGroup>
    </FormItem>
  )
})

export default SearchForm
