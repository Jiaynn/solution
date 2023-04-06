export const prefix = '/api/proxy/solution'

export const imageService = {
  createBucket: `${prefix}/bucket/create`,
  openSolution: `${prefix}/enable`,
  configSolution: `${prefix}/status`,
  completeSolution: `${prefix}/complete`,
  getBucketList: `${prefix}/bucket/list`
}

export const messageService = {
  getMessageList: `${prefix}/unifiedmessage/list`
}

export const commonService = {
  getLiveWhitelistCheck: `${prefix}/live/whitelist/check`
}
export const interactMarketingService = {
  createApp: `${prefix}/live/app/create`,
  updateApp: `${prefix}/live/app/upd`,
  getAppList: `${prefix}/live/app/list`,
  getAppInfo: `${prefix}/live/app/info`,
  getAppParam: `${prefix}/live/app/param`,
  getPiliHubList: `${prefix}/live/integration/list/pili`,
  getPiliDomain: (hub: string) => `${prefix}/live/integration/pili/${hub}`,
  getRtcAppList: `${prefix}/live/integration/list/rtc`,
  getImAppId: (rtcAppId: string) => `${prefix}/live/integration/rtc/${rtcAppId}`,
  getKodoBucketList: `${prefix}/live/integration/list/kodo`,
  getKodoDomain: (bucket: string) => `${prefix}/live/integration/kodo/${bucket}`
} as const
