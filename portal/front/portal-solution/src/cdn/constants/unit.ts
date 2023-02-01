/*
 * @file unit relative constants
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

export type StorageSizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB'
export const storageSizeUnits: StorageSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']

export const storageSizeUnitOptions = storageSizeUnits.map(it => ({
  label: it,
  value: it
}))

export type BandwidthUnit = 'bps' |'Kbps' | 'Mbps' | 'Gbps' | 'Tbps'

export const bandwidthUnitList: BandwidthUnit[] = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps']

export const bandwidthUnitOptions = bandwidthUnitList.map(it => ({
  label: it,
  value: it
}))

export type TrafficUnit = 'B' |'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB'

export const trafficUnitList: TrafficUnit[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']

export const trafficUnitOptions = trafficUnitList.map(it => ({
  label: it,
  value: it
}))

export type ReqCountUnit = '次' | '千次' | '百万次'
export const reqCountUnitList: ReqCountUnit[] = ['次', '千次', '百万次']

export const reqCountUnitOptions = reqCountUnitList.map(it => ({
  label: it,
  value: it
}))

export enum UnitRadix {
  Bandwidth = 1000,
  Traffic = 1024,
  Storage = 1024,
  ReqCount = 1000
}
