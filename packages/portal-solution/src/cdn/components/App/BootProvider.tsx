/**
 * @file App BootProvider Component
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { Provides, useInjection } from 'qn-fe-core/di'
import BaseBootProvider, { PrivatizedBootProvider } from 'portal-base/common/components/BootProvider'
import { RouterStore, createRouterStore } from 'portal-base/common/router'
import IcecreamConfigProvider from 'react-icecream/lib/config-provider'
import zhCn from 'react-icecream/lib/locale-provider/zh_CN'
import enUs from 'react-icecream/lib/locale-provider/en_US'
import { ConfigProvider as ChartConfigProvider, cnData as chartCnData, enData as chartEnData } from 'react-icecream-charts'
import { ConfigProvider as Icecream2ConfigProvider, enData as icecreamEnLangData, cnData as icecreamCnLangData } from 'react-icecream-2'
import { FeatureConfigApis, FeatureConfigStore } from 'portal-base/user/feature-config'
import { IamService } from 'portal-base/user/iam'
import { ProxyClientV2 } from 'portal-base/common/apis/proxy'
import Monitor, { HttpClientWithMonitor } from 'portal-base/common/monitor'
import { UserInfoStore } from 'portal-base/user/account'
import { createI18nStore, I18nStore, Lang } from 'portal-base/common/i18n'
import { HttpClient, JsonClient, TypedPayloadClient } from 'qn-fe-core/client'

import SslApis from 'cdn/certificate/apis/ssl'

import { SslClient, SslProxyClient, SslHttpClient } from 'cdn/certificate/apis/client'

import DomainStore from 'cdn/stores/domain'
import BucketStore from 'cdn/stores/bucket'

import Links, { CdnLinks, DcdnLinks } from 'cdn/constants/links'
import { cdnBasename, dcdnBasename, oemBasename } from 'cdn/constants/route'
import IamInfo from 'cdn/constants/iam-info'
import AbilityConfig, { CdnAbilityConfig, DcdnAbilityConfig, OemAbilityConfig } from 'cdn/constants/ability-config'
import { isDev, isOEM, oemConfig, oemLang } from 'cdn/constants/env'

import I18nJsonClient from 'cdn/apis/clients/i18n-json'
import CommonClient from 'cdn/apis/clients/common'
import DomainProxyClient from 'cdn/apis/clients/domain-proxy'
import RefreshPrefetchClient, { CdnRefreshPrefetchClient, DcdnRefreshPrefetchClient } from 'cdn/apis/clients/refresh-prefetch'
import VideoSlimClient from 'cdn/apis/clients/video-slim'
import AlarmClient from 'cdn/apis/clients/alarm'
import BaseProxyClient from 'cdn/apis/clients/base-proxy'
import DefyLogClient from 'cdn/apis/clients/defy-log'
import DefyTrafficClient from 'cdn/apis/clients/defy-traffic'
import DefyAnalysisClient from 'cdn/apis/clients/defy-analysis'
import DefyMonitorClient from 'cdn/apis/clients/defy-monitor'

import AlarmCallbackApis from 'cdn/apis/alarm/callback'
import AlarmRuleApis, { CdnAlarmApis, DcdnAlarmApis } from 'cdn/apis/alarm/rule'
import OemFinancialApis from 'cdn/apis/oem/financial'
import OemSubAccountApis from 'cdn/apis/oem/sub-account'
import OemDomainHostingApis from 'cdn/apis/oem/domain-hosting'
import BucketApis from 'cdn/apis/bucket'
import CertificateApis from 'cdn/apis/certificate'
import ConflictApis from 'cdn/apis/conflict'
import DomainApis from 'cdn/apis/domain'
import LogApis from 'cdn/apis/log'
import ApmApis from 'cdn/apis/apm'
import QasApis from 'cdn/apis/qas'
import RefreshPrefetchApis from 'cdn/apis/refresh-prefetch'
import TagApis from 'cdn/apis/tag'
import VideoSlimApis from 'cdn/apis/video-slim'
import StatisticsApis, { CdnStatisticsApis, DcdnStatisticsApis } from 'cdn/apis/statistics'

import Routes from 'cdn/constants/routes'

// TODO: 预期未来升级到某个版本的 portal-base 后这段逻辑会被内置，可以直接移除
const httpClientProvides: Provides = isDev || isOEM
  ? []
  : [
    {
      identifier: Monitor,
      factory: inject => new Monitor({ getUid: () => inject(UserInfoStore).uid ?? undefined })
    },
    {
      identifier: HttpClient,
      factory: inject => new HttpClientWithMonitor(inject(Monitor))
    }
  ]

const baseProvides: Provides = [
  BucketStore,
  DomainStore,
  CommonClient,
  DomainProxyClient,
  BucketApis,
  CertificateApis,
  ConflictApis,
  DomainApis,
  LogApis,
  TagApis,
  RefreshPrefetchApis,
  VideoSlimClient, // statisticsApi 依赖这个 client
  DefyLogClient,
  DefyTrafficClient,
  DefyAnalysisClient,
  {
    identifier: JsonClient,
    factory: inject => new I18nJsonClient(new JsonClient(inject(TypedPayloadClient)), inject(I18nStore))
  },
  ...httpClientProvides
]

export const cdnProvides: Provides = [
  ...baseProvides,
  AlarmClient,
  DefyMonitorClient,
  AlarmCallbackApis,
  { identifier: AlarmRuleApis, factory: inject => new CdnAlarmApis(inject(DefyMonitorClient)) },
  QasApis,
  ApmApis,
  VideoSlimApis,
  {
    identifier: BaseProxyClient,
    factory: inject => new BaseProxyClient(inject(ProxyClientV2), 'cdn', '/fusion')
  },
  {
    identifier: StatisticsApis,
    factory: inject => new CdnStatisticsApis(
      inject(CommonClient),
      inject(VideoSlimClient),
      inject(DefyTrafficClient),
      inject(DefyAnalysisClient)
    )
  },
  {
    identifier: AbilityConfig,
    factory: () => new CdnAbilityConfig()
  },
  {
    identifier: Routes,
    factory: () => new Routes(cdnBasename)
  },
  {
    identifier: IamInfo,
    factory: () => new IamInfo(IamService.Cdn)
  },
  {
    identifier: RefreshPrefetchClient,
    factory: inject => new CdnRefreshPrefetchClient(inject(BaseProxyClient), inject(I18nStore))
  },
  {
    identifier: Links,
    factory: () => new CdnLinks()
  }
]

export const dcdnProvides: Provides = [
  ...baseProvides,
  AlarmClient,
  AlarmCallbackApis,
  DefyMonitorClient,
  { identifier: AlarmRuleApis, factory: inject => new DcdnAlarmApis(inject(DefyMonitorClient)) },
  {
    identifier: BaseProxyClient,
    factory: inject => new BaseProxyClient(inject(ProxyClientV2), 'dcdn', '/dcdn')
  },
  {
    identifier: StatisticsApis,
    factory: inject => new DcdnStatisticsApis(
      inject(CommonClient),
      inject(VideoSlimClient),
      inject(DefyTrafficClient),
      inject(DefyAnalysisClient)
    )
  },
  {
    identifier: AbilityConfig,
    factory: () => new DcdnAbilityConfig()
  },
  {
    identifier: Routes,
    factory: () => new Routes(dcdnBasename)
  },
  {
    identifier: IamInfo,
    factory: () => new IamInfo(IamService.Dcdn)
  },
  {
    identifier: RefreshPrefetchClient,
    factory: inject => new DcdnRefreshPrefetchClient(inject(BaseProxyClient), inject(I18nStore))
  },
  {
    identifier: Links,
    factory: () => new DcdnLinks()
  }
]

// OEM 环境下还需要证书相关的 identifier
export const oemProvides: Provides = [
  ...baseProvides,
  SslApis,
  SslClient,
  SslHttpClient,
  SslProxyClient,
  OemFinancialApis,
  OemSubAccountApis,
  OemDomainHostingApis,
  {
    identifier: I18nStore,
    factory: () => createI18nStore({ lang: oemLang })
  },
  {
    identifier: RouterStore,
    factory: () => createRouterStore(oemConfig.title, {}, { disable: true }, { disable: true })
  },
  {
    identifier: FeatureConfigStore,
    factory: inject => {
      const store = new FeatureConfigStore(inject(FeatureConfigApis))
      store.disableItself()
      return store
    }
  },
  {
    identifier: BaseProxyClient,
    factory: inject => new BaseProxyClient(inject(ProxyClientV2), 'cdn', '/fusion')
  },
  {
    identifier: StatisticsApis,
    factory: inject => new CdnStatisticsApis(
      inject(CommonClient),
      inject(VideoSlimClient),
      inject(DefyTrafficClient),
      inject(DefyAnalysisClient)
    )
  },
  {
    identifier: AbilityConfig,
    factory: () => new OemAbilityConfig()
  },
  {
    identifier: Routes,
    factory: () => new Routes(oemBasename)
  },
  {
    identifier: IamInfo,
    factory: () => new IamInfo(IamService.Cdn)
  },
  {
    identifier: RefreshPrefetchClient,
    factory: inject => new CdnRefreshPrefetchClient(inject(BaseProxyClient), inject(I18nStore))
  },
  {
    identifier: Links,
    factory: () => new CdnLinks()
  }
]

export interface Props {
  children: React.ReactNode
}

const LangProvider = observer(function _LangProvider({ children }: Props) {
  const i18n = useInjection(I18nStore)
  const isCn = i18n.lang === Lang.Cn

  return (
    <Icecream2ConfigProvider langData={isCn ? icecreamCnLangData : icecreamEnLangData}>
      <ChartConfigProvider langData={isCn ? chartCnData : chartEnData}>
        <IcecreamConfigProvider locale={isCn ? zhCn : enUs}>
          {children}
        </IcecreamConfigProvider>
      </ChartConfigProvider>
    </Icecream2ConfigProvider>
  )
})

export function CdnBootProvider({ children }: Props) {
  return (
    <BaseBootProvider provides={cdnProvides}>
      <LangProvider>
        {children}
      </LangProvider>
    </BaseBootProvider>
  )
}

export function DcdnBootProvider({ children }: Props) {
  return (
    <BaseBootProvider provides={dcdnProvides}>
      <LangProvider>
        {children}
      </LangProvider>
    </BaseBootProvider>
  )
}

export function OemBootProvider({ children }: Props) {
  return (
    <PrivatizedBootProvider provides={oemProvides}>
      <LangProvider>
        {children}
      </LangProvider>
    </PrivatizedBootProvider>
  )
}
