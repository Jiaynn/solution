/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @file ts tests for utils
 * @author yinxulai <me@yinxulai.com>
 */

import { keysOfEnum, valuesOfEnum } from './ts'

// 屏蔽 cli 的 warn 信息
// TODO: 优化，收集核对 warn 信息
// 考虑并发问题，无法对 global console 下手，暂时也不改造实现，因此这里只简单统计总个数
let expectedConsoleWarnToCallCount = 0
let consoleWarnCalledCount = 0
const mockedConsoleWarn = jest.fn(() => { consoleWarnCalledCount++ })
jest.spyOn(console, 'warn').mockImplementation(mockedConsoleWarn)

describe('test keysOfEnum and valuesOfEnum', () => {
  it('test undefined', () => {
    expect(undefined).toBeUndefined()
    // eslint-disable-next-line no-void
    expect(undefined).toBe(void 0)
    expect(typeof undefined).toBe('undefined')
  })

  it('test Sample1', () => {
    enum Sample1 {
      NaN = 123,
      f = Number.NaN,
      Infinity = 1,
      g = Infinity,
      h = -Infinity
    }
    const Sample1Keys = ['1', '123', 'f', 'g', 'h']
    const Sample1Values = ['Infinity', 'NaN', NaN, Infinity, -Infinity]

    expect(keysOfEnum(Sample1)).toEqual(Sample1Keys)
    expectedConsoleWarnToCallCount += 3

    expect(valuesOfEnum(Sample1)).toEqual(Sample1Values)
    expectedConsoleWarnToCallCount += 3
  })

  it('test Sample2', () => {
    enum Sample2 {
      NaN = 101,
      Infinity = 101,
      undefined = 101,
      m = 'NaN'
    }

    const Sample2Keys = ['NaN', 'Infinity', 'undefined', 'm']
    const Sample2Values = [101, 101, 101, 'NaN']

    expect(keysOfEnum(Sample2)).toEqual(Sample2Keys)
    expectedConsoleWarnToCallCount++

    expect(valuesOfEnum(Sample2)).toEqual(Sample2Values)
    expectedConsoleWarnToCallCount++
  })

  it('test Sample3', () => {
    enum Sample3 {
      a,
      b = 9,
      c,
      d = 0,
      e = '0',
      g = 'f',
      f = 'a'
    }

    const Sample3Keys = ['a', 'b', 'c', 'd', 'e', 'g', 'f']
    const Sample3Values = [0, 9, 10, 0, '0', 'f', 'a']

    expect(keysOfEnum(Sample3)).toEqual(Sample3Keys)
    expectedConsoleWarnToCallCount++

    expect(valuesOfEnum(Sample3)).toEqual(Sample3Values)
    expectedConsoleWarnToCallCount++
  })

  it('test Sample4', () => {
    enum Sample4 {
      a = 1,
      b = a
    }

    const Sample4Keys = ['a', 'b']
    const Sample4Values = [1, 1]

    expect(keysOfEnum(Sample4)).toEqual(Sample4Keys)
    expectedConsoleWarnToCallCount++

    expect(valuesOfEnum(Sample4)).toEqual(Sample4Values)
    expectedConsoleWarnToCallCount++
  })

  it('test Sample5', () => {
    enum Sample5 {
      undefined = null as any,
      null = undefined
    }

    const Sample5Keys = ['undefined']
    const Sample5Values = [null]

    expect(keysOfEnum(Sample5)).toEqual(Sample5Keys)
    expectedConsoleWarnToCallCount++

    expect(valuesOfEnum(Sample5)).toEqual(Sample5Values)
    expectedConsoleWarnToCallCount++
  })
})

afterAll(() => {
  expect(consoleWarnCalledCount).toBe(expectedConsoleWarnToCallCount)
})
