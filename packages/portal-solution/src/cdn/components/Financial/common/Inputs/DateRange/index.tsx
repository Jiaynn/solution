/**
 * @file date range picker component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'
import { FieldState } from 'formstate-x'
import DatePicker, { RangePickerProps } from 'react-icecream/lib/date-picker'
import Form, { FormItemProps } from 'react-icecream/lib/form'
import { bindRangePicker, bindFormItem } from 'portal-base/common/form'

export type Value = [moment.Moment, moment.Moment]

export type State = FieldState<Value>

const defaultValue: Value = [moment().add(-7, 'days'), moment()]

export function createState(value: Value = defaultValue): State {
  return new FieldState(value)
}

export function getValue(state: State): Value {
  return state.value
}

export interface IRangePickerProps extends RangePickerProps {
  state: State
}

export const DateRangePicker = observer(function _RangePicker(props: IRangePickerProps) {
  const { state, ...restProps } = props
  return (
    <DatePicker.RangePicker
      allowClear={false}
      placeholder={['开始时间', '结束时间']}
      format="YYYY-MM-DD"
      disabledDate={date => (date ? date.isAfter(moment()) : false)}
      {...restProps}
      style={{ width: 'auto' }}
      {...bindRangePicker(state)}
    />
  )
})

export interface IProps extends FormItemProps {
  state: State
  rangePicker?: RangePickerProps,
}

export const RangePicker = observer(function _RangePicker(props: IProps) {
  const { state, rangePicker, ...restProps } = props

  return (
    <Form.Item
      colon={false}
      label={props.label || '时间范围'}
      {...bindFormItem(state)}
      {...restProps}
    >
      <DateRangePicker
        state={state}
        {...rangePicker}
      />
    </Form.Item>
  )
})

export default RangePicker

export type MonthRangePickerProps = IProps

export const defaultMonthRange: Value = [moment().subtract(1, 'month'), moment()]

export const MonthRangePicker = observer(function _MonthRange(props: MonthRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState(['month', 'month'])
  const handlePanelChange = React.useCallback((value: Value, newMode: string[]) => {
    if (newMode[0] === 'month' && newMode[1] === 'date') {
      setOpen(false)
      props.state.set(value)
    }
    setMode([newMode[0] === 'date' ? 'month' : newMode[0], newMode[1] === 'date' ? 'month' : newMode[1]])
  }, [props.state])

  const handleOnOpenChange = React.useCallback((status: boolean) => {
    if (status) {
      setOpen(true)
    }
  }, [])

  const rangePickerProps = {
    open,
    mode,
    format: 'YYYY-MM',
    onOpenChange: handleOnOpenChange,
    onPanelChange: handlePanelChange,
    ...props.rangePicker
  }

  return (
    <RangePicker {...props} rangePicker={rangePickerProps} />
  )
})
