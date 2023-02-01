/**
 * @desc api client for alarm
 * @author linchen <gakiclin@gmail.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { ApiException, Output, HttpException } from 'qn-fe-core/client'
import { I18nStore } from 'portal-base/common/i18n'

import { errorCodeMsg, ErrorCodeType } from './error-code-message'
import BaseProxyClient, { BaseProxyInternalOptions, BaseProxyOptions } from './base-proxy'

interface AlarmOptions extends BaseProxyOptions {}
interface AlarmInternalOptions extends BaseProxyInternalOptions {}

/**
 * 正常返回：
 * 1、body: { foo: bar ...}, statusCode: 200
 * 2、body: { code: 200 }, statusCode: 200
 * 异常返回：
 * 1、body: { code: 非 200, error: 中文 }, statusCode: 非 200
 * 2、常规的 http 异常
 */

interface AlarmFetchError {
  code: ErrorCodeType
  error?: string
}

function isAlarmFetchError(errPayload: any): errPayload is AlarmFetchError {
  return errPayload && errPayload.code && errPayload.code !== 200
}

// FIXME: 之前把后端吐出来的错误直接返回，确认影响
function getPayloadMessage(i18n: I18nStore, err: AlarmFetchError): string | undefined {
  const message = errorCodeMsg[err.code]
  return message ? i18n.t(message) : undefined
}

class AlarmApiException extends ApiException {
  constructor(
    public code: ErrorCodeType,
    public payload: AlarmFetchError,
    message?: string,
    cause?: unknown
  ) {
    super(
      'AlarmApiException',
      code,
      message,
      undefined,
      cause
    )
  }
}

@injectable()
export default class AlarmClient extends Client<unknown, unknown, Output, AlarmOptions> {
  constructor(private proxyClient: BaseProxyClient, private i18n: I18nStore) {
    super()
  }

  prefix = '/sophon'

  protected async _send(url: string, options: AlarmInternalOptions): Promise<Output> {
    let output: Output

    try {
      output = await this.proxyClient.send(this.prefix + url, options)
    } catch (err: unknown) {
      if (err instanceof HttpException && isAlarmFetchError(err.payload)) {
        const payload = err.payload
        throw new AlarmApiException(payload.code, payload, getPayloadMessage(this.i18n, payload), err)
      }
      throw err
    }

    return output
  }
}
