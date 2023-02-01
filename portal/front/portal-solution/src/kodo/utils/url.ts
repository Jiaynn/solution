/**
 * @file url utils
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import { size } from 'lodash'
import { parse, ParsedQuery, ParseOptions, parseUrl, stringify, stringifyUrl } from 'query-string'

// TODO: merge into 'portal-base/common/utils/url'

type ValidationResponse = string | null | undefined | false
export type URLObjectLike = URL | HTMLAnchorElement

export type HttpProtocols
  = '//'
  | 'http' | 'HTTP' | 'Http' | 'https' | 'HTTPS' | 'Https'
  | 'http:' | 'HTTP:' | 'Http:' | 'https:' | 'HTTPS:' | 'Https:'
  | 'http://' | 'HTTP://' | 'Http://' | 'https://' | 'HTTPS://' | 'Https://'

export function isURL(url: string, options?: IValidateURLOptions): boolean {
  return !validateURL(url, options)
}

export interface IValidateURLOptions {
  allowPort?: boolean // 允许端口
  allowHash?: boolean // 允许哈希
  allowSearch?: boolean // 允许 search
  allowGeneric?: boolean // 是否允许包含 *
  ignoreProtocol?: boolean // 允许忽略协议头
  allowRelativeProtocol?: boolean // 允许使用相对协议 如 //test.com
  // allowLocal?: boolean // TODO: 是否允许本地域（比如局域网），类似 loclhost 这种没有根域名（比如.com）的
}

// 尽可能的放宽了对字符范围的限制，因为域名的字符范围这个东西不好确定
export function validateURL(url: string, options?: IValidateURLOptions): ValidationResponse {
  const internalUrl = url
  // 第一个 # 之后的全部是 hash
  const hashString = internalUrl.split('#')[1]
  let urlWithoutHash = internalUrl.split('#')[0]

  const {
    allowPort = true,
    allowHash = true,
    allowSearch = true,
    allowGeneric = false,
    ignoreProtocol = false,
    allowRelativeProtocol = false
  } = options || {}

  // 奇怪的空白符
  // eslint-disable-next-line no-control-regex
  if (/[\s\0\x08-\x0d\x85\xa0\u1680\u180e\u2000-\u200f\u2028\u2029\u202f\u205f\u2060\u3000\ufeff]/.test(internalUrl)) {
    return '包含非法的空白字符'
  }

  // 主要针对 hostname
  // 有很多其他字符，但是因为不同环境下 URL 的行为不统一不好进行单测
  // 发现一些补充一些吧，加完记得浏览器里看一下，注意单测行为可能不具参考性能
  if (/[（）！|「」—]/.test(urlWithoutHash)) {
    return '包含非法的字符'
  }

  // 如果允许相对协议, 并且符合 // 开头就替换头再走正常 URL 逻辑
  if (/^\/\//i.test(urlWithoutHash)) {
    if (allowRelativeProtocol) {
      urlWithoutHash = `http://${urlWithoutHash.slice(2)}`
    } else {
      return '请勿以 // 开头'
    }
  }

  // 如果允许忽略协议头，就检查是否包含协议头、不包含就添加上再走正常的 URL 逻辑
  if (!/^https?:\/\//i.test(urlWithoutHash)) {
    if (ignoreProtocol) {
      urlWithoutHash = `http://${urlWithoutHash}`
    } else {
      return '请输入 http(s) 协议头'
    }
  }

  if (/\*/.test(urlWithoutHash)) {
    if (allowGeneric) {
      // 如果支持泛域名，就替换域名里的 * 再走正常的 URL 逻辑, 否则不允许使用 *
      urlWithoutHash = urlWithoutHash.replace(/\*/g, 'generic')
    } else {
      return '包含非法的字符 *'
    }
  }

  // 禁止 search 时 不允许输入 ?
  // new URL 时 ? 后面不包含值时 ? 号会被裁掉
  if (!allowSearch && /\?/.test(urlWithoutHash)) {
    return '包含非法的字符 ?'
  }

  // 禁止 hash 时, 整个 url 不允许输入 #
  // new URL 时 # 后面不包含值时 # 号会被裁掉
  if (!allowHash && /#/.test(internalUrl)) {
    return '包含非法的字符 #'
  }

  let data: URL
  try {
    // polyfill 必须给力才敢这样
    // URL 也有一些基础性的校验功能、例如 ipv6 的格式，一些常见非法字符等等
    // node 环境和浏览器环境的行为不一样:
    // 浏览器是脑残直接 encode
    // node 是标准的 domain 支持

    data = new URL(hashString ? `${urlWithoutHash}#${hashString}` : urlWithoutHash)
  } catch (error) {
    return '格式错误'
  }

  // 必须是 http/s 协议
  if (!(/^https?:$/i.test(data.protocol))) {
    return '仅支持 http/https 协议'
  }

  if (!allowSearch && data.search) {
    return '不支持 search 段'
  }

  if (!allowHash && data.hash) {
    return '不支持 hash 段'
  }

  if (!allowPort && data.port) {
    return '不支持 port 段'
  }

  const validateHostname = (hostname: string) => {

    if (!hostname) {
      return 'hostname 不允许为空'
    }

    if (/[.[\]/]{2,}/.test(hostname)) {
      return '格式错误，可能是因为包含连续的 . [ ] / 等字符'
    }

    // \u4e00-\u9fa5 非常古老、很多新加入的汉字不在其中
    // 但是：走到这里 URL 已经帮我们把汉字转译了、所以不需要考虑汉字
    // 如果要处理中文问题,可以查一下 Unified_Ideograph、Punycode 相关知识点
    if (hostname.length === 1) {
      if (/^[a-zA-Z0-9]$/.test(hostname)) {
        return false
      }
      return '格式错误、可能包含特殊字符'
    }

    if (!/^[[a-zA-Z0-9%]+/.test(hostname)) {
      return 'hostname 的首字符不合法'
    }

    if (!/[\]a-zA-Z0-9]$/.test(hostname)) {
      return 'hostname 的末尾字符不合法'
    }

    if (!/^[0-9a-zA-Z%:.-]*$/.test(hostname.slice(1, -1))) {
      return 'hostname 的中间包含不合法字符'
    }

    return false
  }

  return validateHostname(data.hostname)
}

