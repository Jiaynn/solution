/**
 * @file component AccelerateDomains 空间概览里的 CDN 加速域名列表
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, when, observable, action, runInAction, makeObservable } from 'mobx'
import classNames from 'classnames'
import { observer, Observer } from 'mobx-react'
import { Table, Tooltip } from 'react-icecream/lib'
import { Link } from 'portal-base/common/router'
import Role from 'portal-base/common/components/Role'
import { Loadings } from 'portal-base/common/loading'
import { DomainApis, ICNAMEStatusResult } from 'portal-base/fusion'
import { ToasterStore } from 'portal-base/common/toaster'
import { UserInfoStore } from 'portal-base/user/account'
import Disposable from 'qn-fe-core/disposable'
import { InjectFunc, Inject } from 'qn-fe-core/di'

import { getCDNDomainPrompt, humanizeCDNDomainType } from 'kodo/transforms/domain'

import { DomainStore, ICDNDomain } from 'kodo/stores/domain'
import { KodoIamStore } from 'kodo/stores/iam'

import { getCDNDomainDetailPath } from 'kodo/routes/cdn'

import { CDNDomainBucketType } from 'kodo/constants/domain'
import { BucketDomainRole } from 'kodo/constants/role'

import { Auth } from 'kodo/components/common/Auth'
import DomainOperation from './DomainOperation'
import DomainState from './DomainState'

import styles from './style.m.less'

export class DomainTable extends Table<ICDNDomain> { }
export class DomainColumn extends Table.Column<ICDNDomain> { }

export interface IProps {
  bucketName: string
  fetchDomains(): void
  scrollHeight?: number
  useTextStyle?: boolean
}

interface DiDeps {
  inject: InjectFunc
}

const loadingId = 'cname'

@observer
class InternalAccelerateDomains extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(ToasterStore)
    ToasterStore.bindTo(this, toaster)
  }

  userInfoStore = this.props.inject(UserInfoStore)
  domainStore = this.props.inject(DomainStore)
  domainApis = this.props.inject(DomainApis)
  iamStore = this.props.inject(KodoIamStore)

  disposable = new Disposable()
  CNAMEMap = observable.map<string, boolean>()
  loadings = Loadings.collectFrom(this, loadingId)

  @computed
  // eslint-disable-next-line @typescript-eslint/naming-convention
  get CDNAccelerateDomains() {
    return this.domainStore.getCDNAccelerateDomainListByBucketName(this.props.bucketName)
  }

  @action.bound
  updateCNAMEMap(result: ICNAMEStatusResult[]) {
    if (result && result.length) {
      result.forEach(item => {
        this.CNAMEMap.set(item.domain, item.cnamed)
      })
    }
  }

  renderDomainName(domainInfo: ICDNDomain) {
    if (
      this.userInfoStore.isBufferedUser
      || this.iamStore.isIamUser
      || [CDNDomainBucketType.FusionHttps, CDNDomainBucketType.PanCustomer].includes(domainInfo.domainBucketType)
    ) {
      return (
        <Tooltip title={getCDNDomainPrompt(domainInfo)}>
          <div className={styles.tdBreak}>{domainInfo.name}</div>
        </Tooltip>
      )
    }

    return (
      <Tooltip title={getCDNDomainPrompt(domainInfo)}>
        <Link to={getCDNDomainDetailPath(domainInfo.name)} className={styles.tdBreak}>{domainInfo.name}</Link>
      </Tooltip>
    )
  }

  @computed get tableView() {
    return (
      <DomainTable
        loading={this.domainStore.isLoadingCDN}
        dataSource={this.CDNAccelerateDomains.slice()}
        pagination={false}
        {...this.props.scrollHeight && { scroll: { y: this.props.scrollHeight } }}
        rowKey="name"
      >
        <DomainColumn
          title="域名"
          dataIndex="name"
          key="name"
          width="26%"
          render={(_, domainInfo) => this.renderDomainName(domainInfo)}
        />
        <DomainColumn
          title="协议"
          dataIndex="protocol"
          key="protocol"
          width="13%"
          render={protocol => (protocol ? protocol.toUpperCase() : 'HTTP')}
        />
        <DomainColumn
          title="类型"
          dataIndex="type"
          key="type"
          align="left"
          width="15%"
          render={type => humanizeCDNDomainType(type)}
        />
        <DomainColumn
          title="状态"
          dataIndex="operatingState"
          key="operatingState"
          width="23%"
          render={(_, domainInfo) => (
            <Observer render={() => (
              <DomainState
                domainInfo={domainInfo}
                useTextStyle={!!this.props.useTextStyle}
                CNAMEMap={this.CNAMEMap}
                isCNAMELoading={this.loadings.isLoading(loadingId)}
              />
            )} />
          )}
        />
        <DomainColumn
          title="操作"
          key="operating"
          render={(_, domainInfo) => (
            <Auth notProtectedUser>
              <DomainOperation
                domainInfo={domainInfo}
                fetchDomains={this.props.fetchDomains}
                useTextStyle={!!this.props.useTextStyle}
              />
            </Auth>
          )}
        />
      </DomainTable>
    )
  }

  @ToasterStore.handle()
  @Loadings.handle(loadingId)
  fetchCNAMEStatus() {
    const fusionCustomers = this.CDNAccelerateDomains
      .filter(domain => domain.domainBucketType === CDNDomainBucketType.FusionCustomer)
      .map(item => ({
        domain: item.name,
        cname: item.cname
      }))

    const panCustomers = this.CDNAccelerateDomains.filter(domain => (
      domain.domainBucketType === CDNDomainBucketType.PanCustomer
    )).map(item => ({
      domain: item.name,
      cname: item.cname
    }))

    const req = Promise.all([
      this.domainApis.getDomainCNAMEStatus(fusionCustomers),
      this.domainApis.getDomainCNAMEStatus(panCustomers)
    ])
    req.then(([fusion, pan]) => {
      runInAction(() => {
        this.updateCNAMEMap(fusion)
        this.updateCNAMEMap(pan)
      })
    }).catch(() => null)

    return req
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }

  componentDidMount() {
    this.disposable.addDisposer(when(
      () => !!this.CDNAccelerateDomains.length,
      () => this.fetchCNAMEStatus()
    ))
  }

  render() {
    return (
      <Role name={BucketDomainRole.CDNDomainList}>
        <div className={classNames(styles.acceleratTable, !this.props.useTextStyle && styles.micro)}>
          {this.tableView}
        </div>
      </Role>
    )
  }
}

export default function AccelerateDomains(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalAccelerateDomains {...props} inject={inject} />
    )} />
  )
}
