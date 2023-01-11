/**
 * @file 配置化功能点，各子组件中不再关注是在哪一个产品下
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'

import { StatisticsDataSource } from 'cdn/constants/statistics'
import { CertInputType, certInputTypeList, DomainType, Platform, SourceType, sourceTypeList } from 'cdn/constants/domain'

import { BandwidthDataType, FlowDataType, TrafficUserType } from 'cdn/apis/statistics'

export type AbilityTrafficType = {
  flow: FlowDataType
  bandwidth: BandwidthDataType
  userFlow: TrafficUserType
  userBandwidth: TrafficUserType
}

@injectable()
export default abstract class AbilityConfig {
  /** 使用场景选项 */
  abstract domainPlatforms: Platform[]
  /** 域名类型选项 */
  abstract domainTypes: DomainType[]
  /** 隐藏使用场景 */
  abstract hideDomainPlatform: boolean
  /** 源站类型选项 */
  abstract domainSourceTypes: SourceType[]
  /** 是否使用静态缓存规则 */
  abstract useStaticCacheConfig: boolean
  /** 缓存规则字段文案 */
  abstract cacheControlFieldLabel: string
  /** 隐藏动态的计量数据 */
  abstract hideDynTraffic: boolean
  /** 隐藏流量方向 */
  abstract hideFlowDirection: boolean
  /** 产品名称 */
  abstract productName: string
  /** 计量接口 type 值 */
  abstract defaultTrafficTypes: AbilityTrafficType
  /** 证书类型选项，用于升级至 https */
  abstract certInputTypes: CertInputType[]
  /** 是否支持中间源 */
  abstract supportMidSource: boolean
  /** 请求数统计数据源 */
  abstract reqCountDataSource: StatisticsDataSource
  /** 动态 302 业务数据开关 */
  abstract dynamic302Enabled: boolean
}

export class CdnAbilityConfig extends AbilityConfig {
  domainPlatforms = [Platform.Web, Platform.Download, Platform.Vod]
  hideDomainPlatform = false
  domainTypes = [DomainType.Normal, DomainType.Wildcard, DomainType.Pan]
  domainSourceTypes = sourceTypeList
  useStaticCacheConfig = false
  cacheControlFieldLabel = '缓存时间'
  hideDynTraffic = true
  hideFlowDirection = true
  productName = 'CDN'
  defaultTrafficTypes: AbilityTrafficType = {
    flow: 'flux',
    bandwidth: 'bandwidth',
    userFlow: 'flux',
    userBandwidth: 'bandwidth'
  }
  certInputTypes = certInputTypeList
  supportMidSource = true
  reqCountDataSource = StatisticsDataSource.Analysis
  dynamic302Enabled = true
}

export class DcdnAbilityConfig extends AbilityConfig {
  domainPlatforms = [Platform.Dynamic]
  hideDomainPlatform = true
  domainTypes = [DomainType.Normal, DomainType.Wildcard]
  domainSourceTypes = [SourceType.Domain, SourceType.Ip]
  useStaticCacheConfig = true
  cacheControlFieldLabel = '静态缓存规则'
  hideDynTraffic = false
  hideFlowDirection = true
  productName = 'DCDN'
  defaultTrafficTypes: AbilityTrafficType = {
    flow: 'all',
    bandwidth: 'all',
    userFlow: 'bidiflow',
    userBandwidth: 'bidibandwidth'
  }
  certInputTypes = [CertInputType.Existed, CertInputType.Local]
  supportMidSource = false
  reqCountDataSource = StatisticsDataSource.Traffic
  dynamic302Enabled = false
}

export class OemAbilityConfig extends CdnAbilityConfig {
  domainTypes = [DomainType.Normal, DomainType.Wildcard]
  certInputTypes = [CertInputType.Existed, CertInputType.Local]
  dynamic302Enabled = false
}
