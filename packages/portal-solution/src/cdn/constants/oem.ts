import { valuesOfEnum } from 'cdn/utils'

export enum SubAccountStatus {
  UnFreeze = 1,
  Freeze = 2
}

export const subAccountStatusTextMap = {
  [SubAccountStatus.Freeze]: {
    cn: '已禁用',
    en: 'Disabled'
  },
  [SubAccountStatus.UnFreeze]: {
    cn: '已启用',
    en: 'Enabled'
  }
}

export const proxyLoginKey = 'ls.hasProxyLogin'
export const proxyLoginEmailHashKey = 'ls.email_hash'

export interface ISubAccountCreateResult {
  password: string
  email: string
  name: string
}

// 计费类型
export enum ChargeType {
  Traffic = 'traffic',    // 流量
  Bandwidth = 'bandwidth' // 带宽
}

export const chargeTypeTextMap = {
  [ChargeType.Traffic]: '流量',
  [ChargeType.Bandwidth]: '带宽'
}

export const chargeTypeUnitTextMap = {
  [ChargeType.Traffic]: 'GB',
  [ChargeType.Bandwidth]: 'Mbps'
}

export const chargeTypeValues = valuesOfEnum(ChargeType)

// 带宽计费时，还要选择是月95还是日95月平均平均
export enum SubChargeType {
  Month95 = 'peak95',       // 月95
  Month95Avg = 'avrPeak95'  // 日95月平均
}

export const subChargeTypeValues = valuesOfEnum(SubChargeType)

export const subChargeTypeTextMap = {
  [SubChargeType.Month95]: '月95',
  [SubChargeType.Month95Avg]: '日95月平均'
}

// 计费单价
export const chargeUnitTextMap = {
  [ChargeType.Traffic]: '元/GB',
  [ChargeType.Bandwidth]: '元/Mbps'
}

// 计费进制
export enum ChargeRadix {
  Radix1000 = 1000,
  Radix1024 = 1024
}

export const chargeRadixValues = valuesOfEnum(ChargeRadix)

// 计费系数
export const maxChargeCoefficient = 1.15

export const minChargeCoefficient = 1

export const defaultChargeCoefficient = 1.15