export function getUrlWithProtocol(
  url: string,
  protocol?: HttpProtocols | '' | void // default to '', not window.location.protocol
): string {
  // eslint-disable-next-line no-nested-ternary
  const protocolText = !protocol
    ? ''
    : protocol === '//'
      ? '//'
      : `${protocol.replace(/[:/]/g, '').toLowerCase()}://`

  return url.replace(
    /^(?:(?:https?:)?\/\/)?/i,
    protocolText
  )
}

export function getPort(url: URLObjectLike): string {
  if (url.port) {
    return url.port
  }

  const protocol = url.protocol.toLowerCase()
  if (protocol === 'http:') {
    return '80'
  }
  if (protocol === 'https:') {
    return '443'
  }

  return url.port
}

// 避开 decodeURIComponent 这个名字
export function safeDecodeURIComponent(uriComponent: string): string {
  return decodeURIComponent(uriComponent.replace(/\+/g, ' '))
}

// 按顺序组织 path，顺便过滤掉 void 以及进行 url encode
export function formatPath<
  // 排除复杂类型（复杂类型自行 stringify 包括 array）
  T extends { [key in string | number]: string | number | boolean | void }
>(
  // 之所以不选择 ...args 是为了预留扩展槽位，如定制自己的 encoder 或 filter 之类的
  orderedParams: Array<Partial<T>>
): string {
  return orderedParams
    .map(
      query => (!query
        ? []
        : (
          Object.keys(query)
            .filter(key => key && query[key] != null)
            .map(key => encodeURIComponent(key) + '/' + encodeURIComponent(query[key] + ''))
        ))
    )
    .reduce(
      (result, current) => result.concat(current),
      []
    )
    .join('/')
}

