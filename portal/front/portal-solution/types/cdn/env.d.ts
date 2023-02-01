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
