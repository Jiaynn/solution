import { values, includes, keys } from 'lodash'
import { RawLocaleMessage } from 'portal-base/common/i18n'

import * as messages from 'cdn/locales/messages'

import { areas, regionNameMap } from 'cdn/constants/traffic-region'

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

export function humanizeRegion(region: string): RawLocaleMessage {
  const regionNames = getAllRegionList()
  return regionNames[region] ?? messages.unknown
}

export function getForeignRegionNameList() {
  return values(regionNameMap.foreign.regions).map(
    item => item.key
  )
}

export function getChinaRegionNameList() {
  return values(regionNameMap.china.regions).map(
    item => item.key
  )
}

export function containsGlobalArea(regions: string[]) {
  if (!regions) {
    return false
  }
  return includes(regions, areas.global)
}

export function containsChinaArea(regions: string[]) {
  if (!regions) {
    return false
  }
  return includes(regions, areas.china)
}

export function containsForeignArea(regions: string[]) {
  if (!regions) {
    return false
  }
  return includes(regions, areas.foreign)
}

// 包含所有海外区域时，这些区域合并成 `foreign`
export function combineForeignRegions(regions?: string[]): string[] {
  if (!regions) {
    return []
  }
  const allForeignRegions = getForeignRegionNameList()

  if (regions.length < allForeignRegions.length) {
    return regions
  }

  if (allForeignRegions.every(region => regions.includes(region))) {
    return regions.filter(region => !allForeignRegions.includes(region)).concat(areas.foreign)
  }

  return regions
}
