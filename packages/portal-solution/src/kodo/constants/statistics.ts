/**
 * @file common constants of statistics
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import { StorageType, storageTypeTextMap, storageTypeDescTextMap } from 'kodo-base/lib/constants'

import { ValueOf } from 'kodo/types/ts'

export {
  StorageType,
  storageTypeTextMap,
  storageTypeDescTextMap
}

export enum StorageSrcType {
  FileStorage = 'fileStorage',
  FilePreDelete = 'filePreDelete',
  FileUploadCount = 'fileUploadCount'
}

export const storageTypeTransformSuccessTextMap = {
  [StorageType.Standard]: '文件转标准存储成功',
  [StorageType.LowFrequency]: '文件转低频存储成功',
  [StorageType.Archive]: '文件转归档存储成功',
  [StorageType.DeepArchive]: '文件转深度归档存储成功'
}

// 存储量接口的 select 字段可选值
export enum SelectField {
  SpaceSet = 'space_set', // 标准存储量
  CountSet = 'count_set', // 标准存储文件数
  SpaceLineSet = 'space_line_set', // 低频存储量
  CountLineSet = 'count_line_set', // 低频存储文件数
  Flow = 'flow', // 流量
  Hits = 'hits' // 请求数
}

export enum FlowSrcType {
  SingleExternalOutflow = 'singalExternalOutflow', // 单线路外网流出
  ExternalInflow = 'externalInflow', // 外部流入
  ExternalOutflow = 'externalOutflow', // 外部流出
  CDN = 'cdn',
  API = 'api'
}

export const flowSrcTypeTextMap = {
  [FlowSrcType.SingleExternalOutflow]: '单线路外网流出',
  [FlowSrcType.ExternalInflow]: '外网流入',
  [FlowSrcType.ExternalOutflow]: '外网流出',
  [FlowSrcType.CDN]: 'CDN 回源',
  [FlowSrcType.API]: 'API 请求'
}

export enum FileUploadCountSelectField {
  NormalUpCount = 'normal_up_count',
  LineUpCount = 'line_up_count',
  ArchiveUpCount = 'archive_up_count',
  DeepArchiveUpCount = 'deep_archive_up_count'
}

export const flowSrcValueMap = {
  [FlowSrcType.SingleExternalOutflow]: ['single_isp_flow_out'],
  [FlowSrcType.ExternalInflow]: ['origin'], // src 都是 origin 但是接口不同
  [FlowSrcType.ExternalOutflow]: ['origin'], // src 都是 origin 但是接口不同
  [FlowSrcType.CDN]: ['!origin', '!atlab', '!inner', '!ex'],
  [FlowSrcType.API]: ['origin', 'inner']
} as const

export type IFlowSrcValue = ValueOf<typeof flowSrcValueMap>

export enum KodoBillGroup {
  Bucket = 'bucket',
  Domain = 'domain'
}

export const kodoBillGroupTextMap = {
  [KodoBillGroup.Bucket]: '空间',
  [KodoBillGroup.Domain]: '域名'
}

export const limitOfBucketNumber = 20

export const limitOfDomainNumber = 25
