import React from 'react'
import { isEmpty } from 'lodash'
import { reaction, computed } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'

import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Iamed } from 'portal-base/user/iam'
import { useRouteTitle, RouterStore } from 'portal-base/common/router'
import { useLocalStore } from 'portal-base/common/utils/store'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import Spin from 'react-icecream/lib/spin'
import Modal from 'react-icecream/lib/modal'
import Button from 'react-icecream/lib/button'

import DomainStore from 'cdn/stores/domain'

import { DomainType } from 'cdn/constants/domain'
import Routes from 'cdn/constants/routes'
import IamInfo from 'cdn/constants/iam-info'
import AbilityConfig, { CdnAbilityConfig, DcdnAbilityConfig } from 'cdn/constants/ability-config'
import { isOEM } from 'cdn/constants/env'
import { cdnBasename, dcdnBasename } from 'cdn/constants/route'

import TestDomainDetail from './TestDomain'
import NormalAndPanDomainDetail from './NormalAndPanDomain'
import { domainDetailCtx, DomainDetailCtxValue } from './context'

import './style.less'

export interface IDomainDetailProps {
  name: string
  anchor?: string
}

export default observer(function DomainDetail(props: IDomainDetailProps) {
  const setRouteTitle = useRouteTitle('...')
  const store = useLocalStore(LocalStore, { ...props, onRouteTitleChange: setRouteTitle })
  const { iamActions } = useInjection(IamInfo)

  const { name, anchor } = props
  const domainDetail = store.domainInfo!

  const ctxValue: DomainDetailCtxValue = React.useMemo(() => ({
    refreshDomainDetail: () => store.getDomainDetail(name),
    domainDetail
  }), [store, domainDetail, name])

  if (store.isLoading && isEmpty(store.domainInfo)) {
    return (
      <div className="domain-detail-loading-wrapper">
        <Spin size="large" />
      </div>
    )
  }

  if (isEmpty(store.domainInfo)) {
    return null
  }

  const detailView = store.domainInfo!.type === DomainType.Test
    ? <TestDomainDetail name={name} />
    : <NormalAndPanDomainDetail anchor={anchor} name={name} />

  return (
    <Iamed actions={[iamActions.GetDomainInfo]} resources={[props.name]}>
      <domainDetailCtx.Provider value={ctxValue}>
        {detailView}
      </domainDetailCtx.Provider>
      <Modal
        title="温馨提示"
        closable={false}
        visible={store.domainInfo!.uidIsFreezed}
        footer={<Button onClick={store.handleBackToList}>知道了</Button>}
      >
        该域名所属的账户被冻结，不允许编辑该域名信息！
      </Modal>
    </Iamed>
  )
})

type DomainDetailPropsWithRouteTitle = IDomainDetailProps & {
  onRouteTitleChange: (title: string) => void
}

@injectable()
class LocalStore extends Store {
  constructor(
    @injectProps() private props: DomainDetailPropsWithRouteTitle,
    private domainStore: DomainStore,
    private routerStore: RouterStore,
    private routes: Routes,
    private abilityConfig: AbilityConfig
  ) {
    super()
  }

  @computed get domainInfo() {
    return this.domainStore.getDomainDetail(this.props.name)
  }

  @ToasterStore.handle()
  getDomainDetail(name: string) {
    return this.domainStore.fetchDomainDetail(name)
  }

  @computed get isLoading() {
    return this.domainStore.isLoadingDomainDetail(this.props.name)
  }

  @autobind
  handleBackToList() {
    this.routerStore.push(this.routes.domainList)
  }

  init() {
    // domain 名发生变化时， 获取 domain 信息 注册 route title
    this.addDisposer(reaction(
      () => this.props.name,
      name => {
        if (name) {
          this.getDomainDetail(name)
          this.props.onRouteTitleChange(name)
        }
      },
      { fireImmediately: true }
    ))

    // 防止未知的没有正确配置的域名详情入口，根据 platform 重定向到正确的站点
    this.addDisposer(reaction(
      () => this.domainInfo,
      domainInfo => {
        if (domainInfo == null || isOEM) return
        const { platform, name } = domainInfo
        if (!platform || this.abilityConfig.domainPlatforms.includes(platform)) return

        let basename: string | null = null
        if (new DcdnAbilityConfig().domainPlatforms.includes(platform)) {
          basename = dcdnBasename
        } else if (new CdnAbilityConfig().domainPlatforms.includes(platform)) {
          basename = cdnBasename
        }

        if (basename != null) {
          this.routerStore.push(this.routes.domainDetail(name, { basename }))
        }
      }
    ))
  }
}
