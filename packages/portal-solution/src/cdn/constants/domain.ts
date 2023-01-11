/*
 * @file domain-relative constants
 * @author nighca <nighca@live.cn>
 */

import { values } from 'lodash'
import { RawLocaleMessage } from 'portal-base/common/i18n'

import { valuesOfEnum } from 'cdn/utils'

export enum DomainType {
  Normal = 'normal',
  Wildcard = 'wildcard',
  Pan = 'pan',
  Test = 'test'
}

export const domainTypeList = valuesOfEnum(DomainType)

export const domainTypeTextMap: Readonly<Record<DomainType, RawLocaleMessage>> = {
  [DomainType.Normal]: {
    cn: '普通域名',
    en: 'Common domain'
  },
  [DomainType.Wildcard]: {
    cn: '泛域名',
    en: 'Wildcard domain'
  },
  [DomainType.Pan]: {
    cn: '泛子域名',
    en: 'Wildcard subdomain'
  },
  [DomainType.Test]: {
    cn: '测试域名',
    en: 'Test domain'
  }
}

export enum GeoCover {
  China = 'china',
  Foreign = 'foreign',
  Global = 'global'
}

export const geoCovers = {
  china: 'china',
  foreign: 'foreign',
  global: 'global'
}

export const geoCoverList = values(geoCovers)

export const geoCoverTextMap = {
  [geoCovers.china]: {
    cn: '中国大陆',
    en: 'Chinese Mainland'
  },
  [geoCovers.foreign]: {
    cn: '海外',
    en: 'Outside Mainland China'
  },
  [geoCovers.global]: {
    cn: '全球',
    en: 'Global'
  }
}

export enum Protocol {
  Http = 'http',
  Https = 'https'
}

export const protocolValues = valuesOfEnum(Protocol)

export const protocolTextMap = {
  [Protocol.Http]: 'HTTP',
  [Protocol.Https]: 'HTTPS'
}

export type TrafficProtocol = Protocol[]

export const allTrafficProtocols = valuesOfEnum(Protocol)

export enum Platform {
  Web = 'web',
  Download = 'download',
  Vod = 'vod',
  Dynamic = 'dynamic'
}

export const platformValues = valuesOfEnum(Platform)

export const platformTextMap = {
  [Platform.Web]: {
    cn: '图片小文件',
    en: 'Image & file'
  },
  [Platform.Download]: {
    cn: '下载分发',
    en: 'Download'
  },
  [Platform.Vod]: {
    cn: '点播平台',
    en: 'Video'
  },
  [Platform.Dynamic]: {
    cn: '动态加速',
    en: 'DCDN'
  }
}

export enum SourceURLScheme {
  Follow = '',
  Http = 'http',
  Https = 'https'
}

export const sourceURLSchemeList = valuesOfEnum(SourceURLScheme)

export const sourceURLSchemeTextMap = {
  [SourceURLScheme.Follow]: '遵循请求协议',
  [SourceURLScheme.Http]: 'HTTP',
  [SourceURLScheme.Https]: 'HTTPS'
}

export enum SourceType {
  QiniuBucket = 'qiniuBucket',
  Domain = 'domain',
  Ip = 'ip',
  Advanced = 'advanced'
}

export const sourceTypeList = valuesOfEnum(SourceType)

export const sourceTypeOptionTextMap: Readonly<Record<SourceType, string>> = {
  [SourceType.QiniuBucket]: '七牛云存储',
  [SourceType.Domain]: '源站域名',
  [SourceType.Ip]: 'IP 地址',
  [SourceType.Advanced]: '高级设置'
}

// 回源地址类型选择 radio 中的 sourceHost 文案
export const sourceHostConfigTextMap = {
  [SourceType.Domain]: '源站域名'
}

export enum SourceHostConfigType {
  Source = 'source',
  Domain = 'domain',
  Custom = 'custom'
}

export const sourceHostConfigOptionTextMap = {
  [SourceHostConfigType.Source]: '源站配置',
  [SourceHostConfigType.Domain]: '加速域名',
  [SourceHostConfigType.Custom]: '自定义'
}

export enum SourceIgnoreParamsType {
  All = 'all',
  Customize = 'customize'
}

export const sourceIgnoreParamsTypeValues = valuesOfEnum(SourceIgnoreParamsType)

