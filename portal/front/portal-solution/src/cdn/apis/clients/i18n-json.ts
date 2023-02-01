/**
 * @file i18n JSON Client
 * @brief fe-core 暂不支持 i18n，这里通过替换 Json Client 的方式对其中涉及的接口请求相关文案进行特殊处理。后续 fe-core 支持 i18n 后把这个 client 移除
 * @author linchen <gakiclin@gmail.com>
 */

import Client, {
  HttpException,
  JsonClient, Output,
  InternalOptions, UnknownClientException,
  TimeoutException, NativeFetchException,
  UnexpectedMimeTypeException, InvalidOutputPayloadException,
  InvalidInputPayloadException
} from 'qn-fe-core/client'
import { I18nStore } from 'portal-base/common/i18n'
import { httpErrorLocaleMessages } from 'portal-base/common/apis/common'

import * as messages from './messages'

export default class I18nJsonClient extends Client {
  constructor(private client: JsonClient, private i18n: I18nStore) {
    super()
  }

  protected async _send(url: string, options: InternalOptions): Promise<Output> {
    let output: Output

    try {
      output = await this.client.send(url, options)
    } catch (err: unknown) {
      if (err instanceof UnknownClientException) {
        throw err.withMessage(this.i18n.t(messages.unknownClientException))
      }
      if (err instanceof TimeoutException) {
        throw err.withMessage(this.i18n.t(messages.timeoutException))
      }
      if (err instanceof NativeFetchException) {
        throw err.withMessage(this.i18n.t(messages.nativeFetchException))
      }
      if (err instanceof UnexpectedMimeTypeException) {
        throw err.withMessage(this.i18n.t(messages.unexpectedMimeTypeException))
      }
      if (err instanceof InvalidOutputPayloadException) {
        throw err.withMessage(this.i18n.t(messages.invalidOutputPayloadException))
      }
      if (err instanceof InvalidInputPayloadException) {
        throw err.withMessage(this.i18n.t(messages.invalidInputPayloadException))
      }
      if (err instanceof HttpException) {
        const message = httpErrorLocaleMessages[err.code]
        throw err.withMessage(message != null ? this.i18n.t(message) : undefined)
      }

      throw err
    }

    return output
  }
}
