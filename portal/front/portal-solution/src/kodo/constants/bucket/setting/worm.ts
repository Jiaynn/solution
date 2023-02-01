/**
 * @file WORM Constants
 * @author hovenjay <hovenjay@outlook.com>
 */

export const objectLockEnabled = 'Enabled'

export const reservedModes = {
  COMPLIANCE: 'COMPLIANCE'
} as const

export const reservedModeNameMap = {
  [reservedModes.COMPLIANCE]: '合规模式'
} as const

export const reservedTimeUnits = {
  days: 'days',
  years: 'years'
} as const

export const reservedTimeUnitNameMap = {
  [reservedTimeUnits.days]: '天',
  [reservedTimeUnits.years]: '年'
} as const

export const reservedTimeMaxValueMap = {
  [reservedTimeUnits.days]: 25550, // 70 年 * 365 天
  [reservedTimeUnits.years]: 70    // 70 年
} as const
