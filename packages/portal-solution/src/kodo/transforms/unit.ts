/**
 * @file unit relative functions
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import { intUnits, storageSizeUnits } from 'kodo/constants/unit'

export function conversionValue(
  value: number,
  radix: number,
  units: string[],
  decimal: number
) {
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

export interface IHumanizeBigNumberOptions {
  isBinary?: boolean,
  decimal?: number
  autoPadEnd?: boolean // toFixed
  sep?: string
  unit?: string
  units?: string[]
}

export function humanizeBigNumber(input: number, options?: IHumanizeBigNumberOptions): string {
  const newOptions = {
    isBinary: false,
    decimal: 2,
    autoPadEnd: false,
    sep: '',
    unit: '',
    units: intUnits.en,
    ...(options || {})
  }

  if (input === 0) {
    return '0'
  }

  const weight = 3
  const base = newOptions.isBinary ? 2 : 10
  const exponent = newOptions.isBinary ? 10 : weight
  const radix = base ** exponent

  const isNegative = input < 0
  const numerator = Math.abs(input)

  const index = Math.max(
    Math.min(
      Math.floor(Math[`log${base}`](numerator) / exponent),
      newOptions.units.length
    ),
    0
  )

  const denominator = index ? radix ** index : 1
  const quotient = numerator / denominator

  const remainder = !newOptions.isBinary
    ? numerator % denominator
    : (numerator % denominator) / denominator * (index ? 10 ** (weight ** index) : 1)
  const decimalLength = remainder.toString().padStart(index * weight, '0').replace(/0*$/, '').length

  return [
    isNegative ? '-' : '',
    (decimalLength > newOptions.decimal || newOptions.autoPadEnd) ? quotient.toFixed(newOptions.decimal) : quotient,
    index ? newOptions.sep + newOptions.units[index] : '',
    !newOptions.unit ? '' : (index ? '' : newOptions.sep) + newOptions.unit
  ].join('')
}

// B -> B/KB/MB ...
export function humanizeStorageSize(input: number, decimal = 2): string {
  return humanizeBigNumber(input, {
    isBinary: true,
    decimal,
    sep: ' ',
    unit: 'B'
  })
}

// B -> bps/Kbps/Mbps
export function humanizeBandwidth(value: number) {
  return humanizeBigNumber(value, {
    isBinary: false,
    decimal: 2,
    sep: ' ',
    unit: 'bps'
  })
}

export function getNumberUnit(
  data: number,
  isBinary = true,
  intUnitType: keyof typeof intUnits = 'en'
): string {
  const index = Math.floor(Math.log(data) / Math.log(isBinary ? 1024 : 1000))
  if (isBinary) {
    return storageSizeUnits[index]
  }

  return intUnits[intUnitType][index]
}

// 99 -> '99%', '99' -> '99%'
export function transformNumberToPercent(value: string | number, decimal = 2) {
  const result = typeof value === 'number' ? value : parseFloat(value)
  if (Math.floor(result) < result) {
    return result.toFixed(decimal) + '%'
  }

  return result + '%'
}
