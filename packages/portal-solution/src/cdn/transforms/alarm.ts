import { values, isInteger } from 'lodash'

import { AlarmType, ThresholdType } from 'cdn/constants/alarm'

export interface ICascaderOption {
  value: string
  label: string
  children?: ICascaderOption[]
}

export function getOptionPropWithChildren(value: string, label: string, children?: any): ICascaderOption {
  if (!children) {
    return { value, label }
  }
  return { value, label, children }
}

export function getOptionListWithChildren(
  options: Record<string, string>,
  nameMap: Record<string, string>,
  children = null
): ICascaderOption[] {
  return values(options).map(option => (
    getOptionPropWithChildren(option, nameMap[option], children)
  ))
}

export function transformAlarmTypeUnitForDisplay(type: AlarmType, threshold: ThresholdType) {
  if (threshold === ThresholdType.Above || threshold === ThresholdType.Below) {
    switch (type) {
      case AlarmType.Bandwidth: {
        return 'Mbps'
      }
      case AlarmType.Traffic: {
        return 'GB'
      }
      default: {
        return '%'
      }
    }
  } else {
    return '%'
  }
}

export function bps2Mbps(numInBps: number | null): number | null {
  if (numInBps == null) {
    return null
  }
  const value = numInBps / (1000 * 1000)
  return isInteger(value) ? value : Number(value.toFixed(2))
}

export function mbps2Bps(numInMbps: number | null): number | null {
  if (numInMbps == null) {
    return null
  }
  return numInMbps * 1000 * 1000
}

export function byte2Gbyte(numInByte: number | null): number | null {
  if (numInByte == null) {
    return null
  }
  const value = numInByte / (1024 * 1024 * 1024)
  return isInteger(value) ? value : Number(value.toFixed(2))
}

export function gbyte2Byte(numInMbyte: number | null): number | null {
  return numInMbyte != null ? numInMbyte * 1024 * 1024 * 1024 : null
}
