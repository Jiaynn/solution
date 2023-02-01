import moment from 'moment'

import { humanizeTimeStamp, humanizeTimeUTC, getDiffHour, getFirstDayOfNextMonth } from './datetime'

describe('humanizeTimeStamp works correctly', () => {
  it('without format', () => {
    const result = humanizeTimeStamp(moment('2018-01-01 20:00:01').valueOf())
    expect(result).toBe('2018-01-01 20:00:01')
  })

  it('with format', () => {
    const result = humanizeTimeStamp(moment('2018-01-01 20:00:01').valueOf(), 'YYYY/MM/DD')
    expect(result).toBe('2018/01/01')
  })
})

describe('humanizeTimeUTC works correctly', () => {
  it('without format', () => {
    const result = humanizeTimeUTC(moment('2018-01-01 20:00:01').valueOf())
    expect(result).toBe('2018-01-01 20:00:01')
  })

  it('with format', () => {
    const result = humanizeTimeUTC(moment('2018-01-01 20:00:01').valueOf(), 'YYYY/MM/DD')
    expect(result).toBe('2018/01/01')
  })
})

describe('getDiffHour', () => {
  it('with the same moment should return 0', () => {
    const result = getDiffHour(moment(), moment())
    expect(result).toBe(0)
  })

  it('should return 3 hour', () => {
    const result = getDiffHour(moment('2019-05-14 10:10:10'), moment('2019-05-14 13:10:10'))
    expect(result).toBe(3)
  })
})

describe('getFirstDayOfNextMonth', () => {
  it('without format', () => {
    const result = getFirstDayOfNextMonth(moment('2018-01-01 20:00:01'))
    expect(result).toBe('2 月 1 日')
  })
})
