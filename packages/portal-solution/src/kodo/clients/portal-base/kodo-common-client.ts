import { injectable } from 'qn-fe-core/di'
import { JsonClient } from 'qn-fe-core/client'
import { KodoCommonClient as BaseClient } from 'portal-base/kodo/apis/common'
import Monitor from 'portal-base/common/monitor'
import { I18nStore } from 'portal-base/common/i18n'

@injectable()
export default class KodoCommonClientWithMonitor extends BaseClient {
  constructor(monitor: Monitor, jsonClient: JsonClient, i18n: I18nStore) {
    super(jsonClient, i18n)

    monitor.collectFromClient('KodoCommonClient', this)
  }
}
