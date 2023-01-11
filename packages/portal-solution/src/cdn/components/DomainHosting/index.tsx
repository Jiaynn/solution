/**
 * @file 域名托管
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import { throttle } from 'lodash'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { useInjection } from 'qn-fe-core/di'
import { LocalStorageStore } from 'portal-base/common/utils/storage'
import Page from 'portal-base/common/components/Page'
import { ToasterStore } from 'portal-base/common/toaster'
import { useLocalStore } from 'portal-base/common/utils/store'
import Button from 'react-icecream/lib/button'
import Icon from 'react-icecream/lib/icon'
import Table from 'react-icecream/lib/table'
import Spin from 'react-icecream/lib/spin'
import Modal from 'react-icecream/lib/modal'
import Tooltip from 'react-icecream/lib/tooltip'

import {
  domainStatusTextMap,
  DomainStatus,
  throttleInterval,
  localStorageKey,
  addDomainTip
} from 'cdn/constants/domain-hosting'

import Link from 'cdn/components/common/Link/LegacyLink'

import { IDomainInfo } from 'cdn/apis/oem/domain-hosting'

import DomainModal from './Modal/index'

import LocalStore from './store'

import './style.less'

export interface IDomainHostingProps {
  store: LocalStore
  toasterStore: ToasterStore
  localStorageStore: LocalStorageStore
}

@observer
class DomainHostingInner extends React.Component<IDomainHostingProps> {
  constructor(props: IDomainHostingProps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, this.props.toasterStore)
  }

  @autobind
  @ToasterStore.handle()
  handleOpenDomainModal(item?: IDomainInfo) {
    return this.props.store.domainModalStore.open({ item })
      .then((result: IDomainInfo) => {
        if (item) {
          this.props.store.updateDomain(result)
        } else {
          this.props.store.createDomain(result.cname)
        }
      })
  }

  @computed get headerView() {
    return (
      <div className="domain-hosting-header">
        <Button
          icon="plus"
          disabled={this.props.store.domainExists}
          onClick={() => this.handleOpenDomainModal()}
        >
          添加托管域名
        </Button>
        <Tooltip title={addDomainTip} className="add-tip">
          <Icon type="info-circle" />
        </Tooltip>
      </div>
    )
  }

  @computed get domainListView() {
    const checkDomain = throttle(this.props.store.checkDomain, throttleInterval)
    const columns = [
      {
        title: '域名',
        dataIndex: 'cname'
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (status: DomainStatus) => domainStatusTextMap[status]
      },
      {
        title: '操作',
        render: (_: unknown, row: IDomainInfo) => (
          <div className="operations-cell">
            <Link
              className="link-btn"
              disabled={row.status === DomainStatus.Success}
              onClick={() => checkDomain(row.cname)}
            >
              一键检测
            </Link>
            <Link
              className="link-btn"
              disabled={row.status === DomainStatus.Success}
              onClick={() => this.handleOpenDomainModal(row)}
            >
              修改
            </Link>
          </div>
        )
      }
    ]

    return (
      <Table
        className="domain-hosting-list"
        loading={this.props.store.isLoading}
        pagination={false}
        rowKey="domain"
        columns={columns}
        dataSource={this.props.store.domainList.slice()}
      />
    )
  }

  @computed get operationTipView() {
    if (this.props.store.domainStatus === DomainStatus.Success) {
      return null
    }

    return (
      <Spin spinning={this.props.store.isLoading}>
        <div className="domain-hosting-operation-tip">
          <p className="domain-hosting-operation-tip-title">
            域名托管操作索引：
          </p>
          <p className="domain-hosting-operation-tip-item">
            场景一：若您的域名已托管在 DNSPod 平台，请将该域名的管理权授权给 ID：100005111910
          </p>
          <p className="domain-hosting-operation-tip-item">
            场景二：若您的域名未添加至 DNSPod 请到您的域名购买处修改 DNS 服务器，并指向如下两个地址：f1g1ns1.dnspod.net、 f1g1ns2.dnspod.net
          </p>
          <p className="domain-hosting-operation-tip-remark">
            注：配置一旦生效，请务必保持该授权持续有效，否则会影响到您客户的解析服务。
          </p>
        </div>
      </Spin>
    )
  }

  componentDidMount() {
    this.props.store.getDomainList()

    if (!this.props.localStorageStore.getItem(localStorageKey)) {
      this.props.localStorageStore.setItem(localStorageKey, true)
      Modal.info({
        title: '域名托管',
        content: addDomainTip
      })
    }
  }

  render() {
    return (
      <Page className="comp-domain-hosting">
        {this.headerView}
        {this.domainListView}
        {this.operationTipView}
        <DomainModal
          {...this.props.store.domainModalStore.bind()}
        />
      </Page>
    )
  }
}

export default function DomainHosting() {
  const store = useLocalStore(LocalStore)
  const toasterStore = useInjection(ToasterStore)
  const localStorageStore = useInjection(LocalStorageStore)

  return (
    <DomainHostingInner
      store={store}
      toasterStore={toasterStore}
      localStorageStore={localStorageStore}
    />
  )
}
