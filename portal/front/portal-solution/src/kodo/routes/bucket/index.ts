/**
 * @file bucket route TODO: 区分公有云、私有化
 * @author yinxulai <me@yinxulai.com>
 * @author zhangheng <zhangheng01@qiniu.com>
 */

import * as qs from 'query-string'
import { InjectFunc } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'

import { ConfigStore } from 'kodo/stores/config'

import { BucketPage } from 'kodo/constants/bucket'
import { RegionSymbolWithAll } from 'kodo/constants/region'
import { PrivateType } from 'kodo/constants/bucket/setting/access'

export interface IDetailsBaseOptions<T extends object = object> {
  bucketName: string // 空间名称
  path?: string
  query?: T
  anchor?: string
  visible?:(visible:boolean)=>void
}

export interface IDetailsOptions<T extends object = object> extends IDetailsBaseOptions<T> {
  page: BucketPage // 详情页面
}

// export interface IDetails
export type SearchType = 'name' | 'tag'

export type IListOptions = {
  region?: RegionSymbolWithAll // 地区
  searchName?: string // 名称搜索条件
  searchTag?: string // 标签搜索条件
  searchType?: SearchType //  搜索类型
  shouldCreateBucket?: boolean // 显示创建 Bucket 框
  redirectAfterCreate?: string // 用于 kodo 外的站点创建空间后回跳
  retrieveDomain?: string // 控制是否进入域名所有者校验流程
  bucketName?: string // Bucket 创建时传入 Name
  privateType?: PrivateType // Bucket 创建时传入 访问控制
}

export function getDetailRootPath(inject: InjectFunc) {
  const configStore = inject(ConfigStore)
  return `${configStore.rootPath}/bucket`
}

// 获取空间列表的路由路径
export function getListPath(inject: InjectFunc, query?: IListOptions): string {
  const configStore = inject(ConfigStore)
  return `${configStore.rootPath}/bucket${query ? '?' + qs.stringify(query) : ''}`
}

// 获取 options.page 指定的空间详情的路由路径
export function getDetailsPath<T extends object = object>(inject: InjectFunc, options: IDetailsOptions<T>): string {
  const configStore = inject(ConfigStore)
  const { page, path, query, bucketName, anchor } = options
  return `${configStore.rootPath}/bucket/${page}${path || ''}?${qs.stringify({ bucketName, ...query })}${anchor ? '#' + anchor : ''}`
}

// 获取空间设置的路由路径
export function getSettingPath(inject: InjectFunc, options: IDetailsBaseOptions): string {
  return getDetailsPath(inject, { ...options, page: BucketPage.Setting })
}

// 获取空间概览的路由路径
export function getOverviewPath(inject: InjectFunc, options: IDetailsBaseOptions): string {
  return getDetailsPath(inject, { ...options, page: BucketPage.Overview })
}

// 获取域名管理的路由路径
export function getDomainPath(inject: InjectFunc, options: IDetailsBaseOptions): string {
  return getDetailsPath(inject, { ...options, page: BucketPage.Domain })
}

// 获取空间对象管理的路由路径
export function getResourcePath(inject: InjectFunc, options: IDetailsBaseOptions): string {
  return getDetailsPath(inject, { ...options, page: BucketPage.Resource })
}

export function getResourceV2Path(inject: InjectFunc, options: IDetailsBaseOptions<any>): string {
  return getDetailsPath(inject, { ...options, page: BucketPage.ResourceV2 })
}

export function getResourceUploadPath(inject: InjectFunc, bucketName: string) {
  return getDetailsPath(inject, { page: BucketPage.Resource, path: '/upload', bucketName })
}

export function getTranscodeStylePath(inject: InjectFunc, options: IDetailsBaseOptions) {
  return getDetailsPath(inject, { ...options, page: BucketPage.TranscodeStyle })
}

export function gotoTranscodeStylePath(inject: InjectFunc, bucketName: string) {
  const routerStore = inject(RouterStore)
  routerStore.push(getTranscodeStylePath(inject, { bucketName }))
}

export function gotoResourcePage(inject: InjectFunc, bucketName: string) {
  const routerStore = inject(RouterStore)
  routerStore.push(getResourcePath(inject, { bucketName }))
}

export function gotoResourceUploadPage(inject: InjectFunc, bucketName: string) {
  const routerStore = inject(RouterStore)
  routerStore.push(getResourceUploadPath(inject, bucketName))
}
