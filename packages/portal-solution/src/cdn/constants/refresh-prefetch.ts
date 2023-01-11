import { valuesOfEnum } from 'cdn/utils'

export const defaultSurplusInfo = {
  dirQuotaDay: 0,
  dirSurplusDay: 0,
  quotaDay: 100,
  surplusDay: 100,
  urlQuotaDay: 100,
  urlSurplusDay: 100
}

export const stateType = {
  success: {
    cn: '成功',
    en: 'Success'
  },
  processing: {
    cn: '正在处理',
    en: 'Processing'
  },
  failure: {
    cn: '失败',
    en: 'Failure'
  }
}

export const defaultQueryParam = {
  pageNo: 0
}

export enum TabUrl {
  RefreshUrl = 'refreshUrl',
  ShowLogs = 'showLogs',
  PrefetchUrl = 'prefetchUrl',
  RefreshDir = 'refreshDir'
}

export const tabUrlValues = valuesOfEnum(TabUrl)
