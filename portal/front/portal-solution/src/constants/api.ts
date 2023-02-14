export const prefix = '/api/proxy/solution'
export const service = {
  openSolution: `${prefix}`,
  createBucket: `${prefix}/bucket/create`,
  isOpenSolution: `${prefix}/enable`,
  isConfigSolution: `${prefix}/status`,
  completeSolution: `${prefix}/complete`,
  getBucketList: `${prefix}/bucket/list`
}
