/**
 * @file ssl http client
 * @description 适用于需要自定义非通用请求头的 web server 接口，比如文件上传
 * 要求返回的数据结构为 {code: 200, data: xx, message: ''}
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, {
  HttpClient, InternalOptions, BaseHttpException, ApiException,
  InvalidOutputPayloadException, jsonParse, Output, MimeType
} from 'qn-fe-core/client'

import { errorCodeMsg, ErrorCodeType } from '../../constants/ssl-error'

interface SslHttpFetchResult {
  code: 200 | ErrorCodeType
  message: string
  data: unknown
}

export class SslHttpApiException extends ApiException {
  constructor(
    public code: ErrorCodeType,
    public payload: SslHttpFetchResult,
    public jsonOutput: Output,
    message?: string,
    cause?: unknown
  ) {
    super(
      'SslHttpApiException',
      code,
      message,
      errorCodeMsg,
      cause
    )
  }
}

function isSslHttpFetchResult(result: any): result is SslHttpFetchResult {
  return !!(result && typeof result.code === 'number')
}

@injectable()
export class SslHttpClient extends Client {
  private prefix = '/api/certificate/v1'

  constructor(private httpClient: HttpClient) {
    super()
  }

  private async parseBody(response: Response): Promise<unknown> {
    const respBody = await response.clone().text()
    return jsonParse(respBody)
  }

  protected async _send(url: string, options: InternalOptions<FormData>): Promise<Output> {
    let output: Output

    try {
      output = await this.httpClient.send(this.prefix + url, options)
    } catch (err: unknown) {
      if (err instanceof BaseHttpException) {
        throw err.withMessage(errorCodeMsg[err.code as ErrorCodeType])
      }
      throw err
    }

    let payload: unknown
    try {
      payload = await this.parseBody(output.response)
    } catch (err: unknown) {
      throw new InvalidOutputPayloadException(payload, MimeType.Json, err, { ...output, payload: undefined })
    }

    if (!isSslHttpFetchResult(payload)) {
      throw new InvalidOutputPayloadException(
        payload,
        MimeType.Json,
        undefined,
        { ...output, payload: undefined },
        'expect `SslHttpFetchResult`',
        '响应正文（body）内容格式不正确'
      )
    }

    if (payload.code !== 200) {
      throw new SslHttpApiException(payload.code, payload, output, errorCodeMsg[payload.code])
    }

    return {
      ...output,
      payload: payload.data
    }
  }
}
