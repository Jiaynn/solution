import { values, some, uniq, keys } from 'lodash'
import { RawLocaleMessage } from 'portal-base/common/i18n'

import * as messages from 'cdn/locales/messages'

import { areas, geoNameRegionMap, regionNameMap } from 'cdn/constants/region'

export function getAllRegionList() {
  const res: Record<string, RawLocaleMessage> = {}
  values(regionNameMap).forEach(
    area => {
      values(area.regions).forEach(
        item => { res[item.key] = item }
      )
    }
  )
  return res
}

export function getAllRegionNameList() {
  return keys(getAllRegionList())
}

export function getOtherRegionNameList() {
  return values(regionNameMap.other.regions)
    .concat(values(regionNameMap.gat.regions))
    .map(
      item => item.key
    )
}

export function getChinaRegionNameList() {
  const others = getOtherRegionNameList()
  return getAllRegionNameList().filter(
    region => others.indexOf(region) < 0
  )
}

/**
 * 判断给定的 regions 是否完全包含 areaRegions
 * @param regions
 * @param areaRegions
 * @param only 是否仅仅包含
 */
function containAreaRegions(regions: string[], areaRegions: string[], only?: boolean): boolean {
  if (only) {
    return regions.length === areaRegions.length
      && !some(regions, region => areaRegions.indexOf(region) === -1)
  }

  return uniq(regions)
    .filter(region => areaRegions.indexOf(region) !== -1)
    .length === areaRegions.length
}

/**
 * 判断给定的 regions 是否包含 china regions（中国大陆）
 * @param regions 地区
 * @param only 是否仅仅包含
 */
export function containChinaRegions(regions: string[], only?: boolean): boolean {
  return containAreaRegions(regions, getChinaRegionNameList(), only)
}

/**
 * 判断给定的 regions 是否包含 other regions（港澳台及海外）
 * @param regions 地区
 * @param only 是否仅仅包含
 */
export function containOtherRegions(regions: string[], only?: boolean): boolean {
  return containAreaRegions(regions, getOtherRegionNameList(), only)
}

/**
 * 判断给定的 regions 是否包含所有区域
 * @param regions 地区
 */
export function containAllRegions(regions: string[]): boolean {
  return containAreaRegions(regions, getAllRegionNameList(), true)
}

export function humanizeRegion(region: string): RawLocaleMessage {
  const regionNames = getAllRegionList()
  return regionNames[region] ?? messages.unknown
}

export function humanizeMapRegion(region: string): RawLocaleMessage {
  return humanizeRegion(geoNameRegionMap[region])
}

// 将形如 ["global"] / ["china"] 的数据转为 ["beijing", "shanghai", ...]
export function getRegionList(regions?: string[], useGlobal?: boolean): string[] {
  regions = (regions || []).reduce(
    (regionList, regionOrArea) => {
      if (regionOrArea === areas.global) {
        return regionList.concat(getAllRegionNameList())
      }
      if (regionOrArea === areas.china) {
        return regionList.concat(getChinaRegionNameList())
      }
      if (regionOrArea === areas.other) {
        return regionList.concat(getOtherRegionNameList())
      }
      return regionList.concat(regionOrArea)
    },
    [] as string[]
  )
  const retRegions = Array.from(new Set(regions))
  return useGlobal && containAllRegions(retRegions) ? ['global'] : retRegions
}
