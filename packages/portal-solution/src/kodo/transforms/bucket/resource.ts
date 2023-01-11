/**
 * @file transforms for resource file
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import qs from 'querystring'

import { proxyResource } from 'portal-base/common/utils/resource-proxy'

import { ConfigStore } from 'kodo/stores/config'

import { versionSeparator } from 'kodo/constants/bucket/resource'

import { RegionSymbol } from 'kodo/constants/region'

import { IBucket } from 'kodo/apis/bucket'
import { IFileStat } from 'kodo/apis/bucket/resource'

import { encodeUrlSafeBase64 } from '../base64'

export interface IEncodedEntryURIOptions {
  key: string
  version?: string
}

type EncodedEntryURI = string

export function getKeyAndVersion(keyName: string): IEncodedEntryURIOptions {
  if (!keyName) {
    throw new Error('key 不能为空')
  }

  const [key, version] = keyName.split(versionSeparator)
  return {
    key,
    version
  }
}

/**
 * 判断在预览文件时是否使用服务端返回的原始 URL，以下几种情况需要显示原始 URL：
 *
 * 1. 文件的类型为音频或视频时；
 * 2. 预览的链接使用的是 S3 域名时；
 * 3. 空间为私有空间时；
 * 4. 空间开启了原图保护时；
 *
 * @param bucketInfo 空间信息
 * @param fileInfo 文件信息
 */
export function shouldUseSourceUrlInFilePreview(
  bucketInfo: IBucket | undefined,
  fileInfo: IFileStat | undefined
) {
  if (bucketInfo == null || fileInfo == null) return true

  const type = fileInfo && fileInfo.mimeType && fileInfo.mimeType.split('/')[0]
  const queryObj = qs.parse(fileInfo && fileInfo.preview_url)
  const isAudioOrVideo = ['audio', 'video'].includes(type)
  const isS3Domain = Boolean(queryObj['X-Amz-Signature'])
  const isPrivate = Boolean(bucketInfo && bucketInfo.private)
  const isProtected = Boolean(bucketInfo && bucketInfo.protected)
  return isAudioOrVideo || isS3Domain || isPrivate || isProtected
}

/**
 * 传入资源链接，返回代理后的链接
 * 当前 区域配置中不允许使用代理 或 传入的资源链接为 https 协议时返回原始资源链接
 * @param url 资源链接
 * @param region 区域名称
 */
export function getResourceProxyUrl(
  configStore: ConfigStore,
  url: string,
  region: RegionSymbol,
  force = false
): string {
  const regionConfig = configStore.getRegion({ region })

  if (!regionConfig || !url) { return '' }
  const { enable = false } = regionConfig.objectStorage.resourceProxy || {}
  // 没有 http 开头时，也说明是一个本站请求
  if (!force && (!enable || url.startsWith('https://') || !url.startsWith('http://'))) { return url }

  return proxyResource(url)
}

export function getEncodedEntryURI(
  bucketName: string,
  options: IEncodedEntryURIOptions
): EncodedEntryURI {
  return encodeUrlSafeBase64(`${bucketName}:${getTargetKey(options)}`)
}

export function getTargetKey(options: IEncodedEntryURIOptions): string {
  if (options.version) {
    return `${options.key}${versionSeparator}${options.version}`
  }

  return options.key
}

// 修饰 key 以区分新上传的和已存在列表中的
export function decorateKey(key: string, isNew: boolean) {
  return isNew ? `new:${key}` : `old:${key}`
}

// 通过 decoratedKey 获取原始资源名
export function getOriginalKey(decoratedKey: string) {
  return decoratedKey.slice(4)
}

// 根据被修饰的 key 判断是否是新上传的
export function isNewDecoratedKey(decoratedKey: string) {
  return decoratedKey.indexOf('new:') === 0
}

// 根据被修饰的 key 判断是否是已存在列表的
export function isOldDecoratedKey(decoratedKey: string) {
  return decoratedKey.indexOf('old:') === 0
}

// 根据当前屏幕可视区域宽度来对输入进行省略显示：两边截取中间省略，如果不符合省略显示标准，则原值返回
export function getInterceptionValue(value: string) {
  // 目前主流的 pc 屏幕宽度为 1366、1440、1920
  const width = document.body.clientWidth
  // 一行显示最大长度，默认值为小于 1366 的长度，初始化时检查是否含有中文
  let maxLengthPerline: number = /[\u4E00-\u9FA5]/.test(value) ? 20 : 30
  // 最大显示行数
  const maxDisplayLines = 2

  if (width >= 1366 && width < 1440) {
    maxLengthPerline += 5
  } else if (width >= 1440 && width < 1920) {
    maxLengthPerline += 10
  } else {
    maxLengthPerline += 15
  }

  // 转成数组计算长度（因为 JavaScript 只能处理 UCS-2 编码）
  const exactData = Array.from(value)

  // 如果长度不超过展示行数能展示的总长度则原样返回
  if (exactData.length <= maxLengthPerline * maxDisplayLines) {
    return value
  }

  const ellipsis = '...'

  const interceptionLength = Math.floor((maxLengthPerline * maxDisplayLines - ellipsis.length) / 2)

  const headSubstring = exactData.slice(0, interceptionLength).join('')
  const tailSubstring = exactData.slice(-interceptionLength).join('')

  return headSubstring + ellipsis + tailSubstring
}

/**
 * @param  {string} value
 * @returns string
 * @description 对文件的 key 进行编码，跳过 /
 * @todo 针对连续的 / 需要进行特殊处理 https://developer.qiniu.com/kodo/kb/2636/special-access-to-key-resources
 */
export function encodeObjectKey(value: string): string {
  return encodeURIComponent(value).replace(/%2F/g, '/')
}
