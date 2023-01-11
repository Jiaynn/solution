/**
 * @file Financial Bill SearchBar Component
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import moment from 'moment'
import Form from 'react-icecream/lib/form'
import { PickerProps } from 'react-icecream/lib/date-picker'

import * as dateRangeInput from '../Inputs/DateRange'

import './style.less'

const MonthRangePicker = dateRangeInput.MonthRangePicker

type State = dateRangeInput.State
type Value = dateRangeInput.Value

const defaultMonthRange: Value = [moment().subtract(5, 'month'), moment().subtract(1, 'month')]

export function createState(): State {
  return dateRangeInput.createState(defaultMonthRange)
}

export function getValue(state: State): Value {
  return dateRangeInput.getValue(state)
}

export interface IProps {
  state: State
  size?: PickerProps['size']
}

export default function SearchBar(props: IProps) {
  return (
    <Form layout="inline" className="comp-bill-searchbar">
      <MonthRangePicker label="" rangePicker={{ size: props.size }} state={props.state} />
    </Form>
  )
}
