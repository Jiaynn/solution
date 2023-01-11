/**
 * @file CDN route TODO: 站内外链与内链分开
 * @author yinxulai <me@yinxulai.com>
 */

// CDN 概览
export function getCDNOverviewPath() {
  return '/cdn/overview'
}

// CDN 业务的域名创建
export function getCDNCreateDomainPath(bucketName: string) {
  const query = bucketName ? `?bucket=${encodeURIComponent(bucketName)}&fixBucket` : ''
  return `/cdn/domain/create${query}`
}

// CDN 业务的域名列表
export function getCDNDomainListPath() {
  return '/cdn/domain'
}

export function getCDNDomainDetailPath(domain: string) {
  return `/cdn/domain/${domain}`
}

export function getCDNCreateBucketDomainPath(bucketName: string) {
  return `/cdn/domain/create?bucket=${bucketName}&fixBucket`
}

export function getCDNRefreshPath() {
  return '/cdn/refresh-prefetch'
}

export function getCDNRefreshLogsPath() {
  return '/cdn/refresh-prefetch?tab=showLogs'
}
