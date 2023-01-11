/**
 * @file api client for refresh & prefetch
 * @author nighca <nighca@live.cn>
 * @author linchen <gakiclin@gmail.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { ApiException, Output, MimeType, InvalidOutputPayloadException } from 'qn-fe-core/client'
import { I18nStore, RawLocaleMessage, mapMessageValues } from 'portal-base/common/i18n'

import { invalidOutputPayload as invalidOutputPayloadMsg } from './messages'

import { errorCodeMsg } from './error-code-message'
import BaseProxyClient, { BaseProxyInternalOptions, BaseProxyOptions } from './base-proxy'

interface RefreshPrefetchOptions extends BaseProxyOptions {}
interface RefreshPrefetchInternalOptions extends BaseProxyInternalOptions {}

export interface RefreshPrefetchFetchResult {
  code: number
  error?: string
  [k: string]: any
}

function isRefreshPrefetchFetchResult(result: any): result is RefreshPrefetchFetchResult {
  return result && typeof result.code === 'number'
}

const currentUserDomainMessage = {
  cn: '仅支持处理当前账号下的域名',
  en: 'Only the domain name under the current account can be operated'
}

// TODO 这里没有包含所有的刷新预取相关的 code，其余部分定义在 `./error-code-messages`
const commonCodeMessages = {
  ...errorCodeMsg,
  404001: currentUserDomainMessage,
  400014: currentUserDomainMessage,
  400032: currentUserDomainMessage
}

const currentUserResourceMessage = {
  cn: (p: string) => `仅支持处理当前账号下的 ${p} 加速域名资源`,
  en: (p: string) => `Only ${p} domain name under the current account can be operated`
}

const cdnCodeMessages = {
  ...commonCodeMessages,
  400031: mapMessageValues(currentUserResourceMessage, fn => fn('CDN'))
}

const dcdnCodeMessages = {
  ...commonCodeMessages,
  400031: mapMessageValues(currentUserResourceMessage, fn => fn('DCDN'))
}

type CodeMessageMap = Record<number, RawLocaleMessage<string> | undefined>

export class RefreshPrefetchApiException extends ApiException {
  constructor(
    public code: number,
    public payload: RefreshPrefetchFetchResult,
    /** return value of `jsonClient.send` */
    public jsonOutput: Output,
    message?: string,
    cause?: unknown
  ) {
    super(
      'RefreshPrefetchApiException',
      code,
      message,
      undefined,
      cause
    )
  }
}

@injectable()
export default abstract class RefreshPrefetchClient extends Client<unknown, unknown, Output, RefreshPrefetchOptions> {
  abstract codeMessageMap: CodeMessageMap

  constructor(
    private proxyClient: BaseProxyClient,
    private i18n: I18nStore
  ) {
    super()
  }

  prefix = '/refresh-prefetch'

  protected async _send(url: string, options: RefreshPrefetchInternalOptions): Promise<Output> {
    const output = await this.proxyClient.send(this.prefix + url, { withProduct: true, ...options })

    const { payload } = output

    if (!isRefreshPrefetchFetchResult(payload)) {
      throw new InvalidOutputPayloadException(
        payload,
        MimeType.Json,
        undefined,
        { ...output, payload: undefined },
        'expect `RefreshPrefetchResult`',
        this.i18n.t(invalidOutputPayloadMsg)
      )
    }

    if (payload.code !== 200) {
      const message = this.codeMessageMap[payload.code]
      const errorMsg = message ? this.i18n.t(message) : undefined
      throw new RefreshPrefetchApiException(payload.code, payload, output, errorMsg)
    }

    return output
  }
}

export class CdnRefreshPrefetchClient extends RefreshPrefetchClient {
  codeMessageMap = cdnCodeMessages
}

export class DcdnRefreshPrefetchClient extends RefreshPrefetchClient {
  codeMessageMap = dcdnCodeMessages
}
