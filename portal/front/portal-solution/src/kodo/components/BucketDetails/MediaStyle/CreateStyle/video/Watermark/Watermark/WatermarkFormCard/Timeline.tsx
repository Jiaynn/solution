/**
 * @description timeline component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { FormItem, Switch, Select, NumberInput } from 'react-icecream-2/form-x'
import { InputGroup, InputGroupItem, PopupContainerProvider, SelectOption } from 'react-icecream-2'

import { integerValidator, rangeValidator, requiredValidator } from 'kodo/utils/form'

import Prompt from 'kodo/components/common/Prompt'
import TimeInput from './TimeInput'

import styles from './style.m.less'

export enum TimelineType {
  Same = 'Same',
  Forward = 'Forward',
  Reverse = 'Reverse'
}

const formItemLayout = {
  labelWidth: '70px',
  layout: 'horizontal'
} as const

const timelineTypes = [
  TimelineType.Same,
  TimelineType.Forward,
  TimelineType.Reverse
]

export const timelineTextMap = {
  [TimelineType.Same]: '与源文件时长一致',
  [TimelineType.Forward]: '从片头开始（正向）',
  [TimelineType.Reverse]: '从片尾开始（反向）'
}

export function createHoursField(initVal = 0) {
  return new FieldState(initVal).validators(
    requiredValidator('请输入小时'),
    rangeValidator([0, 50], '小时不在范围内'),
    integerValidator('小时请输入整数')
  )
}

export function createMinutesField(initVal = 0) {
  return new FieldState(initVal).validators(
    requiredValidator('请输入分钟'),
    rangeValidator([0, 59], '分钟不在范围内'),
    integerValidator('分钟请输入整数')
  )
}

export function createSecondsField(initVal = 0) {
  return new FieldState(initVal).validators(
    requiredValidator('请输入秒'),
    rangeValidator([0, 59], '秒不在范围内'),
    integerValidator('秒请输入整数')
  )
}

interface Props {
  type: FieldState<TimelineType>
  startHours: FieldState<number>
  startMinutes: FieldState<number>
  startSeconds: FieldState<number>
  duration: FieldState<number | null>
  shortest: FieldState<boolean>
  disabled?: boolean
  style?: React.CSSProperties
}

export default observer(function Timeline(props: Props) {
  const { type, startHours, startMinutes, startSeconds, duration, shortest, disabled } = props
  const domRef = React.useRef<HTMLDivElement>(null)
  const showMore = type.value !== TimelineType.Same

  const timeFieldView = type.value === TimelineType.Forward && (
    <TimeInput
      hour={startHours}
      minute={startMinutes}
      second={startSeconds}
      disabled={disabled}
    />
  )

  const durationFiledView = (
    <FormItem
      required
      state={duration}
      label="持续时间"
      {...formItemLayout}
      className={styles.duration}
    >
      <InputGroup style={{ width: '112px' }}>
        <NumberInput
          digits={0}
          min={1}
          state={duration}
          placeholder="0 - 59"
          disabled={props.disabled}
        />
        <InputGroupItem>秒</InputGroupItem>
      </InputGroup>
    </FormItem>
  )

  const shortestNoticeView = <Prompt>不开启时，水印持续时间若超出视频时长范围、处理将会失败</Prompt>

  const shortestFieldView = (
    <FormItem
      state={shortest}
      {...formItemLayout}
      label="调整到视频范围内"
      tip={shortestNoticeView}
      labelVerticalAlign="text"
      className={styles.shortest}
    >
      <Switch
        state={shortest}
        disabled={disabled}
        checkedChildren="开"
        unCheckedChildren="关"
      />
    </FormItem>
  )

  return (
    <FormItem label="水印时长" style={props.style} {...formItemLayout}>
      <div ref={domRef}>
        <PopupContainerProvider containerRef={domRef}>
          <Select className={styles.timelineType} state={type}>
            {timelineTypes.map(ty => (
              <SelectOption key={ty} value={ty}>{timelineTextMap[ty]}</SelectOption>
            ))}
          </Select>
        </PopupContainerProvider>
      </div>
      {showMore && (
        <>
          {timeFieldView}
          {durationFiledView}
          {shortestFieldView}
        </>
      )}
    </FormItem>
  )
})
