/**
 * @file HitRatio Locale Messages
 * @author linchen <gakiclin@gmail.com>
 */

export { exportCsv } from 'cdn/locales/messages'

export { flow, bandwidth, reqCount } from '../messages'

export const request = {
  cn: '请求',
  en: 'Request'
}

export const hitRatio = {
  cn: '命中率',
  en: 'Hit ratio'
}

export const hitRatioDistribution = {
  cn: '命中率分布',
  en: 'Hit ratio distribution'
}

export const hitDetail = {
  cn: '命中详情',
  en: 'Hit detail'
}

export const flowHitRatio = {
  cn: '流量命中率',
  en: 'Flow hit ratio'
}

export const requestHitRatio = {
  cn: '请求命中率',
  en: 'Request hit ratio'
}

export const category = {
  cn: '类别',
  en: 'Category'
}

export const percent = {
  cn: '比例',
  en: 'Percent'
}

export const trafficHitRatioCalc = {
  cn: '流量命中率 = (1 - (回源流量 / 公网访问流量)) * 100%',
  en: 'Traffic hit rate = (1 - (return source traffic / total traffic)) * 100%'
}

export const requestHitRatioCalc = {
  cn: '请求命中率 = (1 - (回源请求数 / 公网访问请求数)) * 100%',
  en: 'Request hit rate = (1 - (number of requests back to source / total requests)) * 100%'
}