export const sourceIgnoreParamsTypeTextMap = {
  [SourceIgnoreParamsType.All]: '去除所有参数回源',
  [SourceIgnoreParamsType.Customize]: '去除指定参数回源'
}

export enum CacheType {
  Customize = 'customize',
  Follow = 'follow'
}

export const cacheTypeList = valuesOfEnum(CacheType)

export const cacheTypeTextMap = {
  [CacheType.Customize]: '自定义',
  [CacheType.Follow]: '遵循源站'
}

export enum CacheControlType {
  Path = 'path',
  Suffix = 'suffix',
  Unknown = 'unknown',
  All = 'all',
  // 后端不存储 cache type，当需要表示 cache type 为 follow 时，
  // 会在 cache controls 中有一条 type 为 follow 的 cache control
  Follow = 'follow'
}

export const cacheControlTypeList = values(CacheControlType)

export const cacheControlTypeTextMap = {
  [CacheControlType.Path]: '目录',
  [CacheControlType.Suffix]: '后缀',
  [CacheControlType.Unknown]: '未指定',
  [CacheControlType.All]: '全局配置',
  [CacheControlType.Follow]: '遵循源站'
}

export const cacheControlTimeunits = {
  year: 6,
  month: 5,
  week: 4,
  day: 3,
  hour: 2,
  minute: 1,
  second: 0
}

export const cacheControlTimeunitList = values(cacheControlTimeunits)

export const cacheControlTimeunitTextMap = {
  [cacheControlTimeunits.year]: '年',
  [cacheControlTimeunits.month]: '月',
  [cacheControlTimeunits.week]: '周',
  [cacheControlTimeunits.day]: '天',
  [cacheControlTimeunits.hour]: '时',
  [cacheControlTimeunits.minute]: '分',
  [cacheControlTimeunits.second]: '秒'
}

// “遵循源站” 缓存类型使用的缓存规则
export const cacheControlForCacheTypeFollow = {
  type: CacheControlType.Follow
}

// “自定义” 缓存类型使用的全局配置规则
export const defaultCacheControl = {
  type: CacheControlType.All,
  time: 30,
  timeunit: cacheControlTimeunits.day,
  rule: ''
}

// “自定义” 缓存类型且域名 platform 为 web 时使用的全局配置规则
// web 为图片小文件，默认缓存一天
export const defaultCacheControlForPlatformWeb = {
  type: CacheControlType.All,
  time: 1,
  timeunit: cacheControlTimeunits.day,
  rule: ''
}

export const cacheControlForM3u8NoCache = {
  type: CacheControlType.Suffix,
  time: 0,
  timeunit: cacheControlTimeunits.minute,
  rule: '.m3u8'
}

export const recommendedCacheControlsMap = {
  [Platform.Web]: [
    {
      type: CacheControlType.Suffix,
      rule: '.jpg;.jpeg;.png;.bmp;.gif;.webp;.ico',
      time: 1,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.js;.css;.txt;.xml;.shtml;.html;.htm;.csv;.bat',
      time: 1,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.m3u8',
      time: 1,
      timeunit: cacheControlTimeunits.hour
    },
    {
      type: CacheControlType.Suffix,
      rule: '.avi;.mkv;.mp4;.mov;.flv;.rm;.rmvb;.swf',
      time: 7,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.mp3;.wav;.wmv;.rmi;.aac',
      time: 7,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.rar;.7z;.zip;.gzip;.dmg;.gz;.ios;.tar;.jar',
      time: 7,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.exe;.deb;.ipa;.apk;.sis;.psd;.dat',
      time: 7,
      timeunit: cacheControlTimeunits.day
    }
  ],
  [Platform.Download]: [
    {
      type: CacheControlType.Suffix,
      rule: '.rar;.7z;.zip;.gzip;.dmg;.gz;.ios;.tar;.jar',
      time: 30,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.exe;.deb;.ipa;.apk;.sis;.psd;.dat',
      time: 30,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.m3u8',
      time: 1,
      timeunit: cacheControlTimeunits.hour
    },
    {
      type: CacheControlType.Suffix,
      rule: '.jpg;.jpeg;.png;.bmp;.gif;.webp;.ico',
      time: 1,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.js;.css;.txt;.xml;.shtml;.html;.htm;.csv;.bat',
      time: 1,
      timeunit: cacheControlTimeunits.day
    }
  ],
  [Platform.Vod]: [
    {
      type: CacheControlType.Suffix,
      rule: '.m3u8',
      time: 1,
      timeunit: cacheControlTimeunits.hour
    },
    {
      type: CacheControlType.Suffix,
      rule: '.avi;.mkv;.mp4;.mov;.flv;.rm;.rmvb;.swf',
      time: 30,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.mp3;.wav;.wmv;.rmi;.aac',
      time: 30,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.jpg;.jpeg;.png;.bmp;.gif;.webp;.ico',
      time: 1,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.js;.css;.txt;.xml;.shtml;.html;.htm;.csv;.bat',
      time: 1,
      timeunit: cacheControlTimeunits.day
    }
  ],
  [Platform.Dynamic]: [
    {
      type: CacheControlType.Suffix,
      rule: '.jpg;.jpeg;.png;.bmp;.gif;.webp;.ico',
      time: 1,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.js;.css;.txt;.xml;.shtml;.html;.htm;.csv;.bat',
      time: 1,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.m3u8',
      time: 1,
      timeunit: cacheControlTimeunits.hour
    },
    {
      type: CacheControlType.Suffix,
      rule: '.avi;.mkv;.mp4;.mov;.flv;.rm;.rmvb;.swf',
      time: 7,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.mp3;.wav;.wmv;.rmi;.aac',
      time: 7,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.rar;.7z;.zip;.gzip;.dmg;.gz;.ios;.tar;.jar',
      time: 7,
      timeunit: cacheControlTimeunits.day
    },
    {
      type: CacheControlType.Suffix,
      rule: '.exe;.deb;.ipa;.apk;.sis;.psd;.dat',
      time: 7,
      timeunit: cacheControlTimeunits.day
    }
  ]
}

