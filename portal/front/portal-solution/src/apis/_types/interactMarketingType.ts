type BetterEnum<T> = T[keyof T]

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4416
 * @api /api/solution/live/app/create
 */
export interface AppCreateOptions {
  appName: string
  appDesc?: string
  appScenarios: AppScenariosId
  integrationWay: IntegrationWayId
  /** 选装组件的id */
  component: string[]
  hub: string
  publishRtmp: string
  liveRtmp: string
  liveHls: string
  liveHdl: string
  RTCApp: string
  /** 通讯服务 */
  IMServer: string
  /** 存储空间 */
  bucket?: string
  /** 外链域名 */
  addr?: string
  /** 回调域名 */
  callback?: string
}

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4416
 * /api/solution/live/app/create
 */
export type AppId = string

/**
 * 组件的场景
 * -1 -> 所有场景
 * 0 -> 电商直播
 * 1 -> 互动直播
 * */
export type AppScenariosId = BetterEnum<typeof AppScenariosId>
export const AppScenariosId = {
  All: -1,
  Ecommerce: 0,
  Interact: 1
} as const

/**
 * 0 -> 含UI集成
 * 1 -> 不含UI集成
 * */
export type IntegrationWayId = BetterEnum<typeof IntegrationWayId>
export const IntegrationWayId = {
  WithUI: 0,
  Standard: 1
} as const

export type IntegrationWayLabel = BetterEnum<typeof IntegrationWayLabel>
export const IntegrationWayLabel = {
  WithUI: '含UI集成',
  Standard: '标准集成（不带UI）'
}

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4425
 * @api /api/solution/live/app/upd
 */
export interface AppUpdateOptions extends AppCreateOptions {
  appId: string
}

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4425
 * @api /api/solution/live/app/upd
 */
export type AppUpdateResult = boolean

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4422
 * @api /api/solution/live/app/list
 */
export interface AppListQuery {
  pageNum: number
  pageSize: number
  appName?: string
  scenarios?: AppScenariosId
}

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4422
 * @api /api/solution/live/app/list
 */
export type AppListResult = {
  total_count: number
  page_total: number
  end_page: boolean
  list: AppListItem[]
}

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4422
 * @api /api/solution/live/app/list
 */
export interface AppListItem {
  appId: string
  appName: string
  appScenarios: AppScenariosLabel
  integrationWay: IntegrationWayLabel
  status: AppStatus
  packStatus: AppPackStatusId
  urls: null | CodeUrl
  createTime: number
  hub: string
  RTCApp: string
}

export type AppStatusId = BetterEnum<typeof AppStatusId>
export const AppStatusId = {
  Completed: 0,
  Uncompleted: 1
} as const

export type AppScenariosLabel = BetterEnum<typeof AppScenariosLabel>
export const AppScenariosLabel = {
  Ecommerce: '电商直播',
  Interact: '互动直播'
} as const

export type AppStatus = BetterEnum<typeof AppStatus>
export const AppStatus = {
  Completed: '已完成',
  UnCompleted: '未完成'
} as const

export type AppPackStatusId = BetterEnum<typeof AppPackStatusId>
export const AppPackStatusId = {
  Init: -1,
  Packing: 0,
  PackCompleted: 1,
  PackFail: 2
} as const

export type AppPackStatusLabel = BetterEnum<typeof AppPackingStatusLabel>
export const AppPackingStatusLabel = {
  Init: '初始状态',
  Packing: '源文件生成中',
  PackCompleted: '生成完成',
  PackFail: '生成失败'
} as const

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4419
 * @api /api/solution/live/app/param
 */
export type AppParam = AppComponentList[]

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4419
 * @api /api/solution/live/app/param
 */
export interface AppComponentList {
  type: string
  items: AppComponent[]
}

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4419
 * @api /api/solution/live/app/param
 */
export interface AppComponent {
  componentId: string
  scenes: AppScenariosId
  type: string
  name: string
  enName: string
  remark: string
  default: SelectableId
}

/**
 * 0 -> 默认勾选
 * 1 -> 可选
 * */
export type SelectableId = BetterEnum<typeof SelectableId>
export const SelectableId = {
  No: 0,
  Yes: 1
} as const

