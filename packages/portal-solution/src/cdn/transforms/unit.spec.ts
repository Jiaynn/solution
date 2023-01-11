import { I18nStore } from 'portal-base/common/i18n'

import { createContainer } from 'test'

import { validateWithMap, validateWithMessageMap } from 'cdn/test/utils'

import {
  humanizeBandwidth, humanizeTraffic, humanizeReqcount,
  humanizePercent, humanizePercent100, humanizeSpeed,
  humanizeEntries, transformStorageSize, humanizeFilesize,
  humanizeDuration, splitMixedValue
} from './unit'

const inputValues = [0, 5, 2048, 1048576, 1073741824, 1099511627776]

describe('humanizeBandwidth works correctly', () => {
  it('with given value', () => {
    const ioArray = [{
      input: [inputValues[0]],
      output: '0 bps'
    }, {
      input: [inputValues[1]],
      output: '5 bps'
    }, {
      input: [inputValues[2]],
      output: '2.0480 Kbps'
    }, {
      input: [inputValues[3]],
      output: '1.0486 Mbps'
    }, {
      input: [inputValues[4]],
      output: '1073.7418 Mbps'
    }, {
      input: [inputValues[5]],
      output: '1099511.6278 Mbps'
    }]

    validateWithMap(humanizeBandwidth, ioArray)
  })
})

describe('humanizeTraffic works correctly', () => {
  it('with given value', () => {
    const ioArray = [{
      input: [inputValues[0]],
      output: '0 B'
    }, {
      input: [inputValues[1]],
      output: '5 B'
    }, {
      input: [inputValues[2]],
      output: '2 KB'
    }, {
      input: [inputValues[3]],
      output: '1 MB'
    }, {
      input: [inputValues[4]],
      output: '1 GB'
    }, {
      input: [inputValues[5]],
      output: '1024 GB'
    }, {
      input: [2049, 2],
      output: '2.00 KB'
    }]

    validateWithMap(humanizeTraffic, ioArray)
  })
})

describe('humanizeReqcount works correctly', () => {
  it('with given value', () => {
    const ioArray = [{
      input: [inputValues[0]],
      output: '0 次'
    }, {
      input: [inputValues[1]],
      output: '5 次'
    }, {
      input: [inputValues[2]],
      output: '2.048 千次'
    }, {
      input: [inputValues[3]],
      output: '1048.576 千次'
    }, {
      input: [inputValues[4]],
      output: '1073741.824 千次'
    }, {
      input: [inputValues[5]],
      output: '1099511627.776 千次'
    }]
    const container = createContainer()
    const i18n = container.get(I18nStore)
    validateWithMessageMap(i18n.t, humanizeReqcount, ioArray)
  })
})

describe('humanizePercent works correctly', () => {
  it('with given value', () => {
    const ioArray = [{
      input: [0],
      output: '0%'
    }, {
      input: [0.00001],
      output: '0.00%'
    }, {
      input: [0.05123],
      output: '5.12%'
    }, {
      input: [0.99999],
      output: '100.00%'
    }, {
      input: [2.33555],
      output: '233.56%'
    }]

    validateWithMap(humanizePercent, ioArray)
  })
})

describe('humanizePercent100 works correctly', () => {
  it('with given value', () => {
    const ioArray = [{
      input: [0],
      output: '0%'
    }, {
      input: [0.1],
      output: '0.10%'
    }, {
      input: [0.01],
      output: '0.01%'
    }, {
      input: [0.001],
      output: '0.00%'
    }, {
      input: [50.125],
      output: '50.13%'
    }]

    validateWithMap(humanizePercent100, ioArray)
  })
})

describe('humanizeSpeed works correctly', () => {
  it('with given value', () => {
    const ioArray = [{
      input: [inputValues[0]],
      output: '0 B/s'
    }, {
      input: [inputValues[1]],
      output: '5 B/s'
    }, {
      input: [inputValues[2]],
      output: '2 KB/s'
    }, {
      input: [inputValues[3]],
      output: '1 MB/s'
    }, {
      input: [inputValues[4]],
      output: '1 GB/s'
    }, {
      input: [inputValues[5]],
      output: '1024 GB/s'
    }, {
      input: [2049, 2],
      output: '2.00 KB/s'
    }, {
      input: [1500],
      output: '1.46 KB/s'
    }]

    validateWithMap(humanizeSpeed, ioArray)
  })
})

describe('humanizeEntries works correctly', () => {
  it('with given value', () => {
    const ioArray = [{
      input: [0],
      output: '0 个'
    }, {
      input: [15],
      output: '15 个'
    }, {
      input: [2.2],
      output: '2 个'
    }, {
      input: [2.5],
      output: '3 个'
    }]
    const container = createContainer()
    const i18n = container.get(I18nStore)
    validateWithMessageMap(i18n.t, humanizeEntries, ioArray)
  })
})

describe('cdn/transformstorageSize works correctly', () => {
  it('without option', () => {
    const ioArray = inputValues.map(
      val => ({ input: [val], output: val })
    )

    validateWithMap(transformStorageSize, ioArray)
  })
  it('with option', () => {
    const option = { from: 'B', to: 'MB' }
    const ioArray = [{
      input: [inputValues[0], option],
      output: 0
    }, {
      input: [inputValues[1], option],
      output: 5 * 1024 ** (-2)
    }, {
      input: [inputValues[3], option],
      output: 1
    }, {
      input: [inputValues[4], option],
      output: 1024
    }, {
      input: [inputValues[5], option],
      output: 1024 * 1024
    }]

    validateWithMap(transformStorageSize, ioArray)
  })
})

describe('humanizeFilesize works correctly', () => {
  it('with given value', () => {
    const ioArray = [{
      input: [inputValues[0]],
      output: '0 B'
    }, {
      input: [inputValues[1]],
      output: '5 B'
    }, {
      input: [inputValues[2]],
      output: '2 KB'
    }, {
      input: [inputValues[3]],
      output: '1 MB'
    }, {
      input: [inputValues[4]],
      output: '1 GB'
    }, {
      input: [inputValues[5]],
      output: '1 TB'
    }, {
      input: [2049, 2],
      output: '2.00 KB'
    }]

    validateWithMap(humanizeFilesize, ioArray)
  })
})

describe('humanizeDuration works correctly', () => {
  it('with given value', () => {
    expect(humanizeDuration(0)).toBe('0 秒')
    expect(humanizeDuration(1)).toBe('1 秒')
    expect(humanizeDuration(1.23)).toBe('1 秒')
    expect(humanizeDuration(1.5)).toBe('2 秒')
    expect(humanizeDuration(1.234, 2)).toBe('1.23 秒')
    expect(humanizeDuration(60)).toBe('1 分钟')
    expect(humanizeDuration(3600)).toBe('60 分钟')
  })
})

it('should split value correctly', () => {
  const splited1 = splitMixedValue('10KB')
  expect(splited1.value).toBe('10')
  expect(splited1.unit).toBe('KB')

  const splited2 = splitMixedValue('28.1234 pt')
  expect(splited2.value).toBe('28.1234')
  expect(splited2.unit).toBe('pt')
})
