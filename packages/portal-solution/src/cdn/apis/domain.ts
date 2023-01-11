/**
 * @file domain-relative apis
 * @author nighca <nighca@live.cn>
 */

import { pickBy } from 'lodash'
import autobind from 'autobind-decorator'
import { injectable } from 'qn-fe-core/di'
import { ApiException } from 'qn-fe-core/client'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'

import { prefix } from 'cdn/constants/api'
import {
  ResponseHeaderControlOp,
  ResponseHeaderControlKey,
  OperatingState,
  FreezeType,
  GeoCover,
  DomainType,
  WorkflowTaskErrorCode,
  WorkflowTaskType,
  OperationType,
  IpTypes,
  Platform,
  CacheControlType,
  OwnershipVerifyType,
  Protocol
} from 'cdn/constants/domain'

import CommonClient from './clients/common'
import DomainProxyClient from './clients/domain-proxy'

export interface ISource {
  sourceHost: string
  sourceType: string
  sourceIPs: string[]
  sourceDomain: string
  sourceQiniuBucket: string
  sourceURLScheme: string
  advancedSources: IAdvancedSource[]
  testURLPath: string
  testSourceHost?: string
  sourceIgnoreAllParams: boolean
  sourceIgnoreParams: string[]
  urlRewrites?: UrlRewrite[]
}

export interface UrlRewrite {
  pattern: string
  repl: string
}

export interface IAdvancedSource {
  weight: number
  backup: boolean
  addr: string
}

export interface ICache {
  cacheControls: ICacheControl[]
  ignoreParam: boolean
  ignoreParams: string[]
}

export interface ICacheControl {
  time?: number
  timeunit?: number
  type: CacheControlType
  rule?: string
}

export interface IReferer {
  refererType: string
  refererValues: string[]
  nullReferer: boolean
}

export interface IIpACL {
  ipACLType: string
  ipACLValues: string[]
}

export interface ITimeACL {
  enable: boolean
  timeACLKeys: string[]
  checkUrl: string
}

export interface IReqConfObject {
  key: string
  value: string
  type: string
}
export interface IUserAuthReqConf {
  body: IReqConfObject[]
  header: IReqConfObject[]
  urlquery: IReqConfObject[]
}

interface IUserBsauthResultCacheConf {
  cacheEnable: boolean
  cacheDuration: number
}

export interface IBsAuth {
  enable: boolean
  userAuthUrl?: string
  method?: string
  parameters?: string[]
  successStatusCode?: number
  failureStatusCode?: number
  timeLimit?: number
  strict?: boolean
  isQiniuPrivate?: boolean
  path?: string[],
  userAuthContentType?: string
  userAuthReqConf?: IUserAuthReqConf
  userBsauthResultCacheConf?: IUserBsauthResultCacheConf
  backSourceWithResourcePath?: boolean
}

export interface IHttps {
  certId: string
  forceHttps: boolean
  http2Enable: boolean
  freeCert?: boolean // 仅用于展示
}

export interface IFreeCertForHttps {
  freeCert: boolean
  forceHttps: boolean
  http2Enable: boolean
}

export interface IExternal {
  enableFop: boolean
  imageSlim: {
    enableImageSlim: boolean
    prefixImageSlims: string[]
    regexpImageSlims: string[]
  }
}

export interface IMidSource {
  enabled: boolean
  id: string
  overSeaId: string
}

export interface IMidSourceState {
  taskId: string
  state: string
}

export interface IV4Extra {
  lastStatus: string
  operations: any
}

export interface IDomain {
  name: string
  type: DomainType
  cname: string
  testURLPath: string
  platform: Platform
  geoCover: GeoCover
  protocol: Protocol
  ipTypes: IpTypes
  operationType: OperationType
  operatingState: OperatingState
  operatingStateDesc: string
  createAt: string
  modifyAt: string
  freezeType?: FreezeType
  couldOperateBySelf: boolean
  oemMail?: string
}

export interface IDomainDetail extends IDomain {
  pareDomain: string
  source: ISource
  cache: ICache
  referer: IReferer
  ipACL: IIpACL
  timeACL: ITimeACL
  https: IHttps
  bsauth: IBsAuth
  external: IExternal
  httpsOPTime: string
  qiniuPrivate: boolean
  leftDays?: number //  (仅测试域名会返回）测试域名剩余有效期，>0:剩余有效期 |0:回收中 |-1:未进入回收流程，无需显示
  hurryUpFreecert?: boolean // 仅用于显示
  configProcessRatio?: number // 仅用于显示
  uidIsFreezed?: boolean // FUSION-10204，域名所属的用户是否被冻结
  responseHeaderControls: IResponseHeaderControl[]
  /** 域名任务可操作类型 */
  operTaskType: WorkflowTaskType
  /** 可操作域名任务 ID */
  operTaskId?: string
  /** 域名任务错误码 */
  operTaskErrCode?: WorkflowTaskErrorCode
}

