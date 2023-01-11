/**
 * @desc api client for defy-monitor
 * @author zhouhang <zhouhang@qiniu.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { ApiException, Output, HttpException } from 'qn-fe-core/client'
import { I18nStore } from 'portal-base/common/i18n'

import { errorCodeMsg, ErrorCodeType } from './error-code-message'
import BaseProxyClient, { BaseProxyInternalOptions, BaseProxyOptions } from '../base-proxy'

interface DefyMonitorOptions extends BaseProxyOptions {}
interface DefyMonitorInternalOptions extends BaseProxyInternalOptions {}

/**
 * 正常返回：
 * body: { foo: bar ...}, statusCode: 200
 * 异常返回：
 * body: { code: 非 200, error: 中文 }, statusCode: 非 200
 */

interface DefyMonitorFetchError {
  code: ErrorCodeType
  error?: string
}

function isDefyMonitorFetchError(errPayload: any): errPayload is DefyMonitorFetchError {
  return errPayload && errPayload.code && errPayload.code !== 200
}

function getPayloadMessage(i18n: I18nStore, err: DefyMonitorFetchError): string | undefined {
  const message = errorCodeMsg[err.code]
  return message ? i18n.t(message) : err.error
}

class DefyMonitorApiException extends ApiException {
  constructor(
    public code: ErrorCodeType,
    public payload: DefyMonitorFetchError,
    public message?: string,
    cause?: unknown
  ) {
    super(
      'DefyMonitorApiException',
      code,
      message,
      undefined,
      cause
    )
  }
}

@injectable()
export default class DefyMonitorClient extends Client<unknown, unknown, Output, DefyMonitorOptions> {
  constructor(
    private proxyClient: BaseProxyClient,
    private i18n: I18nStore
  ) {
    super()
  }

  prefix = '/defy/monitor'

  protected async _send(url: string, options: DefyMonitorInternalOptions): Promise<Output> {
    let output: Output

    try {
      output = await this.proxyClient.send(this.prefix + url, options)
    } catch (err: unknown) {
      if (err instanceof HttpException && isDefyMonitorFetchError(err.payload)) {
        const payload = err.payload
        throw new DefyMonitorApiException(payload.code, payload, getPayloadMessage(this.i18n, payload), err)
      }
      throw err
    }

    return output
  }
}
