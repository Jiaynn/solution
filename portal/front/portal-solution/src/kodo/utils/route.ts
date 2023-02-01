/**
 * @file router utils
 * @author yinxulai <me@yinxulai.com>
 */

import { Cancelable, debounce as ldebounce } from 'lodash'
import { QueryParams, withQueryParams as formatURL } from 'qn-fe-core/utils'
import { RouterStore } from 'portal-base/common/router'

// 更新 route 上的 query 字段
// 追加更新，仅会修改指定的字段，同时保留原有字段
// 当 key 的 value 为 null、undefined、false 时、字段会从 query 中移除
// 例如 a=1&b=2&c=3, updateQueryString({a:null,b:new,c:false}) => b=new
export function updateQueryString(routerStore: RouterStore, query: QueryParams, isReplace = true) {
  const { pathname } = routerStore.location!
  const newQuery = { ...routerStore.query, ...query }

  for (const key in newQuery) {
    if (Object.prototype.hasOwnProperty.call(newQuery, key)) {
      const value: any = newQuery[key]
      if (value == null || value === false) {
        delete newQuery[key]
      }
    }
  }

  const path = formatURL(pathname, newQuery)

  if (isReplace) {
    routerStore.replace(path)
  } else {
    routerStore.push(path)
  }
}

// eslint-disable-next-line space-before-function-paren
export function debounce<T extends (...args: any[]) => any>(func: T): T & Cancelable {
  return ldebounce(func, 500)
}

// example: &isOpen=true&... || &isOpen&... || &isOpen=1&...
export function getBooleanQuery(value?: string): boolean {
  return value === 'true' || value === '1' || value === ''
}
