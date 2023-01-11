/*
 * @file 质量保障服务相关接口
 * @author linchen <linchen@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'

import { prefix } from 'cdn/constants/api'
import { PrimeLevel, PrimeStatus } from 'cdn/constants/qas'

import CommonClient from './clients/common'

export interface IPrimeItem {
  level: PrimeLevel // level
  sla: string       // sla 等级
  ratio: number     // 赔付比率
  price: number     // 相对于原单价的比例
}

export interface IQasPrimeStatus {
  level: PrimeLevel // 等级
  state: PrimeStatus  // 状态
}

export interface IQasInfo {
  levelstates: IQasPrimeStatus[]
}

@injectable()
export default class QasApis {
  constructor(private client: CommonClient) {}

  getQasInfo() {
    return this.client.get<IQasInfo>(`${prefix}/insurance/get`)
  }

  cancelPrime(apply: PrimeLevel) {
    return this.client.post<void>(`${prefix}/insurance/cancel`, { apply })
  }

  openPrime(apply: PrimeLevel) {
    return this.client.post<void>(`${prefix}/insurance/set`, { apply })
  }
}
