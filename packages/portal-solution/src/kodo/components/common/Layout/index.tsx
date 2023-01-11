/**
 * @file component Layout
 * @author yinxulai <me@yinxulai.me>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Inject, InjectFunc, useInjection } from 'qn-fe-core/di'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { RouterStore } from 'portal-base/common/router'
import { GlobalLoading } from 'portal-base/common/loading'
import { privatizedRegisterPermission } from 'portal-base/common/utils/permission'

import { signInRequiredPermission } from 'kodo/utils/sign-in'

import { isCertificateAvailable } from 'kodo/transforms/certificate'
import { isTransferAvailable } from 'kodo/transforms/transfer'

import { ConfigStore } from 'kodo/stores/config'
import { BucketStore } from 'kodo/stores/bucket'
import { KodoIamStore } from 'kodo/stores/iam'

import fogWhiteList from 'kodo/constants/fog-white-list'
import { App as AppEnum } from 'kodo/constants/app'

import { authCheck } from '../Auth'
import { ObjectPickerModal } from '../ObjectPickerModal'

import Loading from './common/Loading'
import { IProps as ISidebarProps } from './common/Sidebar'
import { InternalLayout } from './InternalLayout'
import { PublicLayout } from './PublicLayout'

interface DiDeps {
  inject: InjectFunc
}

const EnsureFeatureInited = observer(function EnsureFeatureInited(props: React.PropsWithChildren<{}>) {
  const featureStore = useInjection(FeatureConfigStore)
  if (!featureStore.inited) return null
  return <>{props.children}</>
})

@privatizedRegisterPermission(signInRequiredPermission)
@observer
class InternalCombinedLayout extends React.Component<DiDeps> {
  iamStore = this.props.inject(KodoIamStore)
  userInfoStore = this.props.inject(UserInfo)
  routerStore = this.props.inject(RouterStore)
  configStore = this.props.inject(ConfigStore)
  bucketStore = this.props.inject(BucketStore)
  featureConfigStore = this.props.inject(FeatureConfigStore)

  constructor(props: DiDeps) {
    super(props)
    makeObservable(this)
  }

  componentDidMount() {
    if (this.isBlockedFogUser) {
      this.routerStore.replace('/404')
    }
  }

  @computed
  get globalConfig() {
    return this.configStore.getFull()
  }

  @computed
  get isBlockedFogUser() {
    return this.configStore.isApp(AppEnum.Fog) && !fogWhiteList.includes(this.userInfoStore.uid!)
  }

  @computed
  get isOverviewEnable() {
    return !this.iamStore.isIamUser
  }

  @computed
  get isCertificateEnable() {
    if (this.globalConfig.certificate.service === 'fusion') {
      return false
    }

    return isCertificateAvailable(this.props.inject)
  }

  @computed
  get isStatisticsEnable(): boolean {
    // IAM 权限控制、如果不是 IAM 会固定返回 false
    return !this.iamStore.isActionDeny({ actionName: 'Statistics' })
  }

  @computed
  get isTransferEnable() {
    return isTransferAvailable(this.props.inject)
  }

  @computed
  get isStreamPushEnable() {
    const globalConfig = this.configStore.getFull()
    if (!globalConfig.streamPush.enable) return false

    return authCheck({
      iamStore: this.iamStore,
      bucketStore: this.bucketStore,
      userInfoStore: this.userInfoStore,
      featureConfigStore: this.featureConfigStore
    }, { featureKeys: ['KODO.KODO_STREAM_PUSH'], notIamUser: true })
  }

  @computed
  get sidebarOptions(): ISidebarProps['itemOptions'] {
    return {
      overview: { visible: this.isOverviewEnable },
      transfer: { visible: this.isTransferEnable },
      dashboard: { visible: this.isStatisticsEnable },
      certificate: { visible: this.isCertificateEnable },
      streamPush: { visible: this.isStreamPushEnable }
    }
  }

  @computed
  get layoutView() {
    if (this.globalConfig.layout == null) {
      throw new Error('无效的 layout 配置！')
    }

    const productTitle = this.globalConfig.site.productName

    if (this.globalConfig.layout.type === 'built-in') {

      return (
        <InternalLayout
          productTitle={productTitle}
          sidebarOptions={this.sidebarOptions}
        >
          {this.props.children}
        </InternalLayout>
      )
    }

    if (this.globalConfig.layout.type === 'public') {
      if (this.isBlockedFogUser) { return null }

      return (
        <PublicLayout
          productTitle={productTitle}
          sidebarOptions={this.sidebarOptions}
        >
          {this.props.children}
        </PublicLayout>
      )
    }

    throw new Error('不支持的 layout 配置！')
  }

  @computed
  get statusView() {
    if (!this.userInfoStore.isLoaded) {
      if (this.globalConfig.layout.type === 'public') {
        return (<GlobalLoading />)
      }

      if (this.globalConfig.layout.type === 'built-in') {
        return (<Loading />)
      }

      return null
    }

    // 这种状态在系统里几乎不会出现，出现的时候也会自动跳转去登录页面
    if (this.userInfoStore.isGuest || !this.userInfoStore.email) {
      return null
    }

    return null
  }

  render() {
    return (
      <EnsureFeatureInited>
        <ObjectPickerModal />
        {this.statusView}
        {this.layoutView}
      </EnsureFeatureInited>
    )
  }
}

export function Layout(props: React.PropsWithChildren<{}>) {
  return (
    <Inject render={({ inject }) => (
      <InternalCombinedLayout {...props} inject={inject} />
    )} />
  )
}
