import { injectable } from 'qn-fe-core/di'
import Client from 'qn-fe-core/client'
import BaseMonitor from 'portal-base/common/monitor'

const shouldMonitor = process.env.NODE_ENV === 'production' && process.env.TRACK_ANALYTICS

@injectable()
export default class Monitor extends BaseMonitor {
  /** 采集 client 异常数据 */
  collectFromClient(clientName: string, client: Client): void {
    if (!shouldMonitor) return

    super.collectFromClient(clientName, client)
  }
}
