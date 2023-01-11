/**
 * @file OEM Financial API
 * @author linchen <linchen@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import { Options } from 'qn-fe-core/client'
import { CommonApiException } from 'portal-base/common/apis/common'

import { oemPrefix } from 'cdn/constants/api'
import { ChargeType, SubChargeType, ChargeRadix } from 'cdn/constants/oem'

import CommonClient from '../clients/common'

export interface IFinancialBase {
  chargeType: ChargeType
  subChargeType: SubChargeType
  unitPrice: number
  radix: ChargeRadix
  coefficient: number
}

export interface IFinancial extends IFinancialBase {
  uid: number               // 用户 id
  name: string              // 用户名称
  email: string             // 用户邮箱
}

export interface IGetFinancialResp {
  list: IFinancial[]
  total: number
}

export interface IGetFinancialOptions {
  pageNo: number      // 页码
  pageSize: number    // 每页数据量
  content?: string    // 根据子帐户名称/邮箱模糊查询
}

// 查询当前月份的账单消费记录
export interface IBillBase {
  month: number                   // 账单时间：YYYYMM
  chargeType: ChargeType          // 计费类型
  subChargeType?: SubChargeType   // 子计费类型
  unitPrice: number               // 单价, 单位分
  monthCost?: number              // 月费用, 单位分
  usageAmount: number             // 使用量, 带宽单位bps，流量单位bytes
}

export interface IGetBillOptions {
  uid: number
  startTime: number   // 起始时间 (YYYYMM)
  endTime: number     // 截止时间 (YYYYMM)
  pageNo: number      // 页码
  pageSize: number    // 每页数据量
}

export interface IBill extends IBillBase {
  uid: number       // 用户 id
}

export interface IGetBillResp {
  list: IBill[]
  total: number
}

// 某月历史账单明细查询
export interface IBillSnapshot {
  peak95: number        // 带宽：月95
  peak95Avrage: number  // 带宽：日95月平均
  flow: number          // 流量
}

export interface IBillDetail extends IBillBase {
  radix: ChargeRadix        // 进制
  coefficient: number       // 系数
  snapshot: IBillSnapshot   // 使用数量快照
}

// 重新出账
export interface IUpdateBill extends IBillBase {
  radix: ChargeRadix  // 计费进制
  coefficient: number // 计费系数
}

const produceBillPayload: Options['producePayload'] = async send => {
  try {
    return (await send()).payload
  } catch (e: unknown) {
    // 账单不存在
    if (e instanceof CommonApiException && e.code === 404967) { // TODO: 尽量避免直接使用没有语义的 code
      return null
    }
    throw e
  }
}

@injectable()
export default class FinancialApis {
  private apiPrefix = `${oemPrefix}/financial`

  constructor(private client: CommonClient) {}

  getFinancial(options: IGetFinancialOptions) {
    return this.client.post<IGetFinancialResp>(`${this.apiPrefix}/rule/list`, options)
  }

  updateFinancial(uid: number, payload: IFinancialBase) {
    return this.client.post<void>(`${this.apiPrefix}/rule/upsert`, { uid, ...payload })
  }

  getFinancialDetail(uid: number) {
    return this.client.get<IFinancialBase>(`${this.apiPrefix}/rule/detail`, { uid })
  }

  getCurrentBill(uid: number) {
    return this.client.get<IBillBase>(`${this.apiPrefix}/billing/current`, { uid }, {
      producePayload: produceBillPayload
    })
  }

  getBillDetail(uid: number, month: number) {
    return this.client.post<IBillDetail>(`${this.apiPrefix}/billing/detail`, { uid, month }, { producePayload: produceBillPayload })
  }

  getBillList(options: IGetBillOptions) {
    return this.client.post<IGetBillResp>(`${this.apiPrefix}/billing/history`, options)
  }

  updateBill(uid: number, payload: IUpdateBill) {
    return this.client.post<void>(`${this.apiPrefix}/billing/reset`, { uid, ...payload })
  }
}
