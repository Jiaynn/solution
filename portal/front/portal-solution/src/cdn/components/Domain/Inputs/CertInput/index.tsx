/**
 * @file 指定 domain 的 cert 选择
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import moment from 'moment'
import { uniqBy } from 'lodash'
import { observable, action, reaction, computed } from 'mobx'
import { observer } from 'mobx-react'
import autobind from 'autobind-decorator'
import Select from 'react-icecream/lib/select'
import { injectProps } from 'qn-fe-core/local-store'
import Store, { observeInjectable as injectable } from 'qn-fe-core/store'
import { Link } from 'portal-base/common/router'
import { IamDisabled } from 'portal-base/user/iam'
import { DomainApis, ICertSearchByDomain } from 'portal-base/fusion'
import { SslClient } from 'portal-base/certificate'
import { useLocalStore } from 'portal-base/common/utils/store'

import { humanizeTimeUTC, getDiffDays } from 'cdn/transforms/datetime'
import { convertCertInfoToCertSearchInfo } from 'cdn/transforms/domain'

import { domainWithWildcard as domainPattern } from 'cdn/constants/pattern'

import OEMDisabled from 'cdn/components/common/OEMDisabled'

import Error from '../common/Error'

import './style.less'

export interface IDomainCertInputProps {
  domain: string
  value: string
  error?: any
  domainCertId?: string
  uid?: number
  onChange: (value: string) => void
}

@injectable()
export class LocalStore extends Store {

  @observable.ref certs: ICertSearchByDomain[] = []
  @observable.ref domainCert?: ICertSearchByDomain

  @action updateCerts(certs: ICertSearchByDomain[]) {
    this.certs = certs || []
  }

  @computed get allCerts() {
    // 证书列表的接口不会返回有效期小于 7 天的证书
    const certs = this.domainCert ? this.certs.concat(this.domainCert) : this.certs
    return uniqBy(certs, it => it.id)
  }

  fetchCerts(domain: string, uid?: number) {
    return this.domainApis.searchCertsByDomain({ domain, uid }).then(
      certs => this.updateCerts(certs)
    )
  }

  @action.bound updateDomainCertInfo(info?: ICertSearchByDomain) {
    this.domainCert = info
  }

  fetchDomainCertInfo(certId: string) {
    return this.sslClient.getCertInfo(certId).then(
      resp => this.updateDomainCertInfo(convertCertInfoToCertSearchInfo(resp))
    )
  }

  @computed get selectedCert() {
    const selectedCertId = this.props.value
    if (!selectedCertId) {
      return null
    }
    return this.allCerts.find(
      cert => cert.id === selectedCertId
    )
  }

  constructor(
    @injectProps() private props: IDomainCertInputProps,
    private sslClient: SslClient,
    private domainApis: DomainApis
  ) {
    super()
  }

  init() {
    // domain 内容有变，则重新加载对应的可选 cert 列表
    this.addDisposer(reaction(
      () => this.props.domain,
      domain => {
        this.updateCerts([])
        if (domain && domainPattern.test(domain)) {
          this.fetchCerts(domain)
        }
      },
      { fireImmediately: true }
    ))

    this.addDisposer(reaction(
      () => this.props.domainCertId,
      certId => {
        this.updateDomainCertInfo()
        if (certId) {
          this.fetchDomainCertInfo(certId)
        }
      },
      { fireImmediately: true }
    ))

    // certs 列表有变化且当前选中项不合法时，自动更新值
    this.addDisposer(reaction(
      () => this.allCerts,
      certs => {
        if (!this.selectedCert) {
          this.props.onChange(
            certs.length > 0
            ? certs[0].id
            : ''
          )
        }
      }
    ))
  }
}

type PropsWithDeps = IDomainCertInputProps & {
  store: LocalStore
}

@observer
class DomainCertInputInner extends React.Component<PropsWithDeps> {

  @autobind handleCertChange(certId: string) {
    this.props.onChange(certId)
  }

  getCertDetail() {
    const selectedCert = this.props.store.selectedCert
    if (!selectedCert) {
      return null
    }

    const dnsnameItems = selectedCert.dnsnames || []

    const [notBefore, notAfter] = [selectedCert.not_before, selectedCert.not_after].map(
      timeText => humanizeTimeUTC(timeText)
    )

    return (
      <div className="cert-detail">
        <div className="line cert-detail-item">
          证书包含域名：{dnsnameItems.join(' | ')}
        </div>
        <div className="line cert-detail-item">
          证书有效期：{notBefore} ~ {notAfter}
        </div>
      </div>
    )
  }

  getCertInputTips() {
    return (
      <div className="cert-input-tips">
        <IamDisabled>
          <OEMDisabled>
            您可以在&nbsp;<Link to="/certificate/ssl#cert">SSL 证书服务</Link>&nbsp;页面申请或上传自有证书。
          </OEMDisabled>
        </IamDisabled>
        该列表不包含有效期小于 7 天的证书。
      </div>
    )
  }

  render() {
    const certs = this.props.store.allCerts
    const options = certs.map(
      cert => (
        <Select.Option disabled={IsInvalidCert(cert)} key={cert.id} value={cert.id}>
          {humanizeCertInfo(this.props.domainCertId!, cert)}
        </Select.Option>
      )
    )

    // null/undefined 在这里都是无效的值，统一处理成 undefined 是为了显示 placeholder
    const value = this.props.value != null
      ? this.props.value
      : undefined

    return (
      <div className="domain-cert-input-wrapper">
        <div className="line">
          <div className="text-input-wrapper">
            <Select
              disabled={certs.length === 0}
              value={value}
              onChange={this.handleCertChange}
              placeholder={certs.length > 0 ? '请选择证书' : '暂无证书'}
              dropdownStyle={{ minWidth: '360px' }}
            >{options}</Select>
          </div>
          <Error error={this.props.error} />
          {this.getCertInputTips()}
        </div>
        {this.getCertDetail()}
      </div>
    )
  }
}

function getCertExpireDays(cert: ICertSearchByDomain) {
  return getDiffDays(moment(), moment(cert.not_after))
}

// 有效期小于 7 天被认为是无效的证书，即：不能被选中
function IsInvalidCert(cert: ICertSearchByDomain) {
  const diffDays = getCertExpireDays(cert)
  return diffDays < 7
}

function getCertExpireInfo(cert: ICertSearchByDomain) {
  const diffDays = getCertExpireDays(cert)
  if (diffDays < 0) {
    return '证书已过期'
  }
  return `有效期 ${diffDays} 天`
}

function humanizeCertInfo(currentCertId: string, cert: ICertSearchByDomain) {
  const certName = cert.cert_name || cert.name
  const expireInfo = getCertExpireInfo(cert)
  const currentCertInfo = currentCertId === cert.id ? '（当前绑定）' : ''

  return [certName, expireInfo, currentCertInfo].filter(Boolean).join(' ')
}

export default function DomainCertInput(props: IDomainCertInputProps) {
  const store = useLocalStore(LocalStore, props)
  return (
    <DomainCertInputInner {...props} store={store} />
  )
}
