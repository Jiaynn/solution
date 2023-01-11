import React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import Spin from 'react-icecream/lib/spin'
import Button from 'react-icecream/lib/button'
import Modal from 'react-icecream/lib/modal'
import { ToasterStore } from 'portal-base/common/toaster'
import Page from 'portal-base/common/components/Page'
import { RouterStore } from 'portal-base/common/router'
import { useLocalStore } from 'portal-base/common/utils/store'
import { useInjection } from 'qn-fe-core/di'

import { antdToPromise } from 'cdn/utils'

import { shouldRecycle } from 'cdn/transforms/domain'

import Routes from 'cdn/constants/routes'

import DomainStateMessage from '../DomainStateMessage'
import BasicInfoBlock from '../BasicInfoBlock'
import SourceConfigBlock from '../SourceConfigBlock'

import LocalStore from './store'
import { IBaseDomainDetailProps } from '../common/store'

const confirm = antdToPromise(Modal.confirm)

interface PropsWithDeps extends IBaseDomainDetailProps {
  store: LocalStore
  toasterStore: ToasterStore
  routerStore: RouterStore
  routes: Routes
}

@observer
class TestDomainDetailInner extends React.Component<PropsWithDeps> {
  constructor(props: PropsWithDeps) {
    super(props)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @autobind
  @ToasterStore.handle()
  handleRefresh() {
    return this.props.store.fetchDomainDetail()
  }

  @autobind
  @ToasterStore.handle('删除成功')
  handleRemove() {
    const bucket = this.props.store.domainDetail.source.sourceQiniuBucket
    const confirmMessage = (
      bucket
      ? `该测试域名绑定了 bucket ${bucket}，删除操作无法恢复，请谨慎操作`
      : '域名删除后无法恢复，请谨慎操作'
    )
    return confirm({
      title: '确认删除',
      content: confirmMessage
    }).then(
      () => this.props.store.removeDomain()
    ).then(
      () => this.props.routerStore.push(this.props.routes.domainList)
    )
  }

  getMessagesBlock() {
    const domain = this.props.store.domainDetail
    const recycleMessage = (
      domain && shouldRecycle(domain.name)
      ? (
        <p className="warning-message">
          七牛测试域名，每个域名每日限总流量 10GB，每个测试域名自创建起 30 个自然日后系统会自动回收，仅供测试使用，详情请查看
          <a target="_blank" rel="noopener noreferrer" href="https://developer.qiniu.com/fusion/kb/1319/test-domain-access-restriction-rules">七牛测试域名使用规范</a>
        </p>
      )
      : null
    )
    return (
      <div className="messages-block">
        {recycleMessage}
        <DomainStateMessage />
      </div>
    )
  }

  // 顶部按钮
  getTopOperations() {
    return (
      <div className="top-btn-line">
        <Button
          type="danger"
          loading={this.props.store.loadings.isLoading('removeDomain')}
          onClick={this.handleRemove}
        >删除</Button>
        <Button
          type="ghost"
          onClick={this.handleRefresh}
        >刷新</Button>
      </div>
    )
  }

  getMainContent() {
    const store = this.props.store
    const domain = store.domainDetail
    if (!domain) {
      return null
    }

    const loadingDomain = store.isLoadingDomainDetail
    const messages = this.getMessagesBlock()

    return (
      <div>
        {this.getTopOperations()}
        <Spin spinning={loadingDomain}>
          {messages}
          <BasicInfoBlock domain={store.domainDetail} hasIcp={store.hasIcp} />
        </Spin>
        <SourceConfigBlock
          domain={domain}
          loading={loadingDomain}
          handleConfigure={null!}
        />
      </div>
    )
  }

  render() {
    return (
      <Page className="domain-detail-wrapper">
        {this.getMainContent()}
      </Page>
    )
  }
}

export default function TestDomainDetail(props: IBaseDomainDetailProps) {
  const store = useLocalStore(LocalStore, props)
  const routerStore = useInjection(RouterStore)
  const toasterStore = useInjection(ToasterStore)
  const routes = useInjection(Routes)

  return (
    <TestDomainDetailInner
      {...props}
      store={store}
      routerStore={routerStore}
      toasterStore={toasterStore}
      routes={routes}
    />
  )
}
