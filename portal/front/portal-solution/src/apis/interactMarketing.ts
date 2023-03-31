import autobind from 'autobind-decorator'

import { injectable } from 'qn-fe-core/di'

import { CommonClient } from 'portal-base/common/apis/common'

import { ProxyClientV2 } from 'portal-base/common/apis/proxy'

import { interactMarketingService } from 'constants/api'
import {
  AppCreateOptions,
  AppId,
  AppInfoQuery,
  AppInfo,
  AppParam,
  AppUpdateOptions,
  AppUpdateResult,
  KodoBucketListQuery,
  KodoBucketListResult,
  ImAppId,
  PiliDomainResult,
  PiliHubListQuery,
  PiliHubListResult,
  RtcAppListQuery,
  RtcAppListResult,
  AppListQuery,
  AppListResult,
  KodoDomainResult,
  DomainStatus
} from './_types/interactMarketingType'

@autobind
@injectable()
export class InteractMarketingApis {
  constructor(
    private client: CommonClient,
    private proxyClient: ProxyClientV2
  ) {}

  createApp(options: AppCreateOptions): Promise<AppId | null> {
    return this.client.post(interactMarketingService.createApp, options)
  }

  updateApp(options: AppUpdateOptions): Promise<AppUpdateResult | null> {
    return this.client.post(interactMarketingService.updateApp, options)
  }

  getAppInfo(query: AppInfoQuery): Promise<AppInfo | null> {
    return this.client.get(interactMarketingService.getAppInfo, query)
  }

  getAppList(query: AppListQuery): Promise<AppListResult | null> {
    return this.client.get(interactMarketingService.getAppList, query)
  }

  getAppParam(): Promise<AppParam | null> {
    return this.client.get(interactMarketingService.getAppParam)
  }

  getPiliHubList(query: PiliHubListQuery): Promise<PiliHubListResult | null> {
    return this.client.get(interactMarketingService.getPiliHubList, query)
  }

  getPiliDomain(hub: string) {
    return this.client.get<PiliDomainResult>(
      interactMarketingService.getPiliDomain(hub)
    )
  }

  getRtcAppList(query: RtcAppListQuery): Promise<RtcAppListResult | null> {
    return this.client.get(interactMarketingService.getRtcAppList, query)
  }

  getImAppId(rtcAppId: string): Promise<ImAppId | null> {
    return this.client.get(interactMarketingService.getImAppId(rtcAppId))
  }

  getKodoBucketList(
    query: KodoBucketListQuery
  ): Promise<KodoBucketListResult | null> {
    return this.client.get(interactMarketingService.getKodoBucketList, query)
  }

  getKodoDomain(bucket: string) {
    return this.client.get<KodoDomainResult>(
      interactMarketingService.getKodoDoamin(bucket)
    )
  }

  /**
   * 查询域名状态
   */
  getDomainStatus(domain: string) {
    return this.proxyClient.get<DomainStatus>(
      `/pili/hub/v2/domains/${domain}/status`
    )
  }
}
