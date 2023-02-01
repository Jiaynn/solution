/**
 * @file SourceDomain component
 * @description 源站域名管理
 * @author yinxulai <me@yinxulai.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import { computed, observable, action, makeObservable } from 'mobx'
import { Button, Icon } from 'react-icecream/lib'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import Role from 'portal-base/common/components/Role'

import { DomainStore } from 'kodo/stores/domain'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { BucketDomainRole } from 'kodo/constants/role'
import { RegionSymbol } from 'kodo/constants/region'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import DomainList from './DomainList'
import BoundDomain from './BoundDomain'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions {
  region: RegionSymbol
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalSourceDomain extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  domainStore = this.props.inject(DomainStore)
  @observable bindDomainDrawerVisible = false

  @action.bound
  updateBindDomainDrawerVisible(state: boolean) {
    this.bindDomainDrawerVisible = state
  }

  @computed
  get listData() {
    const { bucketName } = this.props
    return this.domainStore.sourceDomainListGroupByBucketName.get(bucketName) || []
  }

  get helpDocView() {
    return (
      <HelpDocLink className={styles.helpDoc} doc="domain">
        <Icon type="file-text" /> 了解源站域名管理
      </HelpDocLink>
    )
  }

  // 刷新按钮
  @computed
  get refreshButtonView() {
    return (
      <Role name={BucketDomainRole.RefreshSourceDomainListEntry}>
        <Button
          icon="reload"
          loading={this.domainStore.isLoadingSource}
          onClick={this.fetchDomainsByBucketName}
        >
          刷新列表
        </Button>
      </Role>
    )
  }

  render() {
    return (
      <div className={styles.content}>
        <div className={styles.toolbar}>
          <BoundDomain
            region={this.props.region}
            bucketName={this.props.bucketName}
          />
          {this.refreshButtonView}
        </div>
        <div className={styles.domainTable}>
          <DomainList
            data={this.listData}
            region={this.props.region}
            bucketName={this.props.bucketName}
            isLoading={this.domainStore.isLoadingSource}
          />
        </div>
      </div>
    )
  }

  @autobind
  @Toaster.handle()
  fetchDomainsByBucketName() {
    return this.domainStore.fetchKodoDomainListByBucketName(this.props.bucketName)
  }

  componentDidMount() {
    this.fetchDomainsByBucketName()
  }
}

export default function SourceDomain(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalSourceDomain {...props} inject={inject} />
    )} />
  )
}
