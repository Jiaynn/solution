/**
 * @file OEM 独立部署相关常量
 * @author linchen <linchen@qiniu.com>
 */

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

// certificate 环境暂时没有qiniu环境变量
export const isQiniu = target !== BuildTarget.OEM
export const isOEM = target === BuildTarget.OEM

// APP_VERSION 来自于 build-config.json
// spock 构建时增加了脚本，将 APP_VERSION 设置为 `${当前打包时刻}-${最后的 commit id}`
export const appVersion = APP_VERSION
// 当前打包时刻(eg. 191115170744 表示 2019-11-15 17:07:44), 最后的 commit id
export const [buildAt, lastCommitId] = appVersion.split('-')
