import { injectable } from 'qn-fe-core/di'
import Monitor from 'portal-base/common/monitor'
import { JsonClient as BaseClient, TypedPayloadClient } from 'qn-fe-core/client'

@injectable()
export default class JsonClientWithMonitor extends BaseClient {
  constructor(monitor: Monitor, typedPayloadClient: TypedPayloadClient) {
    super(typedPayloadClient)

    monitor.collectFromClient('JsonClient', this)
  }
}
