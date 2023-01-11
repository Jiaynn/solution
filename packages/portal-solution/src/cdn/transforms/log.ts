import { RawLocaleMessage } from 'portal-base/common/i18n'

import * as messages from 'cdn/locales/messages'

import { logStatus } from 'cdn/constants/log'

export function humanizeLogStatus(status: string): RawLocaleMessage {
  return logStatus[status as keyof typeof logStatus] ?? messages.unknownState
}
