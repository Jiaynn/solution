/**
 * 接口 [是否开通方案↗](http://portalv4.dev.qiniu.io/api/proxy/solution/enable)
 *
 * @请求头 `GET /api/proxy/solution/enable`
 */
export interface IsOpenSolutionOptions {
  uid?: string;
  solution_code: string;
}
export interface IsOpenSolutionResult {
  status: boolean;
}

/**
 * 接口 [是否配置方案↗](http://portalv4.dev.qiniu.io/api/proxy/solution/status)
 *
 * @请求头 `GET /api/proxy/solution/status`
 */
export interface IsConfigSolutionOptions {
  uid?: string;
  solution_code: string;
}
export interface IsConfigSolutionResult {
  status: boolean;
}

/**
 * 接口 [开通方案↗](http://portalv4.dev.qiniu.io/api/proxy/solution)
 *
 * @请求头 `POST /api/proxy/solution`
 */
export interface OpenSolutionOptions {
  solution_code: string;
  mode: number;
}
export interface OpenSolutionResult {
  request_id?: string;
  code?: number;
  message?: string;
}

/**
 * 接口 [创建bucket↗](http://portalv4.dev.qiniu.io/api/proxy/solution/bucket/create)
 *
 * @请求头 `POST /api/proxy/solution/bucket/create`
 */
export interface CreateBucketOptions {
  region: string;
  bucket_id: string;
  solution_code: string;
}
export interface CreateBucketResult {
  request_id?: string;
  code?: number;
  message?: string;
}

/**
 * 接口 [方案配置完成↗](http://portalv4.dev.qiniu.io/api/proxy/solution/complete)
 *
 * @请求头 `POST /api/proxy/solution/complete`
 */
export interface CompleteSolutionOptions {
  solution_code: string;
}
export interface CompleteSolutionResult {
  solution_code: string;
  status: number;
  solution_name: string;
}

/**
 * 接口 [获取方案列表↗](http://portalv4.dev.qiniu.io/api/proxy/solution/bucket/list)
 *
 * @请求头 `GET /api/proxy/solution/bucket/list`
 */
export interface GetBucketListOptions {
  region?: string;
  solution_code: string;
}
export interface GetBucketListResultDataList {
  solution_code: string;
  bucket_id: string;
  uid: string;
  region: string;
}
export interface GetBucketListResult {
  end_page: boolean;
  page_total: number;
  total_count: number;
  list: GetBucketListResultDataList[];
}

