import { injectable } from 'qn-fe-core/di'
import * as proxy from 'portal-base/common/apis/proxy'
import Monitor from 'portal-base/common/monitor'
import { JsonClient } from 'qn-fe-core/client'

@injectable()
export class ProxyClientWithMonitor extends proxy.ProxyClient {
  constructor(monitor: Monitor, jsonClient: JsonClient) {
    super(jsonClient)

    monitor.collectFromClient('ProxyClient', this)
  }
}

@injectable()
export class ProxyClientV2WithMonitor extends proxy.ProxyClientV2 {
  constructor(monitor: Monitor, jsonClient: JsonClient) {
    super(jsonClient)

    monitor.collectFromClient('ProxyClientV2', this)
  }
}