export interface IQueryParams {
  from?: number // 从 0 开始
  size: number
  sortBy?: string
  asc?: boolean
  name?: string
  all?: boolean
  tagList?: string[] // 按照标签查询
  ignoreQuery?: boolean // 是否去参数缓存
  sourceType?: string // 回源类型
  typeNe?: string[] // 域名类型不等于
  includePanType?: boolean // 是否包括泛子域名
  type?: string,
  operatingState?: OperatingState
  protocol?: string
  platform?: string
}

export interface IDomainSearchResult {
  domains: IDomain[]
  from: number
  size: number // 返回的 domains 的长度
  total: number
}

export interface IGetPandomainOptions {
  marker?: string
  limit: number
}

export interface IPandomainResult {
  marker: string
  domains: IDomain[]
}

export interface IUpdateGeoCoverOptions {
  domains: string[]
  geoCover: GeoCover
  notifyUser: boolean
}

export interface ITestSourceOptions {
  sourceHost: string
  sourceType: string
  sourceDomain: string
  sourceIPs: string[]
  advancedSources: IAdvancedSource[]
  testURLPath: string
  sourceURLScheme: string
  protocol: Protocol
}

interface ITestSourceResp {
  jumpHttps: boolean
}

export interface IDomainState {
  conflictDomain: string
  isconflict: boolean
  isfinding: boolean
  lastfindingtime: number
}

export interface ICreateDomainReq {
  type: DomainType
  qiniuPrivate: boolean
  platform: Platform
  geoCover: GeoCover
  protocol: Protocol
  ipTypes: IpTypes
  source: ISource
  cache?: ICache
  referer?: IReferer
  ipACL?: IIpACL
  timeACL?: ITimeACL
  bsauth?: IBsAuth
  https: IHttps
  external?: IExternal
  registerNo?: string
  uid?: number
}

export interface ICreatePanDomainReq {
  bucket: string
  pareDomain: string
}

export type TOnOffLine = 'offline' | 'online'

export interface IUnfreezeOptions {
  message?: string
  force?: boolean
  notifyUser?: boolean
}

export interface ICheckCnamedParams {
  domain: string
  cname: string
}

export interface ICheckCnamedOptions {
  params: ICheckCnamedParams[]
}

export interface ICheckCnamedResult {
  domain: string
  cnamed: boolean
}

export interface IResponseHeaderControl {
  op: ResponseHeaderControlOp
  key: ResponseHeaderControlKey
  value: string
}

export interface IRespHeaderOptions {
  responseHeaderControls: IResponseHeaderControl[]
}

export enum UcDomainType {
  /** CDN 加速域名 */
  Cdn = 0,
  /** Kodo 源站域名 */
  KodoSource = 1,
  /** 即是 CDN 加速域名 又是 KODO 源站域名 */
  All = 2
}

export type UcDomainState =
  | { isExist: true, belongsToCurrentUser: true, domainType: UcDomainType, tbl: string }
  | { isExist: true, belongsToCurrentUser: false }
  | { isExist: false }

export type UcDomainStateMap = Record<string, UcDomainState>

export interface IBatchOptions {
  domainNames: string[]
}

export type BatchRespItem = {
  failDomains: string
  code: number
  message: string
}

export interface IBatchResponse {
  /** 0: 未完成; 1: 已完成 */
  status: number
  /** 处理失败的域名信息 */
  batchResp: BatchRespItem[]
}

export interface BatchCertOptions {
  domains: string[]
}

export interface CertInfo {
  domain: string
  certId: string
  not_before: number
  not_after: number
}

export interface BatchCertResponse {
  list: CertInfo[]
}

export interface UrlRewriteOptions {
  pattern: string
  repl: string
  inputUrl: string
}

export interface UrlRewriteResp {
  outputUrl: string
}

export enum UrlRewriteErrorCode {
  InvalidPatten = 400046,
  InvalidInput = 400031,
  InputNonMatch = 400929
}

export type IpTypesOptions = {
  ipTypes: IpTypes
}

export interface OwnershipVerifyDnsInfo {
  /** 主机记录 */
  host: string
  /** 记录类型 */
  recordType: string
  /** 记录值 */
  recordValue: string
}

