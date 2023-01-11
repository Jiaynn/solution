import { getPositiveNumber } from './index'

it('getPositiveNumber should work well', () => {
  expect(getPositiveNumber(3)).toBe(3)
  expect(getPositiveNumber(0)).toBe(0)
  expect(getPositiveNumber(-1)).toBe(0)
})
