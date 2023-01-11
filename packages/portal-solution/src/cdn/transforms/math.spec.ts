import { validateWithMap } from 'cdn/test/utils'

import { enhancedDivision } from './math'

describe('enhancedDivision works correctly', () => {
  it('with given value', () => {
    const ioArray = [
      {
        input: [0, 0],
        output: 0
      },
      {
        input: [0, 1],
        output: 0
      },
      {
        input: [1, 0],
        output: 0
      },
      {
        input: [1, 1],
        output: 1
      }
    ]

    validateWithMap(enhancedDivision, ioArray)
  })
})
