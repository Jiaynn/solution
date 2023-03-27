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
