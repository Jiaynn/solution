import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { Switch } from 'react-icecream-2'
import { FormItem, InputGroup, InputGroupItem, NumberInput } from 'react-icecream-2/form-x'

import styles from './style.m.less'

const formItemLayout = {
  layout: 'horizontal'
} as const

interface Props {
  enable: FieldState<boolean>
  start: FieldState<number | null>
  duration: FieldState<number | null>
}

export const DurationRangeInput = observer(function DurationRangeInput(props: Props) {
  const { enable, start, duration } = props

  const handleSwitchChange = React.useCallback((value: boolean) => {
    enable.onChange(value)
    if (value === false) {
      start.onChange(null)
      duration.onChange(null)
    } else {
      start.onChange(0)
      duration.onChange(0.001)
    }
  }, [duration, enable, start])

  const durationInputView = React.useMemo(() => (
    <InputGroup style={{ width: '308px' }}>
      <NumberInput
        emptyValue={0.001}
        min={0.001}
        digits={3}
        state={duration}
      />
      <InputGroupItem>秒</InputGroupItem>
    </InputGroup>
  ), [duration])

  return (
    <div className={styles.root}>
      <FormItem {...formItemLayout} style={{ marginBottom: '16px' }}>
        <Switch checked={enable.value} onChange={handleSwitchChange} />
      </FormItem>
      {enable.value && (
        <FormItem label="截取长度" {...formItemLayout} state={duration}>
          {durationInputView}
        </FormItem>
      )}
    </div>
  )
})
