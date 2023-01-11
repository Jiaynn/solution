/*
 * @file base utils
 * @author nighca <nighca@live.cn>
 */

import moment from 'moment'

import { RouterStore } from 'portal-base/common/router'

export interface IPayOrderOptions {
  orderId: string       // fusion 订单号
  tradeOrderId: string  // BO 订单号
}

export function payForOrder({ tradeOrderId }: IPayOrderOptions, routerStore: RouterStore) {
  routerStore.push(`/financial/verify-order/${tradeOrderId}`)
}

export function humanizeTime(time: number, format?: string) {
  return format
    ? moment(time * 1000).format(format)
    : moment(time * 1000).format('YYYY-MM-DD HH:mm:ss')
}
