import { injectable } from 'qn-fe-core/di'
import { KodoProxyClient as BaseClient } from 'portal-base/kodo/apis/proxy'
import { ProxyClient } from 'portal-base/common/apis/proxy'
import Monitor from 'portal-base/common/monitor'
import { I18nStore } from 'portal-base/common/i18n'

@injectable()
export default class KodoProxyClientWithMonitor extends BaseClient {
  constructor(monitor: Monitor, proxyClient: ProxyClient, i18n: I18nStore) {
    super(proxyClient, i18n)

    monitor.collectFromClient('KodoProxyClient', this)
  }
}