export const refererTypes = {
  empty: '',
  white: 'white',
  black: 'black'
}

export const refererTypeList = values(refererTypes)

export const refererTypeTextMap = {
  [refererTypes.empty]: '未配置',
  [refererTypes.white]: '白名单',
  [refererTypes.black]: '黑名单'
}

export const refererSep = ','

export const ipACLTypes = {
  empty: '',
  white: 'white',
  black: 'black'
}

export const ipACLTypeList = values(ipACLTypes)

export const ipACLTypeTextMap = {
  [ipACLTypes.empty]: '未配置',
  [ipACLTypes.white]: '白名单',
  [ipACLTypes.black]: '黑名单'
}

export const ipACLSep = ','

export const timeACLKeyPattern = /^[a-z,0-9]{24,40}$/

export const bsAuthMethods = {
  head: 'HEAD',
  get: 'GET',
  post: 'POST'
} as const

export type BsAuthMethodType = typeof bsAuthMethods[keyof typeof bsAuthMethods]

export const bsAuthMethodList = values(bsAuthMethods)

export const slimTypes = {
  defaults: 0,
  prefix: 1,
  regexp: 2
}

export const slimTypeList = values(slimTypes)

export const slimTypeTextMap = {
  [slimTypes.defaults]: '默认',
  [slimTypes.prefix]: '指定目录',
  [slimTypes.regexp]: '正则表达式'
}

// 泛子域名前缀的 pattern
export const panNamePattern = /^[a-z0-9-]+$/

// 我也不知道这个本意是干嘛的，为什么叫 cachePath，不过图片瘦身那用这个来校验指定目录时输入的目录内容
// 感觉有坑，先用着，跟老逻辑保持一致 TODO: 搞清楚图片瘦身正确的校验逻辑
export const cachePathPattern = /^(?:\/[\w\d-]+)+(?:;(?:\/[\w\d-]+)+){0,9}$/

export enum OperatingState {
  Success = 'success',
  Failed = 'failed',
  Deleted = 'deleted',
  Processing = 'processing',
  Frozen = 'frozen',
  Offlined = 'offlined',
  NotIcpFrozen = 'notIcpFrozen'
}

export const operatingStateValues = Object.values(OperatingState)

export const operatingStateTextMap = {
  [OperatingState.Success]: {
    cn: '成功',
    en: 'Success'
  },
  [OperatingState.Failed]: {
    cn: '失败',
    en: 'Failed'
  },
  [OperatingState.Processing]: {
    cn: '处理中',
    en: 'Processing'
  },
  [OperatingState.Frozen]: {
    cn: '冻结',
    en: 'Frozen'
  },
  [OperatingState.Offlined]: {
    cn: '已停用',
    en: 'Offlined'
  }
}

