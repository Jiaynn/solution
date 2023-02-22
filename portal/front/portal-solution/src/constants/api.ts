export const prefix = '/api/proxy/solution'

export const service = {
  createBucket: `${prefix}/bucket/create`,
  openSolution: `${prefix}/enable`,
  configSolution: `${prefix}/status`,
  completeSolution: `${prefix}/complete`,
  getBucketList: `${prefix}/bucket/list`
}
