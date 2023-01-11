import { injectable } from 'qn-fe-core/di'
import { CommonClient as BaseCommonClient } from 'portal-base/common/apis/common'
import Monitor from 'portal-base/common/monitor'
import { JsonClient } from 'qn-fe-core/client'
import { I18nStore } from 'portal-base/common/i18n'

@injectable()
export default class CommonClientWithMonitor extends BaseCommonClient {
  constructor(monitor: Monitor, jsonClient: JsonClient, i18n: I18nStore) {
    super(jsonClient, i18n)

    monitor.collectFromClient('CommonClient', this)
  }
}
