import { trim } from 'lodash'
import { RawLocaleMessage } from 'portal-base/common/i18n'

import * as messages from 'cdn/locales/messages'

import { stateType } from 'cdn/constants/refresh-prefetch'

export function transUrlsToArr(urls: string): string[] {
  if (urls === '' || urls === undefined) {
    return []
  }

  const urlList = urls
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
    .replace(/\n{2,}/g, '\n')
    .split('\n')

  return urlList.map(url => trim(url)).filter(Boolean)
}

export function validateUrlSchemes(urls: string[]): RawLocaleMessage | undefined {
  // 输入的 URL 中不能没有协议头，支持 https、http 两种协议
  if (!urls.every(url => (/^http(s?):\/\//i).test(url))) {
    return {
      cn: '每个 URL 应当以 http:// 或 https:// 开头',
      en: 'Each URL should start with http:// or https://'
    }
  }
}

export function validateDirs(urls: string[]): RawLocaleMessage | undefined {
  if (urls.length > 5) {
    return {
      cn: '每次最多提交 5 个目录',
      en: 'Submit up to 5 directories at a time'
    }
  }

  if (!urls.every(url => (/\/$/).test(url))) {
    return {
      cn: '每个 URL 应当以 / 结尾',
      en: 'Each URL should end with /'
    }
  }

  return validateUrlSchemes(urls)
}

export function validateUrls(urls: string[]): RawLocaleMessage | undefined {
  if (urls.length > 20) {
    return {
      cn: '每次最多提交 20 个文件',
      en: 'Submit up to 20 documents at a time'
    }
  }
  return validateUrlSchemes(urls)
}

export function humanizeRPState(state: string) {
  return stateType[state as keyof typeof stateType] || messages.unknownState
}