// 判断两个 url 字符串是否等价
export function urlEqual(url1: string, url2: string): boolean {
  if (url1 === url2) {
    return true
  }
  try {
    // 注：不需要做 port normalize 的事情，URL parse 的过程会做这个事情
    // 规范：https://url.spec.whatwg.org/#concept-basic-url-parser
    // 我们用的 polyfill：https://github.com/jsdom/whatwg-url/blob/master/src/url-state-machine.js
    const [normalized1, normalized2] = [url1, url2].map(
      url => new URL(url).href
    )
    return normalized1 === normalized2
  } catch {
    return false
  }
}

// 判断传入 url 字符串是否包含给定的 host
export function isUrlWithHostname(url: string, hostname: string) {
  if (!isURL(url)) {
    return false
  }
  const urlObject = new URL(url)
  // TODO: 镜像回源用了本函数来做 url host 的检查，确认这里使用 host 是否满足需求（本来是 hostname）
  return urlObject.hostname === hostname
}

export function getProtocolByWindowLocation() {
  return window.location.protocol === 'https:' ? 'https' as const : 'http' as const
}

// 从 url 独立 query 并返回
// 支持 vue 使用 hash 路由的模式 (protocol://host#path?query)
export function parseUrlQuery(url: string, options?: ParseOptions): ParsedQuery<string> {
  if (!url) return {}

  // 先排除包含多个 ? 的情况
  const queryMatched = url.match(/(\?[^?]+)/g)
  if (queryMatched && queryMatched.length > 1) {
    throw new Error('incorrect url')
  }

  // 先尝试当作普通 url 进行解析
  const urlObject = parseUrl(url, options)
  if (urlObject.query != null && size(urlObject.query)) {
    return urlObject.query
  }

  // URL 解析规则
  // 从第一个 # 到后面所有的内容都是 hash
  // 从第一个 ? 到后面所有非 # 之间的都是 query
  // hash 路由特殊在于上述规则是从第一个 # 之后开始进行的

  // 先从原始 url 中取出 # 之后的字符作为 rootUrl
  const rootUrl = (url.match(/#.*/) || [])[0]
  if (!rootUrl) return {}

  // 从 rootUrl 中根据规则去除 query 交给 parse 进行解析
  const queryStr = (rootUrl.match(/\?[^#]*/) || [])[0]
  return parse(queryStr, options)
}

// 添加或更新 query，已存在则更新，不存在则添加 (不支持删除哦)
// 支持 vue 使用 hash 路由的模式 (protocol://host#path?query)
export function upsertUrlQuery(url: string, query: Record<string, string>): string {
  if (!url) return url

  // 先排除包含多个 ? 的情况
  const queryMatched = url.match(/(\?[^?]+)/g)
  if (queryMatched && queryMatched.length > 1) {
    throw new Error('incorrect url')
  }

  // 先尝试当作普通 url 进行解析
  const urlObject = parseUrl(url)
  if (urlObject.query != null && size(urlObject.query)) {
    return stringifyUrl({ url, query })
  }

  // 尝试用 hash 模式

  // URL 解析规则
  // 从第一个 # 到后面所有的内容都是 hash
  // 从第一个 ? 到后面所有非 # 之间的都是 query
  // hash 路由特殊在于上述规则是从第一个 # 之后开始进行的

  // 先从原始 url 中取出 # 之后的字符作为 rootUrl
  const rootUrl = (url.match(/#.*/) || [])[0]
  if (rootUrl) {
    // 从 rootUrl 中根据规则去除 query 交给 parse 进行解析
    const queryStr = (rootUrl.match(/\?[^#]*/) || [])[0]
    if (queryStr) {
      const queryObj = parse(queryStr)
      const newQueryObj = { ...queryObj, ...query }
      return url.replace(/\?[^#]*/, `?${stringify(newQueryObj)}`)
    }
  }

  return stringifyUrl({ url, query })
}

export function getFirstQuery(query: string | string[] | undefined): string | undefined {
  if (Array.isArray(query)) return query[0]
  return query
}

export function trimQueryString(input: string, keys: string[]): string {
  if (!input) return input

  const resultQuery = {}
  const { url, query } = parseUrl(input)
  for (const k of Object.keys(query)) {
    if (!keys.includes(k)) {
      resultQuery[k] = query[k]
    }
  }
  return stringifyUrl({ url, query: resultQuery })
}
