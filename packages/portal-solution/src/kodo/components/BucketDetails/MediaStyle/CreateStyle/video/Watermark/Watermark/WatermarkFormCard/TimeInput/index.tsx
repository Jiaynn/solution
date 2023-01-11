/**
 * @description time input component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { uniq } from 'lodash'
import { observer } from 'mobx-react'
import { FieldState, Validatable } from 'formstate-x'
import { NumberInput } from 'react-icecream-2/form-x'
import { FormItem, InputGroup, InputGroupItem } from 'react-icecream-2'

import styles from './style.m.less'

const formItemLayout = {
  labelWidth: '70px',
  layout: 'horizontal'
} as const

export function bindMultipleFormItem(stateList: Array<Validatable<unknown, unknown>>) {
  const help = uniq(stateList.filter(state => state.hasError).map(state => state.error)).join('，')

  if (help) {
    return {
      validateStatus: 'error',
      help
    } as const
  }
  return { validateStatus: undefined } as const
}

export interface IProps {
  hour: FieldState<number>
  minute: FieldState<number>
  second: FieldState<number>
  className?: string
  disabled?: boolean
}

const TimeInput = observer((props: IProps) => (
  <FormItem
    required
    label="开始时间"
    {...formItemLayout}
    {...bindMultipleFormItem([props.hour, props.minute, props.second])}
    className={`${styles.timeInput} ${props.className}`}
  >
    <div className={styles.inputWrapper}>
      <InputGroup style={{ width: '112px' }}>
        <NumberInput
          digits={0}
          min={0}
          max={50}
          state={props.hour}
          placeholder="0 - 50"
          disabled={props.disabled}
        />
        <InputGroupItem>时</InputGroupItem>
      </InputGroup>
      <InputGroup style={{ width: '112px' }}>
        <NumberInput
          digits={0}
          min={0}
          max={59}
          state={props.minute}
          placeholder="0 - 59"
          disabled={props.disabled}
        />
        <InputGroupItem>分</InputGroupItem>
      </InputGroup>
      <InputGroup style={{ width: '112px' }}>
        <NumberInput
          digits={0}
          min={0}
          max={59}
          state={props.second}
          placeholder="0 - 59"
          disabled={props.disabled}
        />
        <InputGroupItem>秒</InputGroupItem>
      </InputGroup>
    </div>
  </FormItem>
))

export default TimeInput
