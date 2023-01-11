import { isSecondLevelDomain } from 'cdn/transforms/domain/index'

export function validateHostingDomain(domain: string) {
  if (!isSecondLevelDomain(domain)) {
    return '不是二级域名'
  }
  return null
}
