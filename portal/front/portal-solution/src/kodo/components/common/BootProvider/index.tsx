/**
 * @file component BootProvider
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React, { Suspense, useMemo } from 'react'
import { observer } from 'mobx-react'

import { HttpClient, JsonClient, TypedPayloadClient } from 'qn-fe-core/client'

import {
  Provider,
  Provides,
  provides2ProvidePairList,
  dedupeProvides,
  useInjection
} from 'qn-fe-core/di'

import PublicBootProvider, {
  LifecycleAttacher,
  PrivatizedBootProvider
} from 'portal-base/common/components/BootProvider'

import { RouterStore, createRouterStore } from 'portal-base/common/router'
import { Toaster, ToasterStore } from 'portal-base/common/toaster'

import { GaeaClient } from 'portal-base/user/gaea-client'
import { UserInfoStore } from 'portal-base/user/account'
import { FeatureConfigStore as BaseFeatureConfigStore } from 'portal-base/user/feature-config'
import { createI18nStore, I18nStore } from 'portal-base/common/i18n'

import { CommonClient } from 'portal-base/common/apis/common'
import { ProxyClient, ProxyClientV2 } from 'portal-base/common/apis/proxy'
import { KodoCommonClient } from 'portal-base/kodo/apis/common'
import { KodoProxyClient } from 'portal-base/kodo/apis/proxy'
import { ExternalUrlModalStore } from 'kodo-base/lib/components/common/ExternalUrlModal/store'
import BaseMonitor, { HttpClientWithMonitor } from 'portal-base/common/monitor'

import { isDev } from 'kodo/utils/dev'

import { KodoIamStore } from 'kodo/stores/iam'

import { ConfigStore } from 'kodo/stores/config'

import { DomainStore } from 'kodo/stores/domain'

import { BucketStore } from 'kodo/stores/bucket'

import { SignInStore } from 'kodo/stores/sign-in'

import { CertStore } from 'kodo/stores/certificate'

import { FeatureConfigStore } from 'kodo/stores/feature'

import { BucketListStore } from 'kodo/stores/bucket/list'

import { RegionApplyStore } from 'kodo/stores/region-apply'

import { KodoUserInfoStore } from 'kodo/stores/user-info'

import { App } from 'kodo/constants/app'
import version from 'kodo/constants/version'

import Monitor from 'kodo/clients/monitor'
import JsonClientWithMonitor from 'kodo/clients/json'
import {
  CommonClientWithMonitor,
  GaeaClientWithMonitor,
  KodoCommonClientWithMonitor,
  KodoProxyClientWithMonitor,
  ProxyClientV2WithMonitor,
  ProxyClientWithMonitor
} from 'kodo/clients/portal-base'
import { ProeProxyClient } from 'kodo/clients/proxy-proe'
import { PrometheusClient } from 'kodo/clients/prometheus'

import { BucketApis } from 'kodo/apis/bucket'
import { BucketListApis } from 'kodo/apis/bucket/list'
import { LogApis } from 'kodo/apis/bucket/setting/log'
import { TagApis } from 'kodo/apis/bucket/setting/tag'
import { SMSGApis } from 'kodo/apis/bucket/setting/smsg'
import { ResourceApis } from 'kodo/apis/bucket/resource'
import { EventNotificationRuleApi } from 'kodo/apis/bucket/setting/event-notification-rules'
import { SourceApis } from 'kodo/apis/bucket/setting/source'
import { AccessApis } from 'kodo/apis/bucket/setting/access'
import { CensorApis } from 'kodo/apis/bucket/setting/censor'
import { ImageStyleApis } from 'kodo/apis/bucket/image-style'
import { MaxAgeApis } from 'kodo/apis/bucket/setting/max-age'
import { VersionApis } from 'kodo/apis/bucket/setting/version'
import { ReferrerApis } from 'kodo/apis/bucket/setting/referrer'
import { LifecycleRuleApi } from 'kodo/apis/bucket/setting/lifecycle-rules'
import { EncryptionApis } from 'kodo/apis/bucket/setting/encryption'
import { CrossOriginApis } from 'kodo/apis/bucket/setting/cross-origin'
import { DefaultIndexApis } from 'kodo/apis/bucket/setting/default-index'
import { AuthorizationApis } from 'kodo/apis/bucket/setting/authorization'
import { RoutingApis } from 'kodo/apis/bucket/setting/routing'
import { OriginalProtectedApis } from 'kodo/apis/bucket/setting/original-protected'
import { RemarkApis } from 'kodo/apis/bucket/setting/remark'
import { CdnApis } from 'kodo/apis/cdn'
import { ConfigApis } from 'kodo/apis/config'
import { DomainApis } from 'kodo/apis/domain'
import { RegionApis } from 'kodo/apis/region'
import { SignInApis } from 'kodo/apis/sign-in'
import { WormApis } from 'kodo/apis/bucket/worm'
import { TokenApis } from 'kodo/apis/bucket/token'
import { TranscodeApis } from 'kodo/apis/transfer'
import { StatisticsApis } from 'kodo/apis/statistics'
import { StreamPushApis } from 'kodo/apis/stream-push'
import { CertificateApis } from 'kodo/apis/certificate'
import { TranscodeStyleApis } from 'kodo/apis/transcode-style'
import { UserInfoApisWithCache } from 'kodo/apis/user-info'

import { ObjectPickerStore } from '../ObjectPickerModal/store'

import { RefreshCdnStore } from 'kodo/components/common/RefreshCdnModal/store'
import { MediaStyleDrawerStore } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/Drawer/store'

import { ApplyNotices } from './ApplyNotice'
import { ImageSolutionApis } from 'apis/image'
import ImageSolutionStore from 'store/imageSolution'
import { cdnProvides } from 'cdn/components/App/BootProvider'
import { MessageSolutionApi } from 'apis/message'
import { ConfigurationStore } from 'components/image/Configuration/ConfigureImageStyle/ConfigurationStore'
// import { MockApi } from 'apis/mock'

const DevTools = React.lazy(() => import('../DevTools'))

const getClientProvides = (hasUserInfoStore: boolean): Provides => {
  const monitor = {
    identifier: BaseMonitor,
    factory: inject => new Monitor(
      hasUserInfoStore
        ? { getUid: () => inject(UserInfoStore).uid ?? undefined }
        : {}
    )
  }

  return [
    monitor,
    {
      identifier: HttpClient,
      factory: inject => new HttpClientWithMonitor(
        inject(BaseMonitor),
        window.fetch.bind(window)
      )
    },
    { identifier: JsonClient, constr: JsonClientWithMonitor },
    { identifier: CommonClient, constr: CommonClientWithMonitor },
    { identifier: ProxyClient, constr: ProxyClientWithMonitor },
    { identifier: ProxyClientV2, constr: ProxyClientV2WithMonitor },
    { identifier: GaeaClient, constr: GaeaClientWithMonitor },
    { identifier: KodoCommonClient, constr: KodoCommonClientWithMonitor },
    { identifier: KodoProxyClient, constr: KodoProxyClientWithMonitor }
  ]
}

// utils: Boot + LifecycleAttacher 考虑挪个位置或者 base 提供
function BaseBootProvider(
  props: React.PropsWithChildren<{ provides: Provides }>
) {
  const identifiers = useMemo(
    () => provides2ProvidePairList(dedupeProvides(props.provides)).map(
      pair => pair.identifier
    ),
    [props.provides]
  )

  return (
    <Provider provides={props.provides}>
      <LifecycleAttacher identifiers={identifiers} />
      {props.children}
    </Provider>
  )
}

function BootConfigStore(props: React.PropsWithChildren<{}>) {
  const provides = [
    // 默认的 ToasterStore，将 helpWords 设置为空字符串
    // 在配置加载完后会根据配置重新注入并设置正确的 helpWords
    { identifier: ToasterStore, value: new ToasterStore('') },
    { identifier: I18nStore, factory: () => createI18nStore() },
    {
      identifier: TypedPayloadClient,
      factory: inject => new TypedPayloadClient(inject(HttpClient))
    },
    { identifier: UserInfoApisWithCache, constr: UserInfoApisWithCache },
    ...getClientProvides(false), // 粗糙一点，其实导入了很多 bootConfig 没用到的 store，问题不大
    ConfigApis,
    ConfigStore
  ]
  return (
    <BaseBootProvider provides={provides}>{props.children}</BaseBootProvider>
  )
}

const BootBaseProvider = observer(function BootBaseProvider(
  props: React.PropsWithChildren<{}>
) {
  const configStore = useInjection(ConfigStore)
  const app = configStore.matchApp()

  const currentRouterStore = (() => {
    if (app == null) return null
    const { site } = configStore.getBase(app)
    const basenameMap = configStore.routerBasenameMap
    const TRACK_ANALYTICS = process.env.TRACK_ANALYTICS
    return createRouterStore(
      site.pageTitle,
      basenameMap,
      { disable: !TRACK_ANALYTICS },
      { disable: !TRACK_ANALYTICS }
    )
  })()

  const currentToasterStore = (() => {
    if (app == null) return null
    const { site } = configStore.getBase(app)
    return new ToasterStore(site.unknownExceptionMessageSuffix)
  })()

  // 覆盖 portal-base 的一些默认 provider
  const provides: Provides = React.useMemo(() => {
    const list: Provides = [
      ...getClientProvides(true),
      { identifier: UserInfoStore, constr: KodoUserInfoStore },
      { identifier: BaseFeatureConfigStore, constr: FeatureConfigStore }
    ]

    if (currentRouterStore) {
      list.push({ identifier: RouterStore, value: currentRouterStore })
    }

    if (currentToasterStore) {
      list.push({ identifier: ToasterStore, value: currentToasterStore })
    }

    return list
  }, [currentRouterStore, currentToasterStore])

  if (!configStore.inited || app == null) {
    return <Toaster />
  }

  // platform 就用私有云的问题不大
  if (app === App.Platform) {
    return (
      <PrivatizedBootProvider provides={provides}>
        {props.children}
      </PrivatizedBootProvider>
    )
  }

  const baseConfig = configStore.getBase(app)
  if (baseConfig.layout.type === 'built-in') {
    return (
      <PrivatizedBootProvider provides={provides}>
        {props.children}
      </PrivatizedBootProvider>
    )
  }

  if (baseConfig.layout.type === 'public') {
    return (
      <PublicBootProvider provides={provides}>
        <PublicBootProvider provides={cdnProvides}>
          {props.children}
        </PublicBootProvider>
      </PublicBootProvider>
    )
  }

  throw new Error(`invalid config of ${app}.layout.type.`)
})

function BootLocalProvider(props: React.PropsWithChildren<{}>) {
  const provides: Provides = React.useMemo(
    () => [
      // global store
      { identifier: ProeProxyClient, constr: ProeProxyClient },
      { identifier: PrometheusClient, constr: PrometheusClient },
      { identifier: KodoIamStore, constr: KodoIamStore },
      { identifier: CertStore, constr: CertStore },
      { identifier: DomainStore, constr: DomainStore },
      { identifier: BucketStore, constr: BucketStore },
      { identifier: SignInStore, constr: SignInStore },
      { identifier: BucketListStore, constr: BucketListStore },
      { identifier: RefreshCdnStore, constr: RefreshCdnStore },
      { identifier: RegionApplyStore, constr: RegionApplyStore },
      { identifier: ImageSolutionStore, constr: ImageSolutionStore },

      // apis
      { identifier: CdnApis, constr: CdnApis },
      { identifier: BucketApis, constr: BucketApis },
      { identifier: BucketListApis, constr: BucketListApis },
      { identifier: LogApis, constr: LogApis },
      { identifier: TagApis, constr: TagApis },
      { identifier: SMSGApis, constr: SMSGApis },
      { identifier: ResourceApis, constr: ResourceApis },
      {
        identifier: EventNotificationRuleApi,
        constr: EventNotificationRuleApi
      },
      { identifier: SourceApis, constr: SourceApis },
      { identifier: AccessApis, constr: AccessApis },
      { identifier: CensorApis, constr: CensorApis },
      { identifier: ImageStyleApis, constr: ImageStyleApis },
      { identifier: MaxAgeApis, constr: MaxAgeApis },
      { identifier: VersionApis, constr: VersionApis },
      { identifier: ReferrerApis, constr: ReferrerApis },
      { identifier: LifecycleRuleApi, constr: LifecycleRuleApi },
      { identifier: EncryptionApis, constr: EncryptionApis },
      { identifier: CrossOriginApis, constr: CrossOriginApis },
      { identifier: DefaultIndexApis, constr: DefaultIndexApis },
      { identifier: AuthorizationApis, constr: AuthorizationApis },
      { identifier: RoutingApis, constr: RoutingApis },
      { identifier: OriginalProtectedApis, constr: OriginalProtectedApis },
      { identifier: DomainApis, constr: DomainApis },
      { identifier: RegionApis, constr: RegionApis },
      { identifier: SignInApis, constr: SignInApis },
      { identifier: WormApis, constr: WormApis },
      { identifier: TokenApis, constr: TokenApis },
      { identifier: TranscodeApis, constr: TranscodeApis },
      { identifier: StatisticsApis, constr: StatisticsApis },
      { identifier: StreamPushApis, constr: StreamPushApis },
      { identifier: CertificateApis, constr: CertificateApis },
      { identifier: TranscodeStyleApis, constr: TranscodeStyleApis },
      { identifier: RemarkApis, constr: RemarkApis },
      { identifier: ImageSolutionApis, constr: ImageSolutionApis },
      { identifier: MessageSolutionApi, constr: MessageSolutionApi },
      { identifier: ConfigurationStore, constr: ConfigurationStore },
      // { identifier: MockApi, constr: MockApi },
      { identifier: ObjectPickerStore, constr: ObjectPickerStore },
      { identifier: MediaStyleDrawerStore, constr: MediaStyleDrawerStore },
      { identifier: ExternalUrlModalStore, constr: ExternalUrlModalStore }
    ],
    []
  )

  return (
    <BaseBootProvider provides={provides}>{props.children}</BaseBootProvider>
  )
}

const UpdateConfigEffect = observer((props: React.PropsWithChildren<{}>) => {
  const configStore = useInjection(ConfigStore)

  const app = configStore.matchApp()

  // 更新 favicon
  React.useEffect(() => {
    if (app == null) return
    const {
      site: { favicon }
    } = configStore.getBase(app)
    if (
      favicon == null
      || document == null
      || document.getElementById == null
    ) {
      return
    }

    const linkEle = document.getElementById('favicon') as HTMLLinkElement

    if (linkEle != null) {
      linkEle.href = favicon
    }
  }, [app, configStore])

  return <>{props.children}</>
})

const BootDevTools = observer((props: React.PropsWithChildren<{}>) => {
  const configStore = useInjection(ConfigStore)
  const app = configStore.matchApp()

  const shouldShowDevTools = React.useMemo(() => {
    if (app == null) return false
    const { devtools } = configStore.getBase(app)
    const localEnable = localStorage.getItem('devtools')
    return localEnable === 'true' || devtools || isDev
  }, [app, configStore])

  return (
    <>
      {props.children}
      <Suspense fallback={null}>{shouldShowDevTools && <DevTools />}</Suspense>
    </>
  )
})

export function BootProvider(props: React.PropsWithChildren<{}>) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`front version: ${version}`)
  }, [])

  return (
    <BootConfigStore>
      <UpdateConfigEffect>
        <BootBaseProvider>
          <BootLocalProvider>
            <BootDevTools>
              <ApplyNotices />
              {props.children}
            </BootDevTools>
          </BootLocalProvider>
        </BootBaseProvider>
      </UpdateConfigEffect>
    </BootConfigStore>
  )
}