export enum OperationType {
  CreateDomain = 'create_domain',
  DeleteDomain = 'delete_domain',
  OnlineDomain = 'online_domain',
  OfflineDomain = 'offline_domain',
  FreezeDomain = 'freeze_domain',
  UnfreezeDomain = 'unfreeze_domain',
  ModifySource = 'modify_source',
  ModifyReferer = 'modify_referer',
  ModifyBsAuth = 'modify_bsauth',
  ModifyIpACL = 'modify_ipacl',
  OfflineBsAuth = 'offline_bsauth',
  ModifyCache = 'modify_cache',
  Record = 'record',
  Sslize = 'sslize',
  Unsslize = 'unsslize',
  ModifyHttpsCert = 'modify_https_crt',
  ModifyHttpsConf = 'modify_https_conf',
  ModifyTimeACL = 'modify_timeacl',
  Switch = 'switch',
  UpdateHttpRespHeader = 'update_resp_header',
  ModifyDomainGeoCover = 'modify_geo_cover',
  UpdateIPv6 = 'update_ipv6'
}

export const operationTypeTextMap = {
  [OperationType.CreateDomain]: {
    cn: '创建域名',
    en: 'Create domain'
  },
  [OperationType.DeleteDomain]: {
    cn: '删除域名',
    en: 'Delete domain'
  },
  [OperationType.OnlineDomain]: {
    cn: '启用域名',
    en: 'Online domain'
  },
  [OperationType.OfflineDomain]: {
    cn: '停用域名',
    en: 'Offline domain'
  },
  [OperationType.FreezeDomain]: {
    cn: '冻结域名',
    en: 'Freeze domain'
  },
  [OperationType.UnfreezeDomain]: {
    cn: '解冻域名',
    en: 'Unfreeze domain'
  },
  [OperationType.ModifySource]: {
    cn: '修改域名源站',
    en: 'Modify source'
  },
  [OperationType.ModifyReferer]: {
    cn: '修改防盗链',
    en: 'Modify HotLink Protection'
  },
  [OperationType.ModifyBsAuth]: {
    cn: '修改回源鉴权',
    en: 'Modify source authentication'
  },
  [OperationType.ModifyIpACL]: {
    cn: '修改 IP 黑白名单',
    en: 'Modify IP black-and-white list'
  },
  [OperationType.OfflineBsAuth]: {
    cn: '下线回源鉴权',
    en: 'Offline source authentication'
  },
  [OperationType.ModifyCache]: {
    cn: '修改缓存配置',
    en: 'Modify Cache configuration'
  },
  [OperationType.Record]: {
    cn: '域名录入',
    en: 'Record domain name'
  },
  [OperationType.ModifyHttpsCert]: {
    cn: '修改 HTTPS 证书',
    en: 'Modify HTTPS certification'
  },
  [OperationType.ModifyTimeACL]: {
    cn: '修改时间戳防盗链',
    en: 'Modify Timestamp HotLink Protection'
  },
  [OperationType.Sslize]: {
    cn: '域名升级 HTTPS ',
    en: 'Enable HTTPS of domain'
  },
  [OperationType.Unsslize]: {
    cn: '证书到期关闭 HTTPS',
    en: 'Turn off HTTPS when the certificate expired'
  },
  [OperationType.ModifyHttpsConf]: {
    cn: '修改 HTTPS 配置',
    en: 'Modify HTTPS configuration'
  },
  [OperationType.Switch]: {
    cn: '修改访问控制',
    en: 'Modify access control'
  },
  [OperationType.UpdateHttpRespHeader]: {
    cn: '修改 HTTP 响应头',
    en: 'Modify HTTP response header'
  },
  [OperationType.ModifyDomainGeoCover]: {
    cn: '修改覆盖区域',
    en: 'Modify coverage area'
  },
  [OperationType.UpdateIPv6]: {
    cn: '修改 IP 协议',
    en: 'Modify IP protocol'
  }
}

export const operatingStateDescs = {
  noIcp: 'domain have no icp',
  conflictPlatform: 'conflict platform',
  conflictDomain: 'user got conflict domain',
  verifyHttpsCertFail: 'verify https crt fail'
}

// 域名列表的默认最大长度
export const MAX_DOMAIN_COUNT = 1000