export interface OwnershipVerifyFileInfo {
  fileName: string
  fileContent: string
}

export interface OwnershipVerifyInfo {
  /** 一级域名 */
  domain: string
  [OwnershipVerifyType.Dns]: OwnershipVerifyDnsInfo
  [OwnershipVerifyType.File]: OwnershipVerifyFileInfo
}

export const verifyOwnershipErrorCode = 400932

@injectable()
export default class DomainApis {
  constructor(
    private commonClient: CommonClient,
    private kodoClient: KodoCommonClient,
    private domainProxyClient: DomainProxyClient
  ) {}

  @autobind
  searchDomains(params: IQueryParams) {
    return this.domainProxyClient.get<IDomainSearchResult>('/domainsearch', params, {
      withProduct: true
    })
  }

  getDomainDetail(name: string) {
    return this.domainProxyClient.get<IDomainDetail>(`/domain-item/domain/${name}`)
  }

  getDomainExistence(name: string) {
    return this.domainProxyClient.fetch<boolean>(`/domain-item/domain/${name}`, {
      async producePayload(send) {
        try {
          const domainInfo = (await send()).payload
          return !!domainInfo
        } catch (e: unknown) {
          // iam 环境下调用该接口会返回 403，暂时所以把 403 的错误忽略
          // 后续可能需要一个 iam 用户和普通用户都能使用的检查域名是否存在的接口
          if (e instanceof ApiException && (e.code === 404001 || e.code === 403)) { // TODO: 尽量避免直接使用没有语义的 code
            return false
          }

          throw e
        }
      }
    })
  }

  getPandomains(pareDomain: string, options: IGetPandomainOptions) {
    return this.domainProxyClient.get<IPandomainResult>(`/portal/domain/${pareDomain}/pandomains`, options)
  }

  getWildcardDomains(): Promise<IDomain[]> {
    return this.domainProxyClient.get<{domains: IDomain[]}>(
      '/domain',
      { limit: 1000, types: 'wildcard' }
    ).then(
      data => data.domains || []
    )
  }

  getHasIcpCheck(): Promise<boolean> {
    return this.domainProxyClient.get<{open: boolean}>('/icp-switch').then(
      data => data.open
    )
  }

  updateGeoCover(name: string, options: IUpdateGeoCoverOptions) {
    return this.domainProxyClient.put<void>(`/domain/${name}/geocover`, options)
  }

  testSource(domainName: string, options: ITestSourceOptions) {
    return this.domainProxyClient.post<ITestSourceResp>(`/portal/domain/${domainName}/source/check`, options)
  }

  getDomainState(domainName: string) {
    return this.domainProxyClient.get<IDomainState>(`/findback/state/${domainName}`)
  }

  getDomainIcp(domainName: string) {
    return this.domainProxyClient.get<{ regno: string }>(`/portal/icp/${domainName}`)
  }

  @autobind
  createDomain(name: string, options: ICreateDomainReq) {
    const payload = pickBy(options, v => v != null)
    return this.domainProxyClient.post<void>(`/portal/domain/${name}`, payload)
  }

  @autobind
  createPanDomain(name: string, options: ICreatePanDomainReq) {
    return this.domainProxyClient.post<void>(`/pandomain/${name}`, options)
  }

  toggleDomain(action: TOnOffLine, name: string) {
    return this.domainProxyClient.post<unknown>(`/portal/domain/${name}/${action}`)
  }

  freeCertHurryUp(domain: string) {
    return this.domainProxyClient.put<void>(`/domain/${domain}/hurry/up/freecert`)
  }

  unfreezeDomain(domain: string, options?: IUnfreezeOptions) {
    return this.domainProxyClient.post<void>(`/portal/domain/${domain}/unfreeze`, options)
  }

  deleteDomain(name: string) {
    return this.domainProxyClient.delete(`/domain-item/domain/${name}`)
  }

  updateSource(name: string, options: ISource) {
    return this.domainProxyClient.put<void>(`/domain/${name}/source`, options)
  }

  updateCache(name: string, options: ICache) {
    return this.domainProxyClient.put<void>(`/domain/${name}/cache`, options)
  }

  updateReferer(name: string, options: IReferer) {
    return this.domainProxyClient.put<void>(`/domain/${name}/referer`, options)
  }

  updateTimeReferer(name: string, options: ITimeACL) {
    return this.domainProxyClient.put<void>(`/domain/${name}/timeacl`, options)
  }

