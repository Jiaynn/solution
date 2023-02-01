/**
 * @desc common api client
 * @author linchen <gakiclin@gamil.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { InternalOptions } from 'qn-fe-core/client'
import { I18nStore } from 'portal-base/common/i18n'
import { CommonApiException, CommonClient as BaseCommonClient, Output } from 'portal-base/common/apis/common'

import { withOemVendor } from 'cdn/utils/oem'
import { errorCodeMsg, ErrorCodeType } from './error-code-message'

@injectable()
export default class CommonClient extends Client {
  constructor(private client: BaseCommonClient, private i18n: I18nStore) {
    super()
  }

  protected async _send(url: string, options: InternalOptions): Promise<Output> {
    let output: Output

    try {
      output = await this.client.send(url, withOemVendor(options))
    } catch (err: unknown) {
      if (err instanceof CommonApiException) {
        const message = errorCodeMsg[err.code as ErrorCodeType]
        if (message != null) {
          throw err.withMessage(this.i18n.t(message))
        }
      }

      throw err
    }
    return output
  }
}
