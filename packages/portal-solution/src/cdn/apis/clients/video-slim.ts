/**
 * @desc api client for video-slim
 * @author yaojingtian <yaojingtian@qiniu.com>
 * @author linchen <gakiclin@gmail.com>
 */

import { injectable } from 'qn-fe-core/di'
import Client, { ApiException, Output, JsonClient, InternalOptions } from 'qn-fe-core/client'
import { I18nStore } from 'portal-base/common/i18n'

import { prefix } from 'cdn/constants/api'

import { errorCodeMsg, ErrorCodeType } from './error-code-message'

interface VideoSlimFetchError {
  code: ErrorCodeType
  error?: string
}

function isVideoSlimFetchError(errPayload: any): errPayload is VideoSlimFetchError {
  return errPayload && errPayload.code && errPayload.code !== 200
}

class VideoSlimApiException extends ApiException {
  constructor(
    public code: ErrorCodeType,
    public payload: VideoSlimFetchError,
    /** return value of `jsonClient.send` */
    public jsonClientOutput: Output,
    message?: string,
    cause?: unknown
  ) {
    super(
      'VideoSlimApiException',
      code,
      message,
      undefined,
      cause
    )
  }
}

@injectable()
export default class VideoSlimClient extends Client {
  constructor(private jsonClient: JsonClient, private i18n: I18nStore) {
    super()
  }

  protected async _send(url: string, options: InternalOptions): Promise<Output> {
    const output = await this.jsonClient.send(`${prefix}/video-slim` + url, options)

    const payload = output.payload
    if (isVideoSlimFetchError(payload)) {
      const message = errorCodeMsg[payload.code]
      const errMessage = message ? this.i18n.t(message) : undefined
      throw new VideoSlimApiException(payload.code, payload, output, errMessage)
    }

    return output
  }
}
