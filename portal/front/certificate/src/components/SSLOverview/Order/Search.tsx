/*
 * @file component Search of Order
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
import { bindFormItem, bindSelect, bindTextInput } from 'portal-base/common/form'

import { orderStatusTextMap, sslType, sslMap, SslBrand, CertType, OrderStatus } from '../../../constants/ssl'
import { IQueryOrdersParams } from '../../../apis/ssl'
import { notEmpty } from '../../../utils/validate'

import './style.less'

const { Option, OptGroup } = Select
const { RangePicker } = DatePicker

export type IValue = IQueryOrdersParams

export type IState = FormState<{
  keyword: FieldState<string>
  orderStatus: FieldState<number>
  productShortName: FieldState<string>
  timeRange: FieldState<[moment.Moment | null, moment.Moment | null]>
}>

const defaultSearch: IQueryOrdersParams = {
  keyword: '',
  state: -1,
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
    orderStatus: new FieldState(value.state ?? -1),
    productShortName: new FieldState(value.productShortName!).validators(
      productShortNameValue => notEmpty(productShortNameValue, '证书类型')
    ),
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
    state: state.value.orderStatus,
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
  return (
    <Form layout="inline" className="search-wrapper">
      <Form.Item label="订单状态" {...bindFormItem(state.$.orderStatus)}>
        <Select style={{ width: 160 }} {...bindSelect<number>(state.$.orderStatus)}>
          {getOrderStatusOptions()}
        </Select>
      </Form.Item>
      <Form.Item label="证书类型" {...bindFormItem(state.$.productShortName)}>
        <Select style={{ width: 180 }} {...bindSelect<string>(state.$.productShortName)}>
          {getProductShortNameOptions()}
        </Select>
      </Form.Item>
      <Form.Item label="创建时间">
        <RangePicker onChange={(dates: [moment.Moment, moment.Moment]) => state.$.timeRange.onChange(dates)} />
      </Form.Item>
      <Form.Item label="关键字" {...bindFormItem(state.$.keyword)}>
        <Input placeholder="请输入关键字" {...bindTextInput(state.$.keyword)} />
      </Form.Item>
      <Form.Item>
        <Button onClick={onSearch} type="primary">查询</Button>
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

function getOrderStatusOptions() {
  const baseOptions = [
    <Option key={-1} value={-1}>全部</Option>
  ]
  const statusOptions = Object.keys(orderStatusTextMap).map(status => (
    <Option key={status} value={status}>{orderStatusTextMap[status as unknown as OrderStatus]}</Option>
  ))
  return baseOptions.concat(statusOptions)
}
