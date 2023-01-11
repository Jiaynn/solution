/**
 * @file Refresh Prefetch Messages
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'

export const toast = {
  refreshCompleted: {
    cn: '刷新操作成功',
    en: 'Refresh Completed'
  },
  prefetchCompleted: {
    cn: '预取操作成功',
    en: 'Prefetch Completed'
  }
}

type QuotaNoteArgs = {
  urlQuotaDay: number
  refreshDirStatus: boolean
  dirQuotaDay: number
  quotaDay: number
}

export const quotaNote = {
  // eslint-disable-next-line react/display-name
  cn: ({ urlQuotaDay, refreshDirStatus, dirQuotaDay, quotaDay }: QuotaNoteArgs) => (
    <p>
      每天文件刷新限额 {urlQuotaDay} 个，
      {
        refreshDirStatus && `目录刷新 ${dirQuotaDay} 个，`
      }
      文件预取限额 {quotaDay} 个；
    </p>
  ),
  // eslint-disable-next-line react/display-name
  en: ({ urlQuotaDay, refreshDirStatus, dirQuotaDay, quotaDay }: QuotaNoteArgs) => (
    <p>
      The daily file refresh limit is {urlQuotaDay},
      {
        refreshDirStatus && `the directory refresh limit is ${dirQuotaDay},`
      }
      {` and the file prefetch limit is ${quotaDay}.`}
    </p>
  )
}

export const urlFormat = {
  cn: <p>每个 URL 应当以 http:// 或 https:// 开头，例如 http://www.example.com/index.html；</p>,
  en: <p>Each URL should start with http:// or https://, for example http://www.example.com/index.html.</p>
}

export const refreshUrl = {
  cn: '文件刷新',
  en: 'File refresh'
}

export const refreshUrlAlert = {
  cn: (urlSurplusDay: number) => `输入需要刷新缓存的文件路径，当前剩余：${urlSurplusDay}`,
  en: (urlSurplusDay: number) => `Enter the file path that needs to refresh the cache. Currently remaining: ${urlSurplusDay}`
}

export const refreshUrlPlaceholder = {
  cn: '示例：http://www.example.com/index.html\n。多个记录请用回车换行分隔，文件刷新每次最多提交 20 个。',
  en: 'For example: http://www.example.com/index.html\nPlease use carriage return to break multiple records, and submit at most 20 records each time.'
}

export const refreshDir = {
  cn: '目录刷新',
  en: 'Directory refresh'
}

export const refreshDirAlert = {
  cn: (dirSurplusDay: number) => `输入需要刷新缓存的目录路径，当前剩余：${dirSurplusDay}`,
  en: (dirSurplusDay: number) => `Enter the directory path that needs to refresh the cache. Currently, the remaining: ${dirSurplusDay}.`
}

export const refreshDirPlaceholder = {
  cn: '示例：http://www.example.com/\n。多个记录请用回车换行分隔，目录刷新每次最多提交 5 个。',
  en: 'For example: http://www.example.com/\nPlease use carriage return to break multiple records, and submit at most 5 records each time.'
}

export const prefetchUrl = {
  cn: '文件预取',
  en: 'File prefetch'
}

export const prefetchUrlAlert = {
  cn: (productName: string, surplusDay: number) => `输入需要预取的文件路径，主动预先推送资源到 ${productName} 节点，当前剩余：${surplusDay}`,
  en: (productName: string, surplusDay: number) => `Enter the file path that needs to be prefetched, and actively push resources to the ${productName} node in advance. Currently, the remaining: ${surplusDay}`
}

export const prefetchUrlPlaceholder = {
  cn: '示例：http://www.example.com/index.html\n。多个记录请用回车换行分隔，文件预取每次最多提交 20 个。',
  en: 'For example: http://www.example.com/index.html\nPlease use carriage return to break multiple records, and submit at most 20 records each time.'
}

export const opLogs = {
  cn: '操作记录',
  en: 'Operation record'
}

export const refresh = {
  cn: '点击刷新',
  en: 'Submit'
}

export const prefetch = {
  cn: '点击预取',
  en: 'Submit'
}
