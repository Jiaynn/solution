/**
 * @file OEM 独立部署相关常量
 * @author linchen <linchen@qiniu.com>
 */

import { Lang } from 'portal-base/common/i18n'

// 重构一期文档链接：
// https://www.processon.com/view/link/5d271e30e4b0f42d06806b50#map

// 编译的目标环境，通过 build-config 注入
export const target = BUILD_TARGET
// OEM 环境配置，包含了 logo 等信息
export const oemConfig = OEM_CONFIG
// OEM 环境下父账号的 uid
export const oemVendor = OEM_CONFIG && OEM_CONFIG.vendor

// 支持两种编译环境：OEM/Qiniu
export enum BuildTarget {
  Qiniu = 'qiniu',
  OEM = 'oem'
}

export const oemLang = oemConfig?.lang as Lang ?? Lang.Cn

export const isQiniu = target === BuildTarget.Qiniu
export const isOEM = target === BuildTarget.OEM

export const isDev = process.env.NODE_ENV === 'development'
