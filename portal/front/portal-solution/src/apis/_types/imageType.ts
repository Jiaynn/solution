/**
 * 接口 [是否开通方案↗](http://pili-yapi.aslan.qa.qiniu.io/mock/63/solution/enable)
 *
 * @请求头 `GET /api/solution/enable`
 */
export interface IsOpenSolutionOptions {
  uid?: string;
  solution_code: string;
}
export interface IsOpenSolutionResultData {
  status: boolean;
}
export interface IsOpenSolutionResult {
  code: number;
  request_id: string;
  message: string;
  data: IsOpenSolutionResultData;
}

/**
 * 接口 [是否配置方案↗](http://pili-yapi.aslan.qa.qiniu.io/mock/63/api/solution/status)
 *
 * @请求头 `GET /api/solution/status`
 */
export interface IsConfigSolutionOptions{
  uid?: string;
  solution_code: string;
}
export interface IsConfigSolutionResultData {
  status: boolean;
}
export interface IsConfigSolutionResult {
  code: number;
  request_id: string;
  message: string;
  data: IsOpenSolutionResultData;
}
/**
 * 接口 [开通方案↗](http://pili-yapi.aslan.qa.qiniu.io/mock/63/solution)
 *
 * @请求头 `POST /api/solution`
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
 * 接口 [创建bucket↗](http://pili-yapi.aslan.qa.qiniu.io/mock/63/solution/bucket/create)
 *
 * @请求头 `POST /api/solution/bucket/create`
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
 * 接口 [方案配置完成↗](http://pili-yapi.aslan.qa.qiniu.io/mock/63/solution/complete)
 *
 * @请求头 `POST /api/solution/complete`
 */
export interface CompleteSolutionOptions {
  solution_code: string;
}
export interface CompleteSolutionResultData {
  solution_code: string;
  status: number;
  solution_name: string;
}
export interface CompleteSolutionResult {
  request_id: string;
  code: number;
  data: CompleteSolutionResultData;
  message: string;
}

/**
 * 接口 [获取方案列表↗](http://pili-yapi.aslan.qa.qiniu.io/mock/63/solution/bucket/list)
 *
 * @请求头 `GET /solution/bucket/list`
 */
export interface GetBucketListOptions {
  page_num: number;
  page_size: number;
  region: string;
  solution_code: string;
}
export interface GetBucketListResultDataList {
  solution_code: string;
  bucket_id: string;
  uid: string;
  region: string;
}
export interface GetBucketListResultData {
  end_page: boolean;
  page_total: number;
  total_count: number;
  list: GetBucketListResultDataList[];
}
export interface GetBucketListResult {
  request_id: string;
  message: string;
  code: number;
  data: GetBucketListResultData;
}
