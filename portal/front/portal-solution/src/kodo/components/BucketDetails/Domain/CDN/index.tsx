/**
 * @file Component CDNDomains
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button } from 'react-icecream'
import autobind from 'autobind-decorator'
import { Inject, InjectFunc } from 'qn-fe-core/di'
import Role from 'portal-base/common/components/Role'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'

import { DomainStore } from 'kodo/stores/domain'

import { IDetailsBaseOptions } from 'kodo/routes/bucket'

import { BucketDomainRole } from 'kodo/constants/role'

import { Auth } from 'kodo/components/common/Auth'
import Domains from 'kodo/components/common/AccelerateDomain'

import styles from './style.m.less'

export interface IProps extends IDetailsBaseOptions { }

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalCDN extends React.Component<IProps & DiDeps> {

  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  @autobind
  @Toaster.handle()
  fetchCDNDomains() {
    const domainStore = this.props.inject(DomainStore)

    return domainStore
      .fetchCDNDomainListByBucketName(this.props.bucketName)
  }
  handleCreateDomain(visible:(visible:boolean)=>void){
    visible(true)
  }
  componentDidMount() {
    this.fetchCDNDomains()
  }

  // 创建按钮
  @computed
  get createButtonView() {
    const {visible} = this.props

    return (
      <Auth
        notProtectedUser
        render={disabled => (
          <Role name={BucketDomainRole.BindCDNDomainEntry}>
              <Button type="primary" disabled={disabled} icon="plus" onClick={()=>this.handleCreateDomain(visible!)}>
                绑定域名
              </Button>
          </Role>
        )}
      />
    )
  }

  // 刷新按钮
  @computed
  get refreshButtonView() {
    const domainStore = this.props.inject(DomainStore)

    return (
      <Role name={BucketDomainRole.RefreshCDNDomainListEntry}>
        <Button
          icon="reload"
          className={styles.button}
          loading={domainStore.isLoadingCDN}
          onClick={this.fetchCDNDomains}
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
          {this.createButtonView}
          {this.refreshButtonView}
        </div>
        <div className={styles.domainTable}>
          <Domains
            useTextStyle
            bucketName={this.props.bucketName}
            fetchDomains={this.fetchCDNDomains}
          />
        </div>
      </div>
    )
  }
}

export default function CDN(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalCDN {...props} inject={inject} />
    )} />
  )
}
