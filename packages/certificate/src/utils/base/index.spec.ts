import { humanizeTime } from './index'

it('transform timestamp correctly', () => {
  const time = new Date('2018-01-01 00:00:00 GMT+0800').valueOf() / 1000

  expect(humanizeTime(time)).toBe('2018-01-01 00:00:00')
  expect(humanizeTime(time, 'YYYY-MM-DD HH:mm')).toBe('2018-01-01 00:00')
})
