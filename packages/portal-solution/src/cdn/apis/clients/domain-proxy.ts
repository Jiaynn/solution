/**
 * @file  api client for fusion domain proxy
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 * @author linchen <gakiclin@gmail.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { ApiException } from 'qn-fe-core/client'
import { Output, HttpException } from 'portal-base/common/apis/proxy'
import { I18nStore } from 'portal-base/common/i18n'

import { errorCodeMsg, ErrorCodeType } from './error-code-message'
import BaseProxyClient, { BaseProxyOptions, BaseProxyInternalOptions } from './base-proxy'

interface DomainProxyOptions extends BaseProxyOptions {}
interface DomainProxyInternalOptions extends BaseProxyInternalOptions {}

interface DomainProxyFetchError {
  code: ErrorCodeType
  error?: string
}

function isDomainProxyFetchError(errPayload: any): errPayload is DomainProxyFetchError {
  return errPayload && errPayload.code && errPayload.code !== 200
}

function getPayloadMessage(i18n: I18nStore, err: DomainProxyFetchError): string | undefined {
  const message = errorCodeMsg[err.code]
  return message ? i18n.t(message) : undefined
}

export class DomainProxyApiException extends ApiException {
  constructor(
    public code: ErrorCodeType,
    public payload: DomainProxyFetchError,
    public message?: string,
    cause?: unknown
  ) {
    super(
      'DomainProxyApiException',
      code,
      message,
      undefined,
      cause
    )
  }
}

@injectable()
export default class DomainProxyClient extends Client<unknown, unknown, Output, DomainProxyOptions> {
  constructor(
    private proxyClient: BaseProxyClient,
    private i18n: I18nStore
  ) {
    super()
  }

  prefix = '/sophon'

  protected async _send(url: string, options: DomainProxyInternalOptions): Promise<Output> {
    let output: Output

    try {
      output = await this.proxyClient.send(this.prefix + url, options)
    } catch (err: unknown) {
      if (err instanceof HttpException && isDomainProxyFetchError(err.payload)) {
        const payload = err.payload
        throw new DomainProxyApiException(payload.code, payload, getPayloadMessage(this.i18n, payload), err)
      }
      throw err
    }

    return output
  }
}
