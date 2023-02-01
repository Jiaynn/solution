/**
 * @file 持续x个数据点输入框
 * @author dengkui <dengkui@qiniu.com> modify by zhouhang
 */
import React from 'react'
import { FieldState } from 'formstate-x'
import { observer } from 'mobx-react'
import { FormItem, Select, SelectOption as Option } from 'react-icecream-2/form-x'

import { DataPointNumType, dataPointNumTypeOptions } from 'cdn/constants/alarm'

export type Value = DataPointNumType

export const defaultValue: Value = DataPointNumType.One

export type State = FieldState<DataPointNumType>

export function createState(value: Value = defaultValue): State {
  return new FieldState(value)
}

export function getValue(state: State): Value {
  return state.value
}

export interface Props {
  state: State
  disabled?: boolean
}

export default observer(function DataPointNumInput(props: Props) {
  return (
    <div className="data-point-number-input-wrapper">
      <FormItem>
        <Select
          state={props.state}
          disabled={props.disabled}
          className="data-point-number-input"
        >
          {dataPointNumTypeOptions.map((type, index) => (
            <Option value={type.value} key={index}>
              {type.label}
            </Option>
          ))}
        </Select>
      </FormItem>
    </div>
  )
})
