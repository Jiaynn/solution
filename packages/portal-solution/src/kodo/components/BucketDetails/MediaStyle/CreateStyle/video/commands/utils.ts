/**
 * @file 共享的工具函数集
 */

type ToNumberOptions = {
  // 小数点后保留几位
  decimalsLimit?: number
  // 最大值
  max?: number
  // 最小值
  min?: number
  // 允许符号
  allowSign?: boolean | '+' | '-'
}
export function toNumber(input: string, options?: ToNumberOptions): number {
  const {
    decimalsLimit = Number.POSITIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    min = Number.NEGATIVE_INFINITY,
    allowSign = false
  } = options ?? {}

  // eslint-disable-next-line no-nested-ternary
  const reg = !allowSign
    ? /^[0-9][\d\\.]*$/ // 不允许有符号
    : allowSign === true
        ? /^(\+|-)?[0-9][\d\\.]*$/
        : new RegExp(`^(\\${allowSign}|-)?[0-9][\\d\\\\.]*$`)

  if (!reg.test(input)) {
    throw new Error('invalid input')
  }

  const value = +input

  if (Number.isNaN(value)) {
    throw new Error('invalid input')
  }

  const decimals = input.split('.')[1]
  if (decimals != null && decimals.length > decimalsLimit) {
    throw new Error('invalid decimals')
  }

  if (value > max) {
    throw new Error('invalid input')
  }

  if (value < min) {
    throw new Error('invalid input')
  }

  return value
}

// 检查 w + h 的组合是否合法，单项检查不在此处
export function ensureWidthAndHeightValid(w: number | null, h: number | null) {
  function predicate(value: number | null): value is number {
    return value != null
  }
  const scaleInfo = [
    w,
    h
  ].filter(predicate)

  if (scaleInfo.length === 2) {
    const max = Math.max(...scaleInfo)
    const min = Math.min(...scaleInfo)

    // 最大值，只能有一个在 2160 到 3840 之间
    if (max > 2160 && min > 2160) {
      throw new Error('unsupported scale')
    }
  }
}
