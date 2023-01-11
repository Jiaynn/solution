/**
 * @file DomainList component
 * @description 源站域名列表
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { action, computed, observable, reaction, makeObservable } from 'mobx'
import { observer, Observer } from 'mobx-react'

import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Disposable from 'qn-fe-core/disposable'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { FeatureConfigStore } from 'portal-base/user/feature-config'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import Role from 'portal-base/common/components/Role'
import { Button, Popconfirm, Spin, Table, Tag, Tooltip } from 'react-icecream/lib'

import { humanizeTimestamp } from 'kodo/transforms/date-time'
import { isForbiddenOfUnbindingDomain, isFrozeDomain } from 'kodo/transforms/domain'
import { isCertificateAvailable } from 'kodo/transforms/certificate'

import { CertStore } from 'kodo/stores/certificate'
import { ConfigStore } from 'kodo/stores/config'
import { DomainStore } from 'kodo/stores/domain'

import { BucketDomainRole } from 'kodo/constants/role'
import { domainFreezeTypesTextMap, DomainScope, IPPattern, domainScopeName } from 'kodo/constants/domain'

import { Auth } from 'kodo/components/common/Auth'

import { DomainInfo } from 'kodo/apis/domain'

import HTTPSSetting from './HTTPSSetting'
import styles from './style.m.less'

class DomainTable extends Table<DomainInfo> { }

class DomainColumn extends Table.Column<DomainInfo> { }

export interface IProps {
  region: string
  data: DomainInfo[]
  isLoading: boolean
  bucketName: string
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalDomainList extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  disposable = new Disposable()
  @observable currentDomain: string | undefined = undefined
  @observable HTTPSSettingDrawerVisible = false

  @autobind
  copyFeedback(_: string, state: boolean) {
    const toasterStore = this.props.inject(Toaster)

    if (state) {
      toasterStore.info('已成功拷贝到剪切板')
    } else {
      toasterStore.error('拷贝失败')
    }
  }

  @action.bound
  updateEditHTTPSDrawerVisible(state: boolean) {
    this.HTTPSSettingDrawerVisible = state
  }

  @action.bound
  openEditHTTPSDrawer(domain: string) {
    this.updateEditHTTPSDrawerVisible(true)
    this.currentDomain = domain
  }

  @action.bound
  closeEditHTTPSDrawer() {
    this.updateEditHTTPSDrawerVisible(false)
    this.currentDomain = undefined
  }

  @autobind
  @Toaster.handle('删除成功')
  handleUnbindDomain(domain: string) {
    const bucket = this.props.bucketName
    const domainStore = this.props.inject(DomainStore)
    return domainStore.unbindSourceBucket(domain, bucket)
  }

  @autobind
  @Toaster.handle('修改成功')
  handleChangeDomainScope(domain: string, domainScope: DomainScope) {
    const bucket = this.props.bucketName
    const domainStore = this.props.inject(DomainStore)
    return domainStore.bindSourceBucket(domain, bucket, domainScope)
  }

  @autobind
  @Toaster.handle('解冻成功')
  handleUnfreezeDomain(domain: string) {
    const bucket = this.props.bucketName
    const domainStore = this.props.inject(DomainStore)
    return domainStore.unfreezeDomain(domain, bucket)
  }

  @computed
  get regionConfig() {
    const configStore = this.props.inject(ConfigStore)
    return configStore.getRegion({ region: this.props.region })
  }

  @computed
  get domainScopeNameMap(): Record<DomainScope, string> {
    const domainConfig = this.regionConfig.objectStorage.domain

    return {
      [DomainScope.IO]: domainConfig.apiScopeName || domainScopeName[DomainScope.IO],
      [DomainScope.S3]: domainScopeName[DomainScope.S3]
    }
  }

  @computed
  get listData() {
    const { bucketName } = this.props
    const domainStore = this.props.inject(DomainStore)
    return domainStore.sourceDomainListGroupByBucketName.get(bucketName) || []
  }

  @autobind
  getRegionSourceHost(domainScope: DomainScope) {
    const region = this.props.region
    const domainStore = this.props.inject(DomainStore)
    const sourceHost = domainStore.getSourceHostByRegion(region, domainScope)
    return sourceHost || '--'
  }

  @autobind
  renderCopyButtonView(domainScope: DomainScope) {
    const regionHost = this.getRegionSourceHost(domainScope)

    return (
      <Tooltip title={regionHost}>
        <CopyToClipboard
          onCopy={this.copyFeedback}
          text={regionHost}
        >
          <Button type="link">
            {
              IPPattern.test(regionHost)
                ? '复制 A 记录'
                : '复制 CNAME'
            }
          </Button>
        </CopyToClipboard>
      </Tooltip>
    )
  }

  @computed
  get editHTTPSDrawerView() {
    return (
      <HTTPSSetting
        domain={this.currentDomain}
        isVisible={this.HTTPSSettingDrawerVisible}
        onClose={this.closeEditHTTPSDrawer}
      />
    )
  }

  // 空间设置
  @autobind
  renderSetting(_, record: DomainInfo) {
    const { api_scope: apiScope, domain, freeze_types: freezeTypes } = record
    const isFrozen = isFrozeDomain(freezeTypes)
    const unbindingIsForbidden = isForbiddenOfUnbindingDomain(freezeTypes)

    return (
      <span>
        {this.renderCopyButtonView(apiScope || DomainScope.IO)}
        <Auth notProtectedUser>
          <Inject render={({ inject }) => (
            isCertificateAvailable(inject) && (
              <Button
                type="link"
                disabled={isFrozen}
                onClick={() => this.openEditHTTPSDrawer(record.domain)}
              >
                配置 HTTPS
              </Button>
            )
          )} />
          <Popconfirm
            okText="确定"
            cancelText="取消"
            placement="bottom"
            title="确定解绑该域名？"
            onConfirm={() => this.handleUnbindDomain(domain)}
          >
            <Button type="link" disabled={unbindingIsForbidden}>
              解绑
            </Button>
          </Popconfirm>
          {
            (isFrozen && !unbindingIsForbidden) && (
              <Button type="link" onClick={() => this.handleUnfreezeDomain(domain)}>
                解冻
              </Button>
            )
          }
        </Auth>
      </span>
    )
  }

  @computed
  get domainListView() {
    const certStore = this.props.inject(CertStore)
    const featureStore = this.props.inject(FeatureConfigStore)
    const isAwsS3Enable = (
      this.regionConfig.objectStorage.domain.awsS3.enable
      && !featureStore.isDisabled('KODO.KODO_S3API')
    )

    return (
      <DomainTable
        rowKey="domain"
        pagination={false}
        dataSource={this.listData}
        loading={this.props.isLoading}
      >
        <DomainColumn
          key="domain"
          title="域名"
          render={(_, { domain, freeze_types: freezeTypes }) => (
            <>
              <span className={styles.domain}>{domain}</span>
              {isFrozeDomain(freezeTypes) && (
                <Tooltip title={freezeTypes!.map(type => domainFreezeTypesTextMap[type]).join('、')}>
                  <Tag color="yellow3" small>冻结</Tag>
                </Tooltip>
              )}
            </>
          )}
        />
        {isAwsS3Enable && (
          <DomainColumn
            width="140px"
            title="API 域"
            align="center"
            key="apiscope"
            render={(_, { api_scope: apiScope = DomainScope.IO }) => (
              <>{this.domainScopeNameMap[apiScope]}</>
            )}
          />
        )}
        <DomainColumn
          width="80px"
          title="协议"
          key="protocol"
          render={(_, { domain }) => (
            <Observer render={() => (
              <Spin
                spinning={
                  // 如果整个列表正在 loading，这个就不显示 loading 了
                  // 两个 spin 叠在一起很丑
                  this.props.isLoading === true
                    ? false
                    : certStore.isLoadingCertificateWithDomain
                }
              >
                {
                  certStore.certificationWithDomainMap.get(domain)
                    ? 'HTTPS'
                    : 'HTTP'
                }
              </Spin>
            )} />
          )}
        />
        <DomainColumn
          width="200px"
          align="center"
          key="modifyTime"
          title="修改时间"
          render={(_, { update_time: updateTime }) => (updateTime ? humanizeTimestamp(updateTime * 1000) : '--')}
        />
        <DomainColumn
          width="200px"
          align="center"
          key="createTime"
          title="创建时间"
          render={(_, { create_time: createTime }) => (createTime ? humanizeTimestamp(createTime * 1000) : '--')}
        />
        <DomainColumn
          width="280px"
          key="operating"
          title="操作"
          render={(value, record) => (
            <Observer render={() => this.renderSetting(value, record)} />
          )}
        />
      </DomainTable>
    )
  }

  render() {
    return (
      <>
        {this.editHTTPSDrawerView}
        <Role name={BucketDomainRole.SourceDomainList}>
          {this.domainListView}
        </Role>
      </>
    )
  }

  @autobind
  @Toaster.handle()
  fetchCerts() {
    const certStore = this.props.inject(CertStore)
    return certStore.fetchListWithDomain()
  }

  componentDidMount() {
    this.disposable.addDisposer(
      reaction(
        () => this.props.data,
        this.fetchCerts,
        { fireImmediately: true }
      )
    )
  }

  componentWillUnmount() {
    this.disposable.dispose()
  }
}

export default function DomainList(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalDomainList {...props} inject={inject} />
    )} />
  )
}