// 会被回收的测试域名后缀，见 https://cf.qiniu.io/pages/viewpage.action?pageId=89591746#id-42[ProductDesign]%E4%B8%83%E7%89%9B%E6%B5%8B%E8%AF%95%E5%9F%9F%E5%90%8D%E7%AE%A1%E7%90%86%E8%A7%84%E8%8C%83-PRD-ZY-5.1%E6%96%B9%E6%A1%88%E6%8F%8F%E8%BF%B0
// 一些测试域名的不在以下列表中，不会被回收，如创建北美 bucket 时生成的测试域名
export const domainSuffixesShouldBeRecycled = ['clouddn.com', 'qnssl.com', 'qiniucdn.com', 'qbox.me', 'qiniudn.com']
export const contentTypes = {
  json: 'application/json',
  formUrlencoded: 'application/x-www-form-urlencoded'
}

export const userAuthReqObjectKeyOfTypes = {
  custom: 'custom',
  originIp: 'originIp',
  originPath: 'originPath',
  originQuery: 'originQuery',
  originHost: 'originHost'
}
export const userAuthReqObjectKeyOfTypeMap = {
  [userAuthReqObjectKeyOfTypes.custom]: '自定义值',
  [userAuthReqObjectKeyOfTypes.originIp]: '请求资源的 IP',
  [userAuthReqObjectKeyOfTypes.originPath]: '请求资源的 Path',
  [userAuthReqObjectKeyOfTypes.originQuery]: '请求资源的 Query',
  [userAuthReqObjectKeyOfTypes.originHost]: '请求资源的 Host'
}
export const userAuthReqObjectKeyOfTypeList = values(userAuthReqObjectKeyOfTypes)

export const UserAuthReqConfObjectTypes = {
  header: 'header',
  urlquery: 'urlquery',
  body: 'body'
} as const

export type UserAuthReqConfObjectType = typeof UserAuthReqConfObjectTypes[keyof typeof UserAuthReqConfObjectTypes]

export const UserAuthReqConfObjectTypeForTitles = {
  [UserAuthReqConfObjectTypes.header]: 'Header',
  [UserAuthReqConfObjectTypes.urlquery]: 'Url Query',
  [UserAuthReqConfObjectTypes.body]: 'Body'
}
export const UserAuthReqConfObjectTypeList = values(UserAuthReqConfObjectTypes)

export const UserAuthReqConfObjectKeyTypes = {
  key: 'key',
  type: 'type',
  value: 'value'
}
export const UserAuthReqConfObjectKeyTypeMap = {
  [UserAuthReqConfObjectKeyTypes.key]: '参数',
  [UserAuthReqConfObjectKeyTypes.type]: '取值',
  [UserAuthReqConfObjectKeyTypes.value]: '自定义值'
}

export enum CertInputType {
  Existed = 'existed',
  Local = 'local',
  Free = 'free'
}

export const certInputTypeList = values(CertInputType)

export const certInputTypeTextMap = {
  [CertInputType.Existed]: '已有证书',
  [CertInputType.Local]: '本地证书',
  [CertInputType.Free]: '免费证书'
}

export const certUploadSteps = {
  willUpload: 1,
  uploaded: 2
}

export const freeCertAvgProcessTime = 25

export const hurryUpWaitingTime = 40

export enum FreezeType {
  Illegal = 'illegal', // 不合法
  NotIcp = 'notIcp', // 没有找到备案信息
  AccountFrozen = 'accountFrozen', // 账号冻结
  Other = 'other' // 其他
}

// 后端暂不支持 add
export enum ResponseHeaderControlOp {
  Set = 'set',
  Del = 'del'
}

export const responseHeaderControlOpTextMap = {
  [ResponseHeaderControlOp.Set]: '设置',
  [ResponseHeaderControlOp.Del]: '删除'
}

export const responseHeaderControlOpList = Object.entries(responseHeaderControlOpTextMap)
  .map(([opKey, opValue]) => ({ key: opKey, value: opValue }))

export enum ResponseHeaderControlKey {
  ContentType = 'Content-Type',
  CacheControl = 'Cache-Control',
  ContentDisposition = 'Content-Disposition',
  ContentLanguage = 'Content-Language',
  Expires = 'Expires',
  AccessControlAllowOrigin = 'Access-Control-Allow-Origin',
  AccessControlAllowMethods = 'Access-Control-Allow-Methods',
  AccessControlAllowHeaders = 'Access-Control-Allow-Headers',
  AccessControlMaxAge = 'Access-Control-Max-Age',
  AccessControlExposeHeaders = 'Access-Control-Expose-Headers',
  AccessControlAllowCredentials = 'Access-Control-Allow-Credentials'
}

