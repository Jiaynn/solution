/**
 * @file env config
 * @author linchen <linchen@qiniu.com>
 */

declare interface IOEMConfig {
  logo: string
  vendor: string
  favicon: string
  title: string
  copyright: string
  domainHosting: boolean  // 域名托管功能
  hideLoginTitle: boolean // 隐藏登录页面的 title
}

declare let BUILD_TARGET: 'qiniu' | 'oem'
declare let OEM_CONFIG: IOEMConfig
declare let APP_VERSION: string
