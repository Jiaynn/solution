import { mapMessageValues } from 'portal-base/common/i18n'

import { storageSizeUnits, StorageSizeUnit } from 'cdn/constants/unit'

function conversionValue(value: number, radix: number, units: string[], decimal: number) {
  let index = 0
  while (index < units.length - 1 && value >= radix) {
    value /= radix
    index++
  }

  let displayValue = value.toString()
  if (Math.floor(value) < value) {
    displayValue = value.toFixed(decimal)
  }

  return displayValue + ' ' + units[index]
}

export function transformStorageSize(value: number, options?: { from?: StorageSizeUnit, to?: StorageSizeUnit }) {
  const from = storageSizeUnits.indexOf(options?.from ?? 'B')
  const to = storageSizeUnits.indexOf(options?.to ?? 'B')
  const radix = 1024
  return value * radix ** (from - to)
}

export function humanizeBandwidth(value: number, decimal = 4) {
  const units = ['', 'K', 'M']
  const radix = 1000
  const result = conversionValue(value, radix, units, decimal)

  return result + 'bps'
}

export function humanizeTraffic(value: number, decimal = 4) {
  const units = ['', 'K', 'M', 'G']
  const radix = 1024
  const result = conversionValue(value, radix, units, decimal)

  return result + 'B'
}

const reqcountMsgs = {
  lessThousand: {
    cn: (val: string) => `${val} 次`,
    en: (val: string) => `${val}`
  },
  thousandAbove: {
    cn: (val: string) => `${val} 千次`,
    en: (val: string) => `${val} thounsand`
  }
}

export function humanizeReqcount(value: number, decimal = 3) {
  if (value < 1000) {
    return mapMessageValues(reqcountMsgs.lessThousand, fn => fn(value.toFixed(0)))
  }

  const radix = 1000
  return mapMessageValues(reqcountMsgs.thousandAbove, fn => fn((value / radix).toFixed(decimal)))
}

export function humanizePercent(value: number, decimal = 2) {
  const result = parseFloat(String(value)) * 100
  if (Math.floor(result) < result) {
    return result.toFixed(decimal) + '%'
  }

  return result + '%'
}

export function humanizePercent100(value: number, decimal = 2) {
  const result = parseFloat(String(value))
  if (Math.floor(result) < result) {
    return result.toFixed(decimal) + '%'
  }

  return result + '%'
}

export function humanizeEntries(value: number, decimal = 0) {
  let result = parseFloat(String(value))
  if (Math.floor(result) < result) {
    result = Number(result.toFixed(decimal))
  }

  return {
    cn: result + ' 个',
    en: result + ''
  }
}

export function humanizeFilesize(value: number, decimal = 2) {
  const units = ['', 'K', 'M', 'G', 'T', 'P', 'E']
  const radix = 1024
  let e = 0
  while (e < units.length - 1 && value >= radix) {
    value /= radix
    e++
  }
  const result = Math.floor(value) < value
    ? (value.toFixed(decimal))
    : String(value)
  return `${result} ${units[e]}B`
}

export function humanizeSpeed(value: number, decimal = 2) {
  const units = ['', 'K', 'M', 'G']
  const radix = 1024
  const result = conversionValue(value, radix, units, decimal)

  return result + 'B/s'
}

export function humanizeDuration(value: number, decimal = 0) {
  const units = ['秒', '分钟']
  const radix = 60
  const result = conversionValue(value, radix, units, decimal)

  return result
}

export function humanizeApmResponseTime(value: number, decimal = 0) {
  return `${(value).toFixed(decimal)} 毫秒`
}

export function humanizeApmDownloadSpeed(value: number, decimal = 3) {
  const units = ['K', 'M', 'G']
  const radix = 1024
  const result = conversionValue(value, radix, units, decimal)

  return result + 'B/s'
}

export type SplitedValue = {
  value: string
  unit: string
}

/**
 * 拆分含有单位的值，比如 12.04MB
 * @param valueStr string
 */
export function splitMixedValue(valueStr: string): SplitedValue {
  const matchedValue = valueStr.match(/^(\d+(\.\d+)?)\s*([\u4E00-\u9FA5A-Za-z]+)$/) || []
  const value = matchedValue[1] || ''
  const unit = matchedValue[3] || ''

  return { value, unit }
}
