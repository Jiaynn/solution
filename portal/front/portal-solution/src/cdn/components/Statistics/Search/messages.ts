/**
 * @file Statistics Search Locale Messages
 * @author linchen <gakiclin@gmail.com>
 */

export { isp, region, trafficRegion } from '../messages'

export const search = {
  cn: '搜索',
  en: 'Search'
}

export const dateRange = {
  cn: '时间范围',
  en: 'Date range'
}

export const granularity = {
  cn: '时间粒度',
  en: 'Time granularity'
}

export const today = {
  cn: '今天',
  en: 'Today'
}

export const yesterday = {
  cn: '昨天',
  en: 'Yesterday'
}

export const thisMonth = {
  cn: '本月',
  en: 'This month'
}

export const lastNDays = {
  cn: (num: number) => `最近 ${num} 天`,
  en: (num: number) => `Last ${num} days`
}
