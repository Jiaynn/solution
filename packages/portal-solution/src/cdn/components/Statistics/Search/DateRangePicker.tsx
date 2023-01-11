import React from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'

import { useTranslation } from 'portal-base/common/i18n'
import DatePicker, { PickerProps } from 'react-icecream/lib/date-picker'

import * as messages from './messages'
import { getLatestDuration } from 'cdn/transforms/datetime'

type Moment = moment.Moment
const RangePicker = DatePicker.RangePicker

export interface IDateRangePickerProps {
  value: [Moment, Moment]

  onChange: (dates: [Moment, Moment]) => void

  /** 限制起始时间从当前时间往前推 n 天 */
  disableDays?: number
}

export default observer(function DateRangePicker(props: IDateRangePickerProps) {
  const t = useTranslation()
  const now = moment()

  const shortcuts = {
    [t(messages.today)]: getLatestDuration(now, 0, 'day'),
    [t(messages.yesterday)]: getLatestDuration(now, 1, 'day'),
    [t(messages.lastNDays, 7)]: getLatestDuration(now, 7, 'day'),
    [t(messages.thisMonth)]: [moment(now).startOf('month'), now],
    [t(messages.lastNDays, 30)]: getLatestDuration(now, 30, 'day')
  }

  const disabledDate: PickerProps['disabledDate'] = current => (current == null
    ? false
    : (
        current.unix() > now.unix()
        || (props.disableDays != null && current.unix() < now.clone().subtract(props.disableDays, 'day').unix())
      )
  )

  return (
    <RangePicker
      allowClear={false}
      value={props.value}
      onChange={props.onChange}
      ranges={shortcuts as any}
      style={{ width: 240 }}
      disabledDate={disabledDate}
    />
  )
})
