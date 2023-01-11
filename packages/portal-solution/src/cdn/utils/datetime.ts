import moment from 'moment'

export function isLastDayOfMonth() {
  return moment().endOf('month').format('MM-DD') === moment().format('MM-DD')
}
