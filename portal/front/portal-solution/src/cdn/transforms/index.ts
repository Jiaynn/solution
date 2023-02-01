import { QueryParams } from 'qn-fe-core/utils'

export function atoi(numberText: string, valueForInvalidInput = 0): number {
  const parsed = parseInt(numberText, 10)
  return Number.isNaN(parsed) ? valueForInvalidInput : parsed
}

export function atof(numberText: string, valueForInvalidInput = 0): number {
  const parsed = parseFloat(numberText)
  return Number.isNaN(parsed) ? valueForInvalidInput : parsed
}

export function getIntValue(e: React.FormEvent<any>, valueForInvalidInput = 0) {
  return atoi((e.target as any).value, valueForInvalidInput)
}

export function getFloatValue(e: React.FormEvent<any>, valueForInvalidInput = 0) {
  return atof((e.target as any).value, valueForInvalidInput)
}

export function trimAndFilter(lines: string[]): string[] {
  return (lines || []).map(
    line => line.trim()
  ).filter(
    line => !!line
  )
}

export function splitLines(linesStr: string | null | undefined): string[] {
  if (!linesStr) {
    return []
  }
  return linesStr.split('\n')
}

export function filterQuery(query?: QueryParams) {
  if (!query) {
    return
  }
  return Object.keys(query).reduce(
    (filtered, key) => (
      (query || {})[key]
      ? { ...filtered, [key]: (query || {})[key] }
      : filtered
    ), {} as QueryParams
  )
}

export function humanizeOnoff(isOn: boolean) {
  return isOn ? '开启' : '关闭'
}
