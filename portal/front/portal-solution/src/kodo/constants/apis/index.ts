/**
 * @file api prefix
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

const prefix = '/api'
const piliPrefix = `${prefix}/pili`

// proxy 转发用的目标服务前缀
export const service = {
  prometheus: '/prometheus',                           // 普罗米修斯数据接口
  kodoBill: '/blobio',                                 // 统计接口
  apiServer: '/api-server',                            // /kodo/api.qiniu.com.md; https://api.qiniu.com
  apiServerWithQiniuAuth: '/api-server-qiniuauth',     // TODO: 使用类似 'api-server/qiniuauth 的风格
  rs: '/rs',                                           // 文件信息相关接口
  rsf: '/rsf',
  sisyphusRouter: '/sisyphus-router',                  // 跨区域同步任务
  uc: '/uc',
  one: '/one',
  log: '/logd',
  censor: '/censor',
  media: '/media-gate',
  cdn: '/fusion',                               // cdn 域名服务
  proe: '/proe',                                       // 流媒体网关 & 拉流转推流服务
  doraImage: '/dora-image'                             // dora 图片处理服务
} as const

// 通用 proxy 接口, TODO: proxy 接口全部按照 prefix + service + api
export const proxy = {
  setTranscodeStyle: `${service.uc}/transcode-style`,
  deleteTranscodeStyle: `${service.uc}/un-transcode-style`,

  setSeparator: `${service.uc}/separator`,

  saveImageStyle: `${service.uc}/style`,
  deleteImageStyle: `${service.uc}/unstyle`,

  getBucketInfo: `${service.uc}/bucket`,
  /** 空间生命周期规则新 API */
  lifecycle: (bucketName: string) => `${service.uc}/buckets/${bucketName}/lifecycle`,

  bucketTagging: `${service.uc}/bucketTagging`,

  getLog: `${service.log}/get`,
  setLog: `${service.log}/set`,
  setLogDisable: `${service.log}/disable`,

  setBucketMaxAge: `${service.uc}/maxAge`,
  setAccessMode: `${service.uc}/accessMode`,
  setBucketNoIndexPageState: `${service.uc}/noIndexPage`,
  setBucketReferrerAntiLeech: `${service.uc}/referAntiLeech`, // bwlist

  getMirrorConfig: `${service.uc}/mirrorConfig/get`,
  passMirrorHeaders: `${service.uc}/passMirrorHeaders`,

  deleteBucketSource: `${service.uc}/source/delete`,
  setBucketSourceMode: `${service.uc}/sourceMode`,
  enableSourceRawQuery: `${service.uc}/mirrorRawQuerySupport`,

  /** 空间事件通知规则新 API */
  notification: (bucketName: string) => `${service.uc}/buckets/${bucketName}/notification`,

  getCorsRules: `${service.uc}/corsRules/get`,
  setCorsRules: `${service.uc}/corsRules/set`,
  deleteBucketRule: `${service.uc}/rules/delete`,

  getBucketNameList: `${service.uc}/buckets`,
  setBucketPrivate: `${service.uc}/private`,

  routing: (bucketName: string) => `${service.uc}/buckets/${bucketName}/routing`,

  worm: `${service.uc}/worm`,

  setRemark: (bucketName: string) => `${service.uc}/buckets/${bucketName}/remark`,

  certificate: `${service.one}/sslcert`,
  getCertificatesByDomain: `${service.one}/cert/domain`,
  bindCertificateToDomain: `${service.one}/cert/bind`,
  unbindCertificateWithDomain: `${service.one}/cert/unbind`,

  getOutflowData: `${service.apiServer}/v6/blob_io`, // /v4/blob_io (对应的后端接口)
  getInflowData: `${service.apiServer}/v6/blob_up`, // /v4/blob_up (对应的后端接口)
  getAPIPutData: `${service.apiServer}/v6/rs_put`, // /v4/rs_put (对应的后端接口)
  getLineStorageData: `${service.apiServer}/v6/space_line`, // /get/all_v2_space_line (对应的后端接口)
  getLineCountData: `${service.apiServer}/v6/count_line`, // /get/all_v2_count_line (对应的后端接口)
  getStandardStorageData: `${service.apiServer}/v6/space`, // /get/all_v2_space (对应的后端接口)
  getStandardCountData: `${service.apiServer}/v6/count`, // /get/all_v2_count (对应的后端接口)
  getArchiveStorageData: `${service.apiServer}/v6/space_archive`, // /get/all_v2_space_archive (对应的后端接口)
  getArchiveCountData: `${service.apiServer}/v6/count_archive`, // /get/all_v2_count_archive (对应的后端接口)
  getDeepArchiveStorageData: `${service.apiServer}/v6/space_deep_archive`, // /get/all_v2_space_deep_archive (对应的后端接口)
  getDeepArchiveCountData: `${service.apiServer}/v6/count_deep_archive`, // /get/all_v2_count_deep_archive (对应的后端接口)
  getFileUploadCount: `${service.apiServer}/v6/counter`, // /v4/counter (对应的后端接口)
  getTransferFlow: `${service.apiServer}/v6/blob_transfer`, // /v4/blob_transfer (对应的后端接口)

  getCDNDomains: `${service.cdn}/sophon/domain`,
  refreshCdn: `${service.cdn}/refresh-prefetch/refresh`,
  refreshCdnSurplus: `${service.cdn}/refresh-prefetch/refresh/user/surplus?product=cdn`,

  domain: `${service.uc}/domain`,
  getS3Domain: `${service.uc}/s3domain`,
  unfreezeDomain: `${service.uc}/unfreezedomain`,

  createTransferTask: `${service.apiServerWithQiniuAuth}/transfer/task/create`,
  deleteTransferTask: `${service.apiServerWithQiniuAuth}/transfer/task/delete`,
  stopTransferTask: `${service.apiServerWithQiniuAuth}/transfer/task/stop`,
  startTransferTask: `${service.apiServerWithQiniuAuth}/transfer/task/start`,
  getTransferTask: `${service.apiServerWithQiniuAuth}/transfer/task/query`,
  getTransferTasks: `${service.apiServerWithQiniuAuth}/transfer/tasks`,

  getFileState: `${service.rs}/stat`,
  renameFileMimeType: `${service.rs}/chgm`,
  renameFileKey: `${service.rs}/move`,
  deleteFileResource: `${service.rs}/delete`,
  changeFileStatus: `${service.rs}/chstatus`,
  updateFileMeta: `${service.rs}/setmeta`,
  transformStorageType: `${service.rs}/chtype`,
  thrawArchiveFile: `${service.rs}/restoreAr`,

  getCensorStatus: `${service.censor}/v1/rules`,

  getPipelineList: `${service.media}/v1/pipelines`,
  getTranscodePreset: `${service.media}/v1/preferences/transcode/all`,

  bucketSMSG: `${service.proe}/smsg/buckets`,     // 空间流媒体网关配置
  streamPushTask: `${service.proe}/tasks`,        // 拉流转推任务
  streamPushHistory: `${service.proe}/history`    // 拉流转推任务执行记录
}

