/**
 * @description utils of form
 * @author duli <duli@qiniu.com>
 */

export function requiredValidator(msg = '不能为空') {
  return val => ((Array.isArray(val) && val.length === 0) || (val !== 0 && !val) ? msg : '')
}

export function integerValidator(msg = '请输入整数') {
  return val => (Number.isInteger(val) ? '' : msg)
}

// 有个不好的地方是右闭的，跟大多数的 range 不一致
export function rangeValidator(range: [min: number, max?: number], defaultMsg?: string) {
  const [min, max] = range
  const [msg, max_] = max != null ? [`${min} - ${max}`, max] : [`大于等于 ${min}`, Number.MAX_VALUE]
  const text = defaultMsg || msg
  return (val: number) => {
    if (val < min || val > max_) {
      return text
    }
  }
}
