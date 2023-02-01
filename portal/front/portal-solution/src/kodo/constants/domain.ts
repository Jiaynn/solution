/**
 * @file domain constants
 * @description domain 的常量定义
 * @author yinxulai <me@yinxulai.com>
 * @author zhangheng <zhangheng01@qiniu.com>
 */

// TDOO: 搞清楚这里 baseDomainPattern & normalDomainPattern 的定位区别
export const baseDomainPattern = /^([0-9a-zA-Z-]+\.)+[0-9a-zA-Z-]+$/
export const normalDomainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,7}$/

// 宽松的匹配 IP 的正则，支持 IPv4/IPv6
// 正则来自 https://github.com/qbox/portal-fusion/pull/255/files#diff-7c102c938ff40fdfc6b20fad144a240fL3
export const IPPattern = (/^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/)

export enum DomainType {
  CDN = 'cdn',
  Source = 'source'
}

export enum DomainSourceType {
  CDN = 0, // CDN 域名
  Source = 1, // 源站 域名
  CDNAndSource = 2 // 同时绑定为 CDN 和源站域名
}

export enum DomainFreezeType {
  ICPExpired = 'ICP_EXPIRED',
  Violation = 'VIOLATION'
}

// 私有云绑定时指定绑定的域名类型
export enum DomainScope {
  IO = 0, // 七牛的 IO
  S3 = 1 // S3 协议
}

export const domainScopeName = {
  [DomainScope.IO]: '七牛原生接口',
  [DomainScope.S3]: 'S3 兼容协议接口'
}

export enum CDNDomainStatus {
  Success = 'success',
  Failed = 'failed',
  Offlined = 'offlined',
  Processing = 'processing',
  Frozen = 'frozen',
  WaitCNAME = 'waitCNAME'
}

// 该枚举项含义请结合 transform/domain.ts 里的说明参考
export enum CDNDomainOperationType {
  CreateDomain = 'create_domain',
  DeleteDomain = 'delete_domain',
  ModifySource = 'modify_source',
  ModifyReferer = 'modify_referer',
  ModifyBsauth = 'modify_bsauth',
  OfflineBsauth = 'offline_bsauth',
  ModifyCache = 'modify_cache',
  Record = 'record',
  ModifyHttpsCrt = 'modify_https_crt',
  ModifyTimeAcl = 'modify_timeacl',
  Sslize = 'sslize',
  Switch = 'switch',
  ModifyHttpsConf = 'modify_https_conf'
}

export enum CDNDomainBucketType {
  KodoHttps = 'kodoHttps',
  FusionHttps = 'fusionHttps',
  PiliTest = 'piliTest',
  KodoBktTest = 'kodoBktTest',
  KodoTest = 'kodoTest',
  PanCustomer = 'panCustomer',
  WildcardCustomer = 'wildcardCustomer',
  FusionCustomer = 'fusionCustomer'
}

export enum CDNDomainType {
  Normal = 'normal',
  Wildcard = 'wildcard',
  Pan = 'pan',
  Test = 'test'
}

export enum CountryType {
  China = 'china',
  Foreign = 'foreign',
  Global = 'global'
}

export const domainFreezeTypesTextMap = {
  [DomainFreezeType.ICPExpired]: 'ICP 备案过期',
  [DomainFreezeType.Violation]: '违规'
} as const

export const CDNDomainStatusTextMap = {
  [CDNDomainStatus.Success]: '成功',
  [CDNDomainStatus.Failed]: '失败',
  [CDNDomainStatus.Offlined]: '停用',
  [CDNDomainStatus.Frozen]: '已冻结',
  [CDNDomainStatus.Processing]: '处理中',
  [CDNDomainStatus.WaitCNAME]: '等待 CNAME'
}

export const CDNDomainStatusColorMap = {
  [CDNDomainStatus.Success]: 'green4',
  [CDNDomainStatus.Failed]: 'red2',
  [CDNDomainStatus.Offlined]: 'red2',
  [CDNDomainStatus.Frozen]: 'yellow2',
  [CDNDomainStatus.Processing]: 'blue4',
  [CDNDomainStatus.WaitCNAME]: 'yellow3'
} as const

export const CDNDomainTypeTextMap = {
  [CDNDomainType.Normal]: '普通域名',
  [CDNDomainType.Wildcard]: '泛域名',
  [CDNDomainType.Pan]: '泛子域名',
  [CDNDomainType.Test]: '七牛测试域名'
}

export const countryTextMap = {
  [CountryType.China]: '大陆',
  [CountryType.Foreign]: '海外',
  [CountryType.Global]: '全球'
}
