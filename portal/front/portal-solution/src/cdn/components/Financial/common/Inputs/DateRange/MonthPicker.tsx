/**
 * @file month picker component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'
import { FieldState, bindInput } from 'formstate-x'
import DatePicker from 'react-icecream/lib/date-picker'
import Form, { FormItemProps } from 'react-icecream/lib/form'
import { bindFormItem } from 'portal-base/common/form'

export type Value = moment.Moment

export type State = FieldState<Value>

const defaultValue: Value = moment()

export function createState(value: Value = defaultValue) {
  return new FieldState(value).disableValidationWhen(() => true)
}

export function getStateValue(state: State) {
  return state.value
}

export interface IProps extends FormItemProps {
  state: State
}

export default observer(function DateRange(props: IProps) {
  const { state, ...restProps } = props

  return (
    <Form.Item
      label="月份"
      colon={false}
      {...restProps}
      {...bindFormItem(state)}
    >
      <DatePicker.MonthPicker
        allowClear={false}
        placeholder="请选择月份"
        style={{ width: '100%' }}
        format="YYYY-MM"
        disabledDate={date => (date ? date.isAfter(moment().subtract(1, 'month')) : false)}
        {...bindInput(state)}
      />
    </Form.Item>
  )
})
