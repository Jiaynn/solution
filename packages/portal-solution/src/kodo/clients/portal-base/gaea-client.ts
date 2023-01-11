import { injectable } from 'qn-fe-core/di'
import { GaeaClient as BaseClient } from 'portal-base/user/gaea-client'
import { CommonClient } from 'portal-base/common/apis/common'
import Monitor from 'portal-base/common/monitor'
import { I18nStore } from 'portal-base/common/i18n'

@injectable()
export default class GaeaClientWithMonitor extends BaseClient {
  constructor(monitor: Monitor, commonClient: CommonClient, i18n: I18nStore) {
    super(commonClient, i18n)

    monitor.collectFromClient('GaeaClient', this)
  }
}
