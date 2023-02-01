import moment from 'moment'

export function getLatestDuration(
  end: moment.Moment,
  value: number,
  unit?: moment.unitOfTime.DurationConstructor
): [moment.Moment, moment.Moment] {
  const [startDate, endDate] = getLatestDurationWithTime(end, value, unit)
  startDate.startOf('day')
  return [startDate, endDate]
}

export function getLatestDurationWithTime(
  end: moment.Moment,
  value: number,
  unit?: moment.unitOfTime.DurationConstructor
): [moment.Moment, moment.Moment] {
  const start = moment(end).subtract(value, unit)
  return [start, end]
}

export function humanizeTimeStamp(timeStamp: number, format = 'YYYY-MM-DD HH:mm:ss') {
  return moment(timeStamp).format(format)
}

export function humanizeTimeUTC(timeUTC: string | number, format = 'YYYY-MM-DD HH:mm:ss') {
  return moment(timeUTC).format(format)
}

export function getDiffHour(start: moment.Moment, end: moment.Moment) {
  return end.diff(start, 'hour')
}

export function getDiffDays(start: moment.Moment, end: moment.Moment) {
  return end.diff(start, 'days')
}

export function getFirstDayOfNextMonth(date: moment.Moment, format = 'M 月 D 日'): string {
  return date.add(1, 'M').startOf('M').format(format)
}
