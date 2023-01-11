import { SourceType, DomainType } from 'cdn/constants/domain'

import { IQueryParams } from 'cdn/apis/domain'

export function getSearchDomainsParamsForVideoSlim(params: IQueryParams): IQueryParams {
  return { // 一期仅支持回源为七牛 bucket 的去参数缓存的普通域名和泛子域名
    ...params,
    sourceType: SourceType.QiniuBucket,
    ignoreQuery: true,
    includePanType: true, // 包括泛子域名
    typeNe: [DomainType.Test, DomainType.Wildcard] // 过滤掉测试域名和泛域名
  }
}

export function getSearchDomainsParamsForVideoSlimStatistic(params: IQueryParams): IQueryParams {
  return { // 一期仅支持回源为七牛 bucket 的去参数缓存的普通域名和泛子域名 (但是数据统计那边要求不可以包含泛子域名)
    ...params,
    sourceType: SourceType.QiniuBucket,
    ignoreQuery: true,
    typeNe: [DomainType.Test] // 过滤掉测试域名
  }
}

export function getVideoSlimStatisticDefaultParams(): Partial<IQueryParams> {
  return {
    sourceType: SourceType.QiniuBucket,
    ignoreQuery: true,
    typeNe: [DomainType.Test] // 过滤掉测试域名
  }
}

export function isMP4(url: string) {
  const fileName = url.split('/').pop()

  // 以 .mp4 结尾 或 无后缀的，认为可能是 mp4 文件（忽略大小写）
  return (
    fileName && (
      fileName.indexOf('.') === -1 || fileName.split('.').pop()?.toLowerCase() === 'mp4'
    )
  )
}