// 新的 kodo web server 提供的带特定业务逻辑的接口，有自己的数据格式和 fetch store
// 大部分 url 的地址跟背后实际调用了的主体服务的地址是一一对应的
export const kodov2 = {
  getConfig: '/front/config',
  getBaseConfig: '/base/config',

  regionApply: '/region/apply',

  getUpToken: '/uptoken',
  downloadUrl: '/download-url',
  watermark: '/dora-watermark',
  canDropBucket: '/candropbucket',
  setDefaultDomain: '/domain/default/set',
  getDefaultDomain: '/domain/default/get',
  hasSensitive: '/verify/file/name',
  getIamStatisticsBuckets: '/statistics/buckets',

  getFiles: `${service.rsf}/list`,
  getFilesV2: `${service.rsf}/v2/list`,

  createBucket: `${service.rs}/mkbucketv3`,
  deleteBucket: `${service.rs}/drop`,

  shareBucket: `${service.apiServer}/share`,

  checkExisting: `${service.uc}/exist`,
  getBuckets: `${service.uc}/v2/buckets`,
  // https://github.com/qbox/product/blob/master/kodo/bucket/tblmgr.md#v3buckets%E8%8E%B7%E5%8F%96%E7%94%A8%E6%88%B7%E7%AC%A6%E5%90%88%E6%9D%A1%E4%BB%B6%E7%9A%84%E7%A9%BA%E9%97%B4%E4%BF%A1%E6%81%AF%E5%8C%85%E6%8B%AC%E7%A9%BA%E9%97%B4%E6%96%87%E4%BB%B6%E4%BF%A1%E6%81%AF
  getV3Buckets: `${service.uc}/v3/buckets`,
  getBucketWithFS: `${service.uc}/bucketwithfs`,
  getBucketDetails: `${service.uc}/v2/bucketInfo`,
  setBucketEncryption: `${service.uc}/admin/setserversideencryption`,
  enableBucketVersion: `${service.uc}/admin/enableversioning`,
  getDomainsByBucketName: `${service.uc}/domains`,

  setBucketSource: `${service.uc}/source/set`,

  getCertificatesWithDomain: `${service.one}/cert/bindings`,

  doraImage: `${service.doraImage}/upinfo`
}

// 老的 kodo web server，/kodo 开头（而不是 /kodov2）
export const kodo = {}

export const pili = {
  hubsByBucket: `${piliPrefix}/list/hubs/bybucket`
}
