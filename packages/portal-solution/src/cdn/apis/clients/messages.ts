/**
 * @file api clients messages
 * @author linchen <gakiclin@gmail.com>
 */

export const invalidOutputPayload = {
  cn: '响应正文（body）内容格式不正确',
  en: 'The response body content format is incorrect.'
}

export const unknownClientException = {
  cn: '请求过程中发生异常',
  en: 'An exception occurred during the request.'
}

export const timeoutException = {
  cn: '接口响应超时',
  en: 'API response timeout.'
}

export const nativeFetchException = {
  cn: '请求发送失败',
  en: 'Request sending failed.'
}

export const unexpectedMimeTypeException = {
  cn: '非预期的 MIME 类型',
  en: 'Unexpected MIME type.'
}

export const invalidInputPayloadException = {
  cn: '处理请求数据出错',
  en: 'Error processing request data.'
}

export const invalidOutputPayloadException = {
  cn: '处理接口响应数据出错',
  en: 'Error processing response data.'
}
