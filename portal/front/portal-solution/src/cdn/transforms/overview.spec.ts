import { compareTimelinePoints, compareBandwidthPoints, calculateIncrease } from './overview'

it('compare timeline points correctly', () => {
  const result = compareTimelinePoints({ previousPoints: [1, 2], currentPoints: [2, 4] })
  expect(result.total).toBe(6)
  expect(result.increase).toBe(100)
})

it('compare bandwidth points correctly', () => {
  const result = compareBandwidthPoints({ previousPoints: [1, 2], currentPoints: [2, 3] })
  expect(result.total).toBe(3)
  expect(result.increase).toBe(50)
})

it('calculate increase correctly', () => {
  expect(calculateIncrease(10, 10)).toBe(0)
  expect(calculateIncrease(0, 2.2)).toBe(100)
  expect(calculateIncrease(4, 2)).toBe(-50)
})

