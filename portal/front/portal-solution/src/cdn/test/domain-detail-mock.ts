/**
 * @file mock domain detail info
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import {
  CacheControlType, DomainType, GeoCover, IpTypes, OperatingState,
  OperationType, Platform, Protocol, WorkflowTaskType
} from 'cdn/constants/domain'

import { IDomainDetail } from 'cdn/apis/domain'

export default function mockDomainDetail(
  domainInfo?: Partial<IDomainDetail>
): IDomainDetail {
  return {
    name: 'portal.qiniu.com',
    geoCover: GeoCover.China,
    type: DomainType.Normal,
    cname: '10rduchl.qiniudns.com',
    platform: Platform.Web,
    protocol: Protocol.Https,
    ipTypes: IpTypes.IPv6,
    operatingState: OperatingState.Success,
    operatingStateDesc: '',
    operationType: OperationType.ModifyHttpsConf,
    qiniuPrivate: false,
    responseHeaderControls: [],
    bsauth: {
      enable: false,
      failureStatusCode: 0,
      isQiniuPrivate: false,
      method: '',
      parameters: null,
      path: null,
      strict: false,
      successStatusCode: 0,
      timeLimit: 0,
      userAuthUrl: ''
    },
    cache: {
      cacheControls: [
        { rule: '/v1', time: 1, timeunit: 6, type: CacheControlType.Path },
        { rule: '/v1/ip', time: 1, timeunit: 6, type: CacheControlType.Path },
        { rule: '/assets', time: 1, timeunit: 5, type: CacheControlType.Path },
        { rule: '*', time: 0, timeunit: 0, type: CacheControlType.All }
      ],
      ignoreParam: false,
      ignoreParams: []
    },
    couldOperateBySelf: true,
    createAt: '2016-03-19T15:26:15.074+08:00',
    modifyAt: '2018-02-27T16:07:12.178+08:00',
    external: {
      enableFop: false,
      imageSlim: {
        enableImageSlim: false,
        prefixImageSlims: [],
        regexpImageSlims: []
      }
    },
    https: {
      certId: '5a950896f2c5932aaf00142c',
      forceHttps: false,
      http2Enable: false,
      freeCert: false
    },
    ipACL: {
      ipACLType: '',
      ipACLValues: []
    },
    httpsOPTime: '2018-02-27T16:07:12.178+08:00',
    pareDomain: '',
    referer: {
      nullReferer: true,
      refererType: '',
      refererValues: []
    },
    source: {
      advancedSources: [],
      sourceDomain: 'www-source.qiniu.com',
      sourceHost: 'www-source.qiniu.com',
      sourceIPs: [''],
      sourceIgnoreAllParams: false,
      sourceIgnoreParams: [],
      sourceQiniuBucket: '',
      sourceType: 'domain',
      sourceURLScheme: '',
      urlRewrites: [],
      testURLPath: 'favicon.ico'
    },
    testURLPath: 'favicon.ico',
    timeACL: {
      checkUrl: '',
      enable: false,
      timeACLKeys: []
    },
    hurryUpFreecert: false,
    configProcessRatio: 0,
    operTaskType: WorkflowTaskType.NotAllow,
    ...domainInfo
  } as IDomainDetail
}