export const responseHeaderControlKeyList = Object.entries(ResponseHeaderControlKey)
  .map(([key, value]) => ({ key, value }))

export const responseHeaderControlValueList = Object.values(ResponseHeaderControlKey)
  .map(value => ({ key: value, value }))

export const responseHeaderControlKeyTextMap = {
  [ResponseHeaderControlKey.ContentType]: '指定客户端程序响应对象的内容类型',
  [ResponseHeaderControlKey.CacheControl]: '指定客户端程序请求和响应遵循的缓存机制',
  [ResponseHeaderControlKey.ContentDisposition]: '指定客户端程序把请求所得的内容存为一个文件时提供的默认的文件名',
  [ResponseHeaderControlKey.ContentLanguage]: '指定客户端程序响应对象的语言',
  [ResponseHeaderControlKey.Expires]: '指定客户端程序响应对象的过期时间',
  [ResponseHeaderControlKey.AccessControlAllowOrigin]: '指定允许的跨域请求的来源',
  [ResponseHeaderControlKey.AccessControlAllowMethods]: '指定允许的跨域请求方法',
  [ResponseHeaderControlKey.AccessControlAllowHeaders]: '指定允许的跨域请求的字段',
  [ResponseHeaderControlKey.AccessControlMaxAge]: '指定跨域请求时，对特定资源的预请求返回结果的缓存时间',
  [ResponseHeaderControlKey.AccessControlExposeHeaders]: '指定允许访问的自定义头信息',
  [ResponseHeaderControlKey.AccessControlAllowCredentials]: '指定是否允许跨域请求携带验证信息'
}

export const cnameCheckPrefix = 'hFGxlEW4fDTBxq3CUcjq'

export enum CreateDomainSummary {
  Success = 'success',
  Failure = 'failure',
  PartialFailure = 'partial-failure'
}

export enum WorkflowTaskType {
  /** 不允许操作 */
  NotAllow = '',
  /** 重试 */
  Redo = 'redo',
  /** 回滚 */
  Abandon = 'abandon',
  /** 重试、回滚 */
  All = 'all'
}

export enum WorkflowTaskErrorCode {
  /** QPS 限制 */
  QpsLimit = 100,
  /** 单域名免费证书申请额度超限 */
  FreeCertLimit = 101
}

export const batchOperationTypes = [
  OperationType.OnlineDomain,
  OperationType.OfflineDomain,
  OperationType.UnfreezeDomain,
  OperationType.DeleteDomain
] as const

export const batchOperationTypeTextMap = {
  [OperationType.OnlineDomain]: {
    cn: '启用',
    en: 'Enable'
  },
  [OperationType.OfflineDomain]: {
    cn: '停用',
    en: 'Disable'
  },
  [OperationType.UnfreezeDomain]: {
    cn: '解冻',
    en: 'Unfreeze'
  },
  [OperationType.DeleteDomain]: {
    cn: '删除',
    en: 'Delete'
  }
} as const

// 域名列表接口有同步缓存问题，域名写操作后延迟刷新
export const refreshDelay = 2500

// 源站 URL 重写规则数量限制
export const maxSourceUrlRewriteLimit = 30

// 源站 URL 重写规则配置 feature config
export const sourceUrlRewriteFeatureConfigKey = 'FUSION.FUSION_DOMAIN_SOURCE_URL_REWRITE'

export enum IpTypes {
  IPv6 = 3,
  IPv4 = 1
}

export const ipTypesValues = valuesOfEnum(IpTypes)

export const ipTypesTextMap = {
  [IpTypes.IPv6]: 'IPv4 / IPv6',
  [IpTypes.IPv4]: 'IPv4'
}

// 防盗链个数限制
export const maxRefererItemNum = 100

export enum OwnershipVerifyType {
  Dns = 'dns',
  File = 'file'
}

export const ownershipVerifyTypeTextMap = {
  [OwnershipVerifyType.Dns]: 'DNS 解析验证',
  [OwnershipVerifyType.File]: '文件验证'
} as const
