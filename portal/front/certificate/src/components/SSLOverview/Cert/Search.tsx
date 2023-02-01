/*
 * @file component Search of Cert
 * @author zhu hao <zhuhao@qiniu.com>
 */

import { FieldState, FormState } from 'formstate-x'
import moment from 'moment'
import React from 'react'
import { observer } from 'mobx-react'

import Form from 'react-icecream/lib/form'
import Input from 'react-icecream/lib/input'
import Select from 'react-icecream/lib/select'
import DatePicker from 'react-icecream/lib/date-picker'
import Button from 'react-icecream/lib/button'
import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'
import { bindFormItem, bindSelect, bindTextInput } from 'portal-base/common/form'
import { useTranslation } from 'portal-base/common/i18n'

import { sslType, sslMap, SslBrand, CertType } from '../../../constants/ssl'
import { isOEM } from '../../../constants/env'
import { notEmpty } from '../../../utils/validate'

import * as messages from './messages'

const { Option, OptGroup } = Select
const { RangePicker } = DatePicker

export type IValue = {
  keyword?: string
  productShortName?: string
  startTime?: number
  endTime?: number
}

export type IState = FormState<{
  keyword: FieldState<string>
  productShortName: FieldState<string>
  timeRange: FieldState<[moment.Moment | null, moment.Moment | null]>
}>

const defaultSearch: IValue = {
  keyword: undefined,
  productShortName: '-1',
  startTime: undefined,
  endTime: undefined
}

export function createState(value?: IValue): IState {
  value = {
    ...defaultSearch,
    ...value
  }
  return new FormState({
    keyword: new FieldState(value.keyword ?? ''),
    productShortName: new FieldState(value.productShortName!)
      .validators(productShortNameValue => notEmpty(productShortNameValue, '证书类型')),
    timeRange: new FieldState([
      value.startTime ? moment(value.startTime) : null,
      value.endTime ? moment(value.endTime) : null
    ])
  })
}

export function getValue(state: IState): IValue {
  const timeRange = state.value.timeRange
  return {
    keyword: state.value.keyword,
    productShortName: state.value.productShortName,
    startTime: timeRange && timeRange[0] ? timeRange[0].unix() : undefined,
    endTime: timeRange && timeRange[1] ? timeRange[1].unix() : undefined
  }
}

export interface ISearchProps {
  state: IState
  onSearch: () => void
}

export default observer(function _Search(props: ISearchProps) {
  const { state, onSearch } = props
  const t = useTranslation()

  return (
    <Form layout="inline" className="search-wrapper">
      {
        !isOEM && (
          <Form.Item label="证书类型" {...bindFormItem(state.$.productShortName)}>
            <Select style={{ width: 180 }} {...bindSelect<string>(state.$.productShortName)}>
              {getProductShortNameOptions()}
            </Select>
          </Form.Item>
        )
      }
      <Form.Item label={t(messages.createdAt)}>
        <RangePicker onChange={(dates: [moment.Moment, moment.Moment]) => state.$.timeRange.onChange(dates)} />
      </Form.Item>
      <Form.Item label={t(messages.keyword)} {...bindFormItem(state.$.keyword)}>
        <Input placeholder={t(messages.keywordPlaceholder)} {...bindTextInput(state.$.keyword)} />
      </Form.Item>
      <Form.Item>
        <Button onClick={onSearch} type="primary">{t(messages.search)}</Button>
        <Tooltip title={t(messages.certListTips)}>
          <Icon className="info-tip" type="info-circle" />
        </Tooltip>
      </Form.Item>
    </Form>
  )
})

function getProductShortNameOptions() {
  const baseOptions = [
    <Option key="-1" value="-1">全部</Option>,
    <Option key="USER" value="USER">自有</Option>
  ]
  const optGroups = Object.keys(sslMap).map((brandName: SslBrand) => (
    <OptGroup key={brandName} label={brandName}>
      {
        Object.keys(sslMap[brandName])
          .filter((cert: CertType) => sslMap[brandName][cert]!.isSelling)
          .map((cert: CertType) => (
            <Option
              key={`${brandName}.${cert}`}
              value={sslMap[brandName][cert]!.shortName}
            >
              {`${sslType[cert].text}(${sslType[cert].code})`}
            </Option>
          ))
      }
    </OptGroup>
  ))
  return baseOptions.concat(optGroups)
}
