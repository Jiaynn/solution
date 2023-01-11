/**
 * @desc test statistic transform functions
 * @author hovenjay <hovenjay@outlook.com>
 */

import { getRangesByInterval } from './statistics'

it('test ranges by interval', () => {
  // 最小值
  expect(getRangesByInterval(0, 0)).toEqual([])
  // 非整除的情况
  expect(getRangesByInterval(0, 144)).toEqual([0])
  expect(getRangesByInterval(135, 144)).toEqual([0, 135])
  expect(getRangesByInterval(155, 144)).toEqual([0, 144, 155])
  expect(getRangesByInterval(1000, 144)).toEqual([0, 144, 288, 432, 576, 720, 864, 1000])
  // 整除的情况
  expect(getRangesByInterval(100, 25)).toEqual([0, 25, 50, 75, 100])
  expect(getRangesByInterval(1000, 200)).toEqual([0, 200, 400, 600, 800, 1000])
})
