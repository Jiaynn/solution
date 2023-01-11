/**
 * @file DomainFilter Component
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import { bindFormItem, bindTextInput } from 'portal-base/common/form'
import { useTranslation } from 'portal-base/common/i18n'

import './style.less'

const inputPlaceholderMsg = {
  cn: '请输入关键词查询域名',
  en: 'Search domain names by keywords.'
}

export interface IProps {
  onSearch: () => void
  state: FieldState<string>
}

export default observer(function DomainFilter(props: IProps) {
  const { state, onSearch } = props

  const t = useTranslation()

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      onSearch()
    },
    [onSearch]
  )

  return (
    <div className="comp-domain-filter">
      <Form onSubmit={handleSubmit}>
        <Form.Item style={{ marginBottom: 0 }} {...bindFormItem(state)}>
          <Input.Search
            allowClear
            placeholder={t(inputPlaceholderMsg)}
            {...bindTextInput(state)}
          />
        </Form.Item>
      </Form>
    </div>
  )
})
