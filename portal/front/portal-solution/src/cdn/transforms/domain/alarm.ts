import {
  categories, categoryTextMap, trafficUnits, trafficUnitTextMap,
  bandwidthUnits, bandwidthUnitTextMap, methodTextMap
} from 'cdn/constants/domain/alarm'

export function humanizeCategory(category: string) {
  return categoryTextMap[category as keyof typeof categoryTextMap] || '未知'
}

export function getUnitForTraffic(traffic: number): number {
  const { MB, GB, TB } = trafficUnits
  if (traffic < GB) { return MB }
  if (traffic < TB) { return GB }
  return TB
}

export function humanizeTrafficUnit(unit: number): string {
  return trafficUnitTextMap[unit] || '未知'
}

export function getUnitForBandwidth(bandwidth: number): number {
  const { Kbps, Mbps, Gbps } = bandwidthUnits
  if (bandwidth < Mbps) { return Kbps }
  if (bandwidth < Gbps) { return Mbps }
  return Gbps
}

export function humanizeBandwidthUnit(unit: number): string {
  return bandwidthUnitTextMap[unit] || '未知'
}

export function getUnit(value: number, category: string): number {
  return (
    category === categories.traffic
    ? getUnitForTraffic
    : getUnitForBandwidth
  )(value)
}

export function humanizeUnit(unit: number, category: string): string {
  return (
    category === categories.traffic
    ? humanizeTrafficUnit
    : humanizeBandwidthUnit
  )(unit)
}

export function humanizeMethod(method: string): string {
  return methodTextMap[method] || '未知'
}