/** 应用信息
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4428
 * @api /api/solution/live/app/info
 */
export interface AppInfoQuery {
  appId: string
}
/** 应用信息
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4428
 * @api /api/solution/live/app/info
 */
export interface AppInfo {
  appId: string
  appName: string
  appDesc: string
  appScenarios: AppScenariosId
  appScenariosVo: string
  integrationWay: IntegrationWayId
  integrationWayVo: string
  packStatus: AppPackStatusId
  urls: null | CodeUrl
  components: AppInfoComponent[]
  hub: string
  piliDomain: {
    [key in PiliDomainType]: string
  }
  RTCApp: string
  IMServer: string
  kodo: null | {
    bucket: string
    callback: string
    addr: string
  }
  createTime: number
}
export interface AppInfoComponent {
  type: string
  componentId: string
  name: string
  remark: string
}

export type PiliDomainType = BetterEnum<typeof PiliDomainType>
export const PiliDomainType = {
  PublishRtmp: 'publishRtmp',
  LiveRtmp: 'liveRtmp',
  LiveHls: 'liveHls',
  LiveHdl: 'liveHdl'
} as const

/**
 * 文件下载url
 */
export interface CodeUrl {
  server_fixed_url: string
  server_url: string
  android_url: string
  ios_url: string
}

/** 集成配置
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4392
 * @api /api/solution/live/integration/list/pili
 */
export interface PiliHubListQuery {
  page_num: number
  page_size: number
}

/** 集成配置
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4392
 * @api /api/solution/live/integration/list/pili
 */
export interface PiliHubListResult {
  total_count: number
  page_total: number
  end_page: boolean
  list: PiliListItem[]
}

export interface PiliListItem {
  name: string
}

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4386
 * @api /api/solution/live/integration/pili/:hub
 */
export interface PiliDomainResult {
  name: string
  uid: string
  domains: PiliDomain[]
}
/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4386
 * @api /api/solution/live/integration/pili/:hub
 */
export interface PiliDomain {
  type: PiliDomainType
  domain: string
  cname: string
  certEnable: boolean
  certName: string
}

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4440
 * @api /api/solution/live/integration/list/rtc
 */
export interface RtcAppListQuery {
  page_num: number
  page_size: number
}

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4440
 * @api /api/solution/live/integration/list/rtc
 */
export interface RtcAppListResult {
  total_count: number
  page_total: number
  end_page: boolean
  list: RtcAppListItem[]
}

export interface RtcAppListItem {
  name: string
}

/**
 * 根据rtc id 给出im app id
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4401
 * @api /api/solution/live/integration/rtc/:rtc_appId
 * */
export interface ImAppIdQuery {
  rtc_appId: string
}

/**
 * 根据rtc id 给出im app id
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4401
 * @api /api/solution/live/integration/rtc/:rtc_appId
 * */
export type ImAppId = string

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4437
 * @api /api/solution/live/integration/list/kodo
 */
export interface KodoBucketListQuery {
  page_num: number
  page_size: number
}
/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4437
 * @api /api/solution/live/integration/list/kodo
 */
export interface KodoBucketListResult {
  total_count: number
  page_total: number
  end_page: boolean
  list: KodoBucketListItem[]
}
export interface KodoBucketListItem {
  name: string
}

/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4389
 * @api /api/solution/live/integration/kodo/:bucket
 */
export type KodoDomainResult = string[]

// export interface KodoDomainResult {
//   domains: KodoDomain[]
// }
/**
 * @link http://pili-yapi.aslan.qa.qiniu.io/project/98/interface/api/4389
 * @api /api/solution/live/integration/kodo/:bucket
 */
// export interface KodoDomain {
//   domain: string
//   bucket: string
//   api_scope: string
//   domain_types: string[]
//   freeze_types: null
//   create_time: number
//   update_time: number
// }

/**
 * 域名状态
 */
export interface DomainStatus {
  occupied: boolean
  hasCname: boolean
  hasIcp: boolean
  /**
   * 是否备案
   */
  hasGaba: boolean
  isInGabaBlackList: boolean
}
