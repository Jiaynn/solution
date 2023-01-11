import { values, keys, some } from 'lodash'
import { RawLocaleMessage } from 'portal-base/common/i18n'

import * as messages from 'cdn/locales/messages'

import { regionNameMap, RegionNameKey } from 'cdn/constants/region'

// 除去 “港澳台” 和 “其他地区”
export const notContainsAreaCode = ['gat', 'other']

// apm 中的地区不包括 “港澳台” 和 “其他地区”
export function getAllRegionList() {
  const res: Record<string, RawLocaleMessage> = {};
  (keys(regionNameMap) as RegionNameKey[])
    .filter(areaCode => notContainsAreaCode.indexOf(areaCode) < 0)
    .forEach(areaCode => {
      values(regionNameMap[areaCode].regions).forEach(
        item => { res[item.key] = item }
      )
    })
  return res
}

export function getAllRegionNameList() {
  return keys(getAllRegionList())
}

export function containAllRegions(regions: string[]) {
  const allRegions = getAllRegionNameList()
  const hasInvalidRegions = some(regions, region => allRegions.indexOf(region) < 0)
  // 默认没有重复的情况
  return !hasInvalidRegions && regions.length === allRegions.length
}

export function humanizeRegion(region: string) {
  const regionNames = getAllRegionList()
  return regionNames[region] || messages.unknown
}
