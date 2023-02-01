import qs from 'query-string'
import { proxyPrefix } from 'portal-base/common/apis/proxy'

export const resourceProxyApiPath = proxyPrefix + '/kodo-resource'

export interface KodoResourceProxyOptions {
  bucket: string // 空间
  key: string // 对象的 key
  q?: string // 查询条件
}

/**
 * @param  {KodoResourceProxyOptions} options
 * @returns string
 * @desc 返回一个可以直接访问 kodo 的资源地址，无需空间域名
 */
export function getKodoResourceProxyUrl(options: KodoResourceProxyOptions): string {
  const queryObject = {
    key: options.key,
    bucket: options.bucket,
    q: options.q ? encodeURIComponent(options.q) : undefined,
    preview: true
  }
  return `${resourceProxyApiPath}?${qs.stringify(queryObject)}`
}
