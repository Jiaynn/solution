import React from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'

import DatePicker from 'react-icecream/lib/date-picker'

import { getLatestDuration } from 'cdn/transforms/datetime'

import { APM_START_DATE } from 'cdn/constants/apm'

type Moment = moment.Moment
const RangePicker = DatePicker.RangePicker

export interface IDateRangePickerProps {
  value: [Moment, Moment],
  onChange: (dates: [Moment, Moment]) => void
}

export default observer(function DateRangePicker(props: IDateRangePickerProps) {
  const now = moment()
  const shortcuts: Record<string, [moment.Moment, moment.Moment]> = {
    今天: getLatestDuration(now, 0, 'day'),
    昨天: [moment(now).startOf('day').subtract(1, 'day'), moment(now).startOf('day').subtract(1, 'second')],
    最近7天: getLatestDuration(now, 7, 'day'),
    本月: [moment(now).startOf('month'), now],
    最近30天: getLatestDuration(now, 30, 'day')
  }
  const ranges = Object.keys(shortcuts).filter(key => {
    const duration = shortcuts[key]
    return !duration[0].isBefore(APM_START_DATE)
  }).reduce((rangeMap, key) => {
    rangeMap[key] = shortcuts[key]
    return rangeMap
  }, {} as Record<string, [moment.Moment, moment.Moment]>)
  const disabledDate = (current?: moment.Moment) => (
    current == null
    ? false
    : (
      current.clone().startOf('day').isAfter(now)
        || current.clone().isBefore(APM_START_DATE)
    )
  )

  return (
    <RangePicker
      format="YYYY-MM-DD HH:mm"
      showTime={{ format: 'HH:mm' }}
      allowClear={false}
      value={props.value as any}
      onChange={dates => props.onChange(dates as any)}
      onOk={dates => props.onChange(dates as any)}
      ranges={ranges}
      disabledDate={disabledDate}
    />
  )
})
