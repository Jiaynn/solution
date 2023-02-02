/**
 * @file env config
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

// build config hack
declare const KODO_PORTAL_ENV: {
  // 禁止使用的保留字段
  DOC: never
}

// process.env
declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'

    ROUTE_BASE_NAME_MAP: 'built-in' | Record<string, string> // 路由的 basename 配置

    TRACK_ANALYTICS: boolean // 追踪分析

    SITE_CONFIG: {
      favicon: string // 网站的 favicon
      pageTitle: string // 网站标题
      loadingText: string // loading 时的文字
      loadingImg: string // loading 时的图片
    }
  }
}

/**
 * @file env config
 * @author linchen <linchen@qiniu.com>
 */

declare interface OEMConfig {
  logo: string
  vendor: number
  favicon: string
  title: string
  copyright: string
  lang: 'en' | 'cn'
  domainHosting: boolean                  // 域名托管功能
  financial: boolean                      // 财务中心
  hideLoginTitle: boolean                 // 隐藏登录页面的 title
  hideCreateDomain: boolean               // 隐藏创建域名的操作入口
  hideUpdateDomain: boolean               // 隐藏更新域名的操作入口
  hideSubAccountDomainListCname: boolean  // 对子用户隐藏域名列表页的 cname
  hideSubAccountDomainDetailCname: boolean // 对子用户隐藏域名配置详情页的 cname
  hideSubAccountDomainOperations: boolean // 对子用户隐藏域名的操作 (只保留统计操作)
  hideSubAccountCreateDomain: boolean     // 对子用户隐藏创建域名的操作
  hideSubAccountGeoForeign: boolean       // 对子用户禁用海外覆盖范围
  hideSubAccountGeoGlobal: boolean        // 对子用户禁用全球覆盖范围
  hideSubAccountStatsUsagePeakAverage: boolean    // 对子用户隐藏平均峰值带宽
  hideSubAccountStatsUsagePeak95Average: boolean  // 对子用户隐藏平均 95 峰值带宽
  statisticsDateRangeDays: number // 数据统计默认时间范围, 最近的天数
  statisticsFreq: string // 数据统计粒度 '1day' | '1hour' | '5min'
}

declare let BUILD_TARGET: 'qiniu' | 'oem'
declare let OEM_CONFIG: OEMConfig
declare let APP_VERSION: string
