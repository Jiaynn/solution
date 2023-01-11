import { I18nStore } from 'portal-base/common/i18n'

import { createContainer } from 'test'
import { getOtherRegionNameList, getChinaRegionNameList, humanizeRegion } from './region'

describe('getAllRegionList', () => {
  it('should work correctly', () => {
    // TODO: 这个方法有问题
    // const areaOption = getAllRegionList()
    // expect(areaOption).toEqual([])
  })
})

describe('getOtherRegionNameList', () => {
  it('should work correctly', () => {
    expect(getOtherRegionNameList()).toEqual(['oversea', 'unknown', 'hongkong', 'macau', 'taiwan'])
  })
})

describe('getChinaRegionNameList', () => {
  it('should work correctly', () => {
    expect(getChinaRegionNameList()).toEqual([
      'beijing',
      'hebei',
      'neimenggu',
      'shanxi',
      'tianjin',
      'gansu',
      'ningxia',
      'qinghai',
      'shaanxi',
      'xinjiang',
      'heilongjiang',
      'jilin',
      'liaoning',
      'anhui',
      'fujian',
      'jiangsu',
      'shandong',
      'shanghai',
      'zhejiang',
      'henan',
      'hubei',
      'hunan',
      'jiangxi',
      'chongqing',
      'guizhou',
      'sichuan',
      'xizang',
      'yunnan',
      'guangdong',
      'guangxi',
      'hainan'
    ])
  })
})

describe('humanizeRegion', () => {
  it('should work correctly', () => {
    const container = createContainer()
    const i18n = container.get(I18nStore)

    expect(i18n.t(humanizeRegion('beijing'))).toBe('北京')
    expect(i18n.t(humanizeRegion('dont_exist'))).toBe('未知')
    expect(i18n.t(humanizeRegion('oversea'))).toBe('海外')
    expect(i18n.t(humanizeRegion('macau'))).toBe('澳门')
  })
})
