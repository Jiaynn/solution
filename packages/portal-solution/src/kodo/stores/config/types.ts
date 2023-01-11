/**
 * @file config types
 * @author yinxulai <yinxulai@qiniu.com>
 */

// 从开始干到现在的配置变化 https://github.com/qbox/kodo-web/compare/98c0785f37941ae198d1d44b2512b219b26265de...master
import * as schema from './schema'

// 存储的模式
export enum StorageDeployMode {
  K8S = 'k8s',
  Physical = 'physical'
}

export type IPlatformBaseConfig = schema.ComputedJsonType<typeof schema.platformBaseConfigSchema>
export type IKodoFogBaseConfig = schema.ComputedJsonType<typeof schema.kodoFogBaseConfigSchema>
export type IPlatformConfig = schema.ComputedJsonType<typeof schema.platformConfigSchema>
export type IKodoFogConfig = schema.ComputedJsonType<typeof schema.kodoFogConfigSchema>
export type RegionApply = schema.ComputedJsonType<typeof schema.regionApplySchema>
export type IRegion = schema.ComputedJsonType<typeof schema.regionSchema>
export type HelpDocumentKey = keyof schema.ComputedJsonType<typeof schema.helpDocumentSchema>
export type IDoraOptions = schema.ComputedJsonType<typeof schema.doraConfigSchema>
