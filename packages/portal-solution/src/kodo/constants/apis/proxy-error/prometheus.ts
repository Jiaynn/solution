/**
 * @file prometheus error constants
 * @author lizhifeng <lizhifeng@qiniu.com>
 */

import { httpErrorMessages as DEFAULT_RESPONSE_ERROR_CODE_MESSAGE_MAP } from 'portal-base/common/apis/common'

import { helpWords } from 'portal-base/common/toaster'

export { helpWords }

export const PROMETHEUS_RESPONSE_ERROR_CODE_MESSAGE_MAP = {
  400: '查询参数错误', // Bad Request
  422: '查询表达式执行出错', // Unprocessable Entity; RFC4918
  503: '查询超时或被终止' // Service Unavailable
}

export const errorCodeMessages = {
  ...DEFAULT_RESPONSE_ERROR_CODE_MESSAGE_MAP,
  ...PROMETHEUS_RESPONSE_ERROR_CODE_MESSAGE_MAP
}

export const PROMETHEUS_ERROR_NUM_MAP = {
  NaN,
  Inf: Infinity,
  '-Inf': -Infinity
}
