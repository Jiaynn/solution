import { ip, domain } from 'cdn/constants/pattern'

// 使用 domain 或 IP 地址作为 host 的 url
export function urlWithDomainOrIpHost(text: string): string | undefined {
  const invalidText = '不合法的 URL'

  let hostname: string
  try {
    // 依赖全局 polyfill URL api 以支持 IE
    hostname = new URL(text).hostname
  } catch (e) {
    return invalidText
  }

  if (domain.test(hostname)) {
    return
  }
  // IPv6 地址在 URL 中形如 http://[<IPv6 Address>]:<port>/<path>
  const hostnameAsIp = (
    /^\[.*\]$/.test(hostname)
    ? hostname.slice(1, -1)
    : hostname
  )
  return ip.test(hostnameAsIp) ? undefined : invalidText
}
