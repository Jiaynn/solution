import { keys } from 'lodash'

import moment from 'moment'

import { validateWithMap } from 'cdn/test/utils'

import { summaryNameMap, SearchType } from 'cdn/constants/statistics'

import { allTrafficProtocols } from 'cdn/constants/domain'

import { allTrafficRegions } from 'cdn/constants/traffic-region'

import { IGetTrafficUserOptions } from 'cdn/apis/statistics'

import {
  getFreqByDiffHour,
  humanizeUsageSummaryName,
  checkOptions,
  sumTrafficPoints,
  calcTrafficUserTimeRange,
  checkOptionsMsgs
} from './statistics'

describe('humanizeUsageSummaryName works correctly', () => {
  it('with given value', () => {
    const ioArray = keys(summaryNameMap).map(
      name => ({
        input: [name],
        output: summaryNameMap[name]
      })
    ).concat({
      input: ['dont_exist'],
      output: {
        cn: '未知',
        en: 'Unknown'
      }
    })

    validateWithMap(humanizeUsageSummaryName, ioArray)
  })
})

describe('getFreqByDiffHour', () => {
  it('with 0 should return 5min', () => {
    const result = getFreqByDiffHour(0)
    expect(result).toBe('5min')
  })

  it('less than 14*24 should return 1hour', () => {
    const result = getFreqByDiffHour(10 * 24)
    expect(result).toBe('1hour')
  })

  it('greater then or equal to 14*24 should return 1day', () => {
    const result = getFreqByDiffHour(15 * 24)
    expect(result).toBe('1day')
  })
})

describe('checkOptions', () => {
  it('empty options', () => {
    const result = checkOptions({}, SearchType.Flow)
    expect(result).toEqual(checkOptionsMsgs.emptyOptions)
  })

  it('empty domains', () => {
    const result = checkOptions({ trafficRegions: ['oc'] }, SearchType.Flow)
    expect(result).toEqual(checkOptionsMsgs.emptyDomains)
  })

  it('empty startDate or endDate', () => {
    const result = checkOptions({ domains: ['www.qiniu.com'] }, SearchType.Flow)
    expect(result).toEqual(checkOptionsMsgs.emptyDateRange)
  })

  it('empty regions', () => {
    const result = checkOptions({ domains: ['www.qiniu.com'], startDate: moment().add('day', -7), endDate: moment() }, SearchType.Top)
    expect(result).toEqual(checkOptionsMsgs.emptyRegions)
  })
})

describe('transform traffic points', () => {
  it('sum traffic points', () => {
    const result = sumTrafficPoints({
      data: {
        cdnPoints: [2, 3],
        dcdnPoints: [1, 2],
        pcdnPoints: [0, 0],
        time: [1609430400000, 1609516800000],
        '302Points': [0, 0],
        '302Points+': [0, 0]
      },
      stats: {
        peak: { time: 1609430400000, value: 1024 },
        peak95: { time: 1609430400000, value: 1024 },
        peak95Avrage: 2048,
        peakAvrage: 2048
      }
    })
    expect(result).toBe(8)
  })
})

describe('transform traffic user options', () => {
  const options: IGetTrafficUserOptions = {
    start: '2021-07-12',
    end: '2021-07-13',
    type: 'flux',
    protocol: allTrafficProtocols,
    region: allTrafficRegions
  }

  it('5min interval time range', () => {
    const result = calcTrafficUserTimeRange({ ...options, g: '5min' })
    expect(result.length).toBe(288)
  })

  it('hour interval time range', () => {
    const result = calcTrafficUserTimeRange({ ...options, g: 'hour' })
    expect(result.length).toBe(24)
  })

  it('day interval time range', () => {
    const result = calcTrafficUserTimeRange({ ...options, g: 'day' })
    expect(result.length).toBe(1)
  })
})
