import md5 from 'md5'
import { queryParse as parseSearch } from 'qn-fe-core/utils'

export function genRandomKey(): string {
  // tslint:disable:no-bitwise
  /*eslint-disable*/
  let d = new Date().getTime()

  // use high-precision timer if available
  if (window.performance && typeof window.performance.now === 'function') {
    d += performance.now()
  }

  return 'xxyyxxyyxxyyxxyyxxyyxxyyxxyyxxyyxxyyxxyy'.replace(
    /[xy]/g,
    function(c) {
      const r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : r & 0x3 | 0x8).toString(16)
    }
  )
}

export function genSign(key: string, path: string, t: string): string {
  return md5(key + encodeURI(path) + t).toLowerCase()
}

export function checkUrlPattern(url: string): boolean {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch (e) {
    return false
  }

  const { sign, t } = parseSearch(parsedUrl.search)

  return !!sign && !!t
}

export function checkUrlByKey(url: string, key: string): boolean {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(url)
  } catch (e) {
    return false
  }

  const { sign, t } = parseSearch(parsedUrl.search)
  const path = decodeURIComponent(parsedUrl.pathname)
  return genSign(key, path, t as string) === sign
}