  updateBsAuth(name: string, options: IBsAuth) {
    return this.domainProxyClient.put<void>(`/domain/${name}/bsauth`, options)
  }

  upgradeHttps(name: string, options: IFreeCertForHttps | IHttps) {
    return this.domainProxyClient.put<void>(`/domain/${name}/sslize`, options)
  }

  downgradeHttps(name: string) {
    return this.domainProxyClient.put<void>(`/domain/${name}/unsslize`)
  }

  updateHttpsConf(name: string, options: IFreeCertForHttps | IHttps) {
    return this.domainProxyClient.put<void>(`/domain/${name}/httpsconf`, options)
  }

  updateIpACL(name: string, options: IIpACL) {
    return this.domainProxyClient.put<void>(`/domain/${name}/ipacl`, options)
  }

  updateExternal(name: string, options: IExternal) {
    return this.domainProxyClient.put<void>(`/domain/${name}/external`, options)
  }

  batchCheckCnamed(options: ICheckCnamedOptions) {
    return this.commonClient.post<ICheckCnamedResult[]>(`${prefix}/cname/check`, options)
  }

  checkCnamed(params: ICheckCnamedParams): Promise<boolean> {
    const options = { params: [params] }
    return this.batchCheckCnamed(options).then(
      results => results[0].cnamed
    )
  }

  respHeader(name: string, options: IRespHeaderOptions) {
    return this.domainProxyClient.put<void>(`/domain/${name}/respheader`, options)
  }

  @autobind
  checkDomainIcp(domainName: string): Promise<string | undefined> {
    return this.getDomainIcp(domainName).then(
      data => (data && data.regno ? undefined : '域名未备案'),
      err => (err instanceof ApiException && err.message) || '查询域名备案信息失败'
    )
  }

  async checkAllDomainsHasIcp(domains: string[]): Promise<boolean> {
    return Promise.all(domains.map(this.checkDomainIcp))
      .then(result => result.every(it => it == null))
  }

  // 重试域名任务
  redoTask(name: string, taskId: string) {
    return this.domainProxyClient.post<void>(`/std/workflow/domain/${name}/task/${taskId}/redo`)
  }

  // 回滚域名任务
  abandonTask(name: string, taskId: string) {
    return this.domainProxyClient.post<void>(`/std/workflow/domain/${name}/task/${taskId}/abandon`)
  }

  // TODO：挪到 portal-base
  @autobind
  checkUcDomainState(domain: string) {
    return this.kodoClient.get<UcDomainState>('/domain/check', { domain })
  }

  @autobind
  async batchCheckUcDomainState(domains: string[]): Promise<UcDomainStateMap> {
    const res = await Promise.all(domains.map(this.checkUcDomainState))
    return domains.reduce((acc, domain, index) => {
      acc[domain] = res[index]
      return acc
    }, {} as UcDomainStateMap)
  }

  // 批量启用域名
  batchOnline(options: IBatchOptions) {
    return this.domainProxyClient.post<IBatchResponse>('/domain/batch/online', options)
  }

  // 批量停用域名
  batchOffline(options: IBatchOptions) {
    return this.domainProxyClient.post<IBatchResponse>('/domain/batch/offline', options)
  }

  // 批量解冻域名
  batchUnfreeze(options: IBatchOptions) {
    return this.domainProxyClient.post<IBatchResponse>('/domain/batch/unfreeze', options)
  }

  // 批量删除域名
  batchDelete(options: IBatchOptions) {
    return this.domainProxyClient.fetch<IBatchResponse>('/domain/batch', {
      method: 'DELETE',
      payload: options
    })
  }

  // 批量获取证书信息
  batchCertInfoByDomains(options: BatchCertOptions) {
    return this.domainProxyClient.get<BatchCertResponse>('/domain/batch/cert/info', options)
  }

  testUrlRewrite(options: UrlRewriteOptions): Promise<UrlRewriteResp> {
    return this.domainProxyClient.post<UrlRewriteResp>('/domain/url/rewrite/check', options)
  }

  updateIpTypes(name: string, options: IpTypesOptions) {
    return this.domainProxyClient.put<void>(`/domain/${name}/ipv6`, options)
  }

  getOwnershipVerifyInfo(name: string) {
    return this.domainProxyClient.get<OwnershipVerifyInfo>(`/portal/domain/${name}/verify/info`, {}, { withProduct: true })
  }

  verifyOwnership(name: string, type: OwnershipVerifyType) {
    return this.domainProxyClient.post<void>(`/portal/domain/${name}/verify/check`, { type }, { withProduct: true })
  }
}
