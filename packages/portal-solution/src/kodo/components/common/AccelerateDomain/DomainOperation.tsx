/**
 * @file component DomainOperation 加速域名操作
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import { Tag, Popover, Icon, Popconfirm, Button, Tooltip } from 'react-icecream/lib'
import { Link } from 'portal-base/common/router'
import { DomainApis } from 'portal-base/fusion'
import { ToasterStore as Toaster } from 'portal-base/common/toaster'
import { VerificationModalStore } from 'portal-base/user/verification'

import { InjectFunc, Inject } from 'qn-fe-core/di'

import { ICDNDomain } from 'kodo/stores/domain'

import { getCDNDomainDetailPath } from 'kodo/routes/cdn'

import { CDNDomainBucketType, CDNDomainStatus, CDNDomainType } from 'kodo/constants/domain'

import HelpDocLink from 'kodo/components/common/HelpDocLink'
import styles from './style.m.less'

export interface IProps {
  useTextStyle: boolean
  domainInfo: ICDNDomain
  fetchDomains(): void
}

interface DiDeps {
  inject: InjectFunc
}

@observer
class InternalDomainOperation extends React.Component<IProps & DiDeps> {
  constructor(props: IProps & DiDeps) {
    super(props)

    makeObservable(this)

    const toaster = this.props.inject(Toaster)
    Toaster.bindTo(this, toaster)
  }

  DomainApis = this.props.inject(DomainApis)
  verificationModalStore = this.props.inject(VerificationModalStore)

  @autobind
  @Toaster.handle()
  deleteHttpsDomain() {
    const req = this.DomainApis.deleteHttpsDomain(this.props.domainInfo.name)
    req.then(this.props.fetchDomains).catch(() => { /**/ })
    return req
  }

  @autobind
  @Toaster.handle()
  deletePanDomain() {
    const req = this.DomainApis.deletePanDomain(this.props.domainInfo.name)
    req.then(this.props.fetchDomains).catch(() => { /**/ })
    return req
  }

  @computed
  get contentView() {
    const { domainInfo, useTextStyle } = this.props
    const popContent = (
      <>
        <p>CNAME:{domainInfo.cname}</p>
        <p>
          {
            domainInfo.type === CDNDomainType.Pan ? <span>泛子域名的 CNAME 和泛域名相同</span> : null
          }
          <HelpDocLink doc="configureCnameDomain">
            如何配置 CNAME
          </HelpDocLink>
        </p>
      </>
    )

    const CNAMEContent = useTextStyle
      ? (
        <Tooltip title={popContent}>
          <HelpDocLink doc="configureCnameDomain">
            CNAME
          </HelpDocLink>
        </Tooltip>
      )
      : (
        <Popover placement="right" content={popContent}>
          <Tag className={styles.lightTag} small color="grey0">CNAME</Tag>
        </Popover>
      )

    if (
      [CDNDomainBucketType.FusionCustomer, CDNDomainBucketType.WildcardCustomer]
        .includes(domainInfo.domainBucketType)
    ) {
      return (
        <div className={styles.tdBreak}>
          {
            domainInfo.operatingState === CDNDomainStatus.Success && domainInfo.couldOperateBySelf
              ? (
                <Link to={getCDNDomainDetailPath(domainInfo.name)} className={useTextStyle ? styles.textGap : ''}>
                  {
                    useTextStyle
                      ? (<Button type="link">详情</Button>)
                      : (<Icon className={styles.lightIcon} type="lock" />)
                  }
                </Link>
              )
              : null
          }
          {
            domainInfo.operatingState === CDNDomainStatus.Success
              ? CNAMEContent
              : null
          }
        </div>
      )
    }

    if ([CDNDomainBucketType.KodoHttps, CDNDomainBucketType.FusionHttps].includes(domainInfo.domainBucketType)) {
      return (
        <div className={styles.tdBreak}>
          <Popconfirm
            okText="确定"
            cancelText="取消"
            placement="bottom"
            title={`确定要删除 ${domainInfo.name} 吗?`}
            onConfirm={() => this.verificationModalStore.verify().then(this.deleteHttpsDomain)}
          >
            {
              useTextStyle
                ? (<Button type="link">删除</Button>)
                : (<Icon type="delete" className={styles.danger} />)
            }
          </Popconfirm>
        </div>
      )
    }

    if (domainInfo.domainBucketType === CDNDomainBucketType.PanCustomer) {
      return (
        <div className={styles.tdBreak}>
          <Popconfirm
            okText="确定"
            cancelText="取消"
            placement="bottom"
            title={`确定要删除 ${domainInfo.name} 吗?`}
            onConfirm={() => this.verificationModalStore.verify().then(this.deletePanDomain)}
          >
            {
              useTextStyle
                ? <Button type="link">删除</Button>
                : <Icon type="delete" className={styles.danger} />
            }
          </Popconfirm>
          {
            domainInfo.operatingState === CDNDomainStatus.Success
              ? CNAMEContent
              : null
          }
        </div>
      )
    }

    return null
  }

  render() {
    return this.contentView
  }
}

export default function DomainOperation(props: IProps) {
  return (
    <Inject render={({ inject }) => (
      <InternalDomainOperation {...props} inject={inject} />
    )} />
  )
}
