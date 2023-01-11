/**
 * @file regions constants
 * @author yinxulai <me@yinxulai.cn>
 */

export type SymbolAll = 'all-region'

export const regionAll = {
  name: '全部',
  invisible: false,
  symbol: 'all-region',
  description: '全部的区域数据'
}

// TODO: 陈旧代码，等待删除
export enum PublicRegionSymbol {
  Z0 = 'z0', // 华东
  Z1 = 'z1', // 华北
  Z2 = 'z2', // 华南
  Z3 = 'z3', // 华东2
  Na0 = 'na0', // 北美
  As0 = 'as0', // 东南亚
  CnEast2 = 'cn-east-2', // 华东浙江 2
  ApNortheast1 = 'ap-northeast-1' // 亚太-首尔 1
}

export type RegionSymbol = PublicRegionSymbol | string
export type RegionSymbolWithAll = RegionSymbol | SymbolAll
