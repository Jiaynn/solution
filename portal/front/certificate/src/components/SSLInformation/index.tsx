/*
 * @file component SSLInformation
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import React from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { uniq } from 'lodash'

import { useInjection } from 'qn-fe-core/di'
import Button from 'react-icecream/lib/button'
import Form from 'react-icecream/lib/form'
import ToolTip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import Tag from 'react-icecream/lib/tag'
import Modal from 'react-icecream/lib/modal'

import { Loadings } from 'portal-base/common/loading'
import { ToasterStore } from 'portal-base/common/toaster'
import { RouterStore, Link } from 'portal-base/common/router'
import { SslClient } from 'portal-base/certificate'

import { sslType, humanizeSSLDomainType, orderStatusTextMap, orderStatusNameMap, OrderStatus, SearchType, isDVSSLType } from '../../constants/ssl'
import { standardDomainRegx, wildcardDomainRegx, AuthMethodType, CompleteType, dnsRecordTypeTextMap, DnsRecordType } from '../../constants/domain'
import SslApis, { IVerifyHostOptions } from '../../apis/ssl'
import { payForOrder, humanizeTime } from '../../utils/base'
import { canRenew, canAddDomain, canUploadConfirmation, getCertYearTipsByAutoRenew } from '../../utils/certificate'
import { isOEM } from '../../constants/env'
import { isStatusDone, isStatusPaying, shouldHasCert } from '../../utils/certificate/status'

import OrderInfoStore from '../../stores/order-info'
import CertInfoStore from '../../stores/cert-info'
import DownloadCertForm from '../SSLOverview/DownloadCertForm'
import CompanyContactShow from './CompanyContactShow'
import OrderHistory from './OrderHistory'
import PageWithBreadcrumb from '../Layout/PageWithBreadcrumb'
import LayoutBlock from '../common/LayoutBlock'
import OEMDisabled from '../common/OEMDisabled'
import { basename } from '../../constants/app'
import { AppointmentForDisplay } from '../Deploy/Appointment'
import OrderStatusTooltip from '../common/OrderStatusTooltip'
import AuthValueItem from '../common/AuthValueItem'
import { humanizeAuthKey, transformAuthKey } from '../../transforms/domain'

import './style.less'

const FormItem = Form.Item

export interface ISSLInformationProps {
  itemid: string,
  type: 'order' | 'cert',
  orderInfo?: OrderInfoStore,
  certInfo?: CertInfoStore,
  now?: number
}

type SSLInformationInnerProps = ISSLInformationProps & {
  routerStore: RouterStore
  sslApis: SslApis
  sslClient: SslClient
  toasterStore: ToasterStore
}

@observer
class SSLInformation extends React.Component<SSLInformationInnerProps> {

  constructor(props: SSLInformationInnerProps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, props.toasterStore)
    this.updateDnsNames = this.updateDnsNames.bind(this)
    this.updateCertID = this.updateCertID.bind(this)
    this.handleCloseOrder = this.handleCloseOrder.bind(this)
    this.closeOrder = this.closeOrder.bind(this)
    this.updateNow = this.updateNow.bind(this)
    this.toggleDownloadLightbox = this.toggleDownloadLightbox.bind(this)
  }

  itemid = this.props.itemid
  infoType = this.props.type
  now = this.props.now || Date.now()
  intervalId?: number

  loadings = new Loadings('load')
  @computed get isLoading() {
    return this.loadings.isLoading('load')
  }

  @observable downloadLightbox = {
    visible: false,
    config: {
      certId: '',
      brand: '',
      sslType: ''
    }
  }

  @observable order: OrderInfoStore = this.props.orderInfo || new OrderInfoStore(this.props.sslApis)
  @observable certInfo: CertInfoStore = this.props.certInfo || new CertInfoStore()
  @observable dnsNames?: string[]
  @observable.ref hostVerifiedMap = observable.map<string, boolean>()

  @computed get orderBaseInfo() {
    return this.order.orderBaseInfo
  }

  @computed get authInfo() {
    return this.order.authInfo
  }

  @computed get completedInfo() {
    return this.order.completedInfo
  }

  @computed get wildcardNum() {
    if (this.isLoading) {
      return -1
    }
    const dnsWildcardNum = this.allDnsNames.filter(
      domain => wildcardDomainRegx.test(domain)
    ).length
    const isCommonNameWildcard = wildcardDomainRegx.test(this.order.completedInfo.newDomains.commonName) ? 1 : 0
    return isCommonNameWildcard + dnsWildcardNum
  }

  @computed get normalNum() {
    if (this.isLoading) {
      return -1
    }
    const dnsNormalNum = this.allDnsNames.filter(
      domain => standardDomainRegx.test(domain)
    ).length
    const isCommonNameNormal = standardDomainRegx.test(this.order.completedInfo.newDomains.commonName) ? 1 : 0
    return isCommonNameNormal + dnsNormalNum
  }

  @computed get allDnsNames() {
    if (!this.dnsNames) {
      return this.isLoading ? [] : this.completedInfo.newDomains.dnsNames.slice().sort()
    }
    return this.dnsNames.slice().sort()
  }

  @computed get sslYear() {
    const { year } = this.orderBaseInfo
    if (!this.isLoading && year) {
      return `${year}年${getCertYearTipsByAutoRenew(this.order.autoRenew)}`
    }

    return '--'
  }

  @action updateDnsNames(dnsNames: string[]) {
    this.dnsNames = dnsNames || []
  }

  @action updateCertID(certId: string) {
    this.order.certID = certId
  }

  @action toggleDownloadLightbox() {
    this.downloadLightbox.visible = !this.downloadLightbox.visible
  }

  @action updateVerifyHostConfig(host: string, verified: boolean) {
    this.hostVerifiedMap.set(host, verified)
  }

  @ToasterStore.handle('关闭成功！')
  closeOrder(orderId: string) {
    return this.props.sslApis.closeSSLOrder(orderId)
  }

  handleCloseOrder(orderId: string) {
    this.closeOrder(orderId).then(
      () => this.fetchOrderData()
    )
  }

  handleDownload() {
    window.open(`/api/certificate/v1/ssl/${this.itemid}/download`)
  }

  @action handleOperation(type: string) {
    const { routerStore } = this.props

    switch (type) {
      case 'rename': {
        break
      }
      case 'download': {
        this.toggleDownloadLightbox()
        this.downloadLightbox.config = {
          certId: this.itemid,
          brand: this.certInfo.brand,
          sslType: this.certInfo.sslType
        }
        break
      }
      case 'renewal': {
        routerStore.push(`${basename}/apply/renewal/${this.itemid}`)
        break
      }
      case 'addDomain': {
        routerStore.push(`${basename}/reissue/${this.itemid}/add`)
        break
      }
      case 'fixup': {
        routerStore.push(`${basename}/complete/first/${this.itemid}`)
        break
      }
      case 'fixupRenew': {
        routerStore.push(`${basename}/complete/renew/${this.itemid}`)
        break
      }
      case 'confirmation': {
        routerStore.push(`${basename}/confirmation/${this.itemid}`)
        break
      }
      case 'close': {
        const orderid = this.itemid
        Modal.confirm({
          content: '确认关闭该订单?',
          onOk: () => this.handleCloseOrder(orderid)
        })
        break
      }
      case 'pay': {
        payForOrder({ orderId: this.itemid, tradeOrderId: this.order.tradeOrderId }, routerStore)
        break
      }
      default:
    }
  }

  // 获取订单详情
  @ToasterStore.handle()
  @action fetchOrderData() {
    const result = new Promise<void>(resolve => {
      this.props.sslApis.fetchOrderPrepareInfo(this.itemid).then(res => {
        this.order.updateApplyStateData(res)
        this.order.updateCompanyContact(res)
        this.fetchHostConfigStatus()
        if ([1, 10, 11, 12, 13, 14].indexOf(res.state) !== -1 && res.certID !== '') {
          this.fetchCertData(res.certID).then(() => resolve())
        } else {
          resolve()
        }
      })
    })

    return this.loadings.promise('load', result)
  }
  // 获取证书详情
  @ToasterStore.handle()
  @action fetchCertData(id?: string) {
    // 传入id，指定查询的certID，否则则默认用route传入的参数:itemid
    const certID = id || this.itemid
    const result = this.props.sslClient.getCertInfo(certID).then(res => {
      this.certInfo.updateCertData(res)
    })

    return this.loadings.promise('load', result)
  }

  @action updateNow() {
    this.now = Date.now()
  }

  componentDidMount() {
    this.intervalId = window.setInterval(this.updateNow, 1000)
    if (this.infoType === 'order' && !this.props.orderInfo) {
      this.fetchOrderData()
      return
    }
    if (this.infoType === SearchType.Cert && !this.props.certInfo) {
      this.fetchCertData()

    }
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  @computed get dnsRecordType() {
    return this.completedInfo.newDomains.recordType || DnsRecordType.Txt
  }

  @computed get certId() {
    if (this.infoType === 'cert') {
      return this.itemid
    }
    return this.order.certID
  }

  @computed get orderId() {
    if (this.infoType === 'order') {
      return this.itemid
    }
    return this.certInfo.orderid
  }

  @computed get dnsNamesAndCommonName() {
    if (this.infoType === 'cert') {
      return uniq([...this.certInfo.dnsNames || [], this.certInfo.commonName])
    }
    return uniq([
      this.completedInfo.newDomains.commonName,
      ...this.completedInfo.newDomains.dnsNames
    ])
  }

  @computed get canBeRenewed() {
    return canRenew(this.order.renewable)
  }

  @computed get orderStatusView() {
    if (this.isLoading || !this.certInfo) {
      return null
    }

    if (this.canBeRenewed) {
      return (
        <span>
          <span className="status-done">已签发{this.order.state === OrderStatus.Reissued ? '(重颁发)' : ''}</span>
          <span className="status-paying"> (待续费)</span>
          <Tag color="red2">
            <Link to={`${basename}/apply/renewal/${this.itemid}`} target="_blank" rel="noopener">立即续费</Link>
          </Tag>
        </span>
      )
    }

    if (isStatusDone(this.order.state) && this.now > this.certInfo.notAfter * 1000) {
      return (
        <span>
          <span className="status-done">已签发</span>
          <span className="status-outdate"> (已过期)</span>
        </span>
      )
    }

    if (this.order.state === OrderStatus.Closed) {
      return <span className="status-closed">{this.order.isPaid ? '已退费' : '已关闭'}</span>
    }

    return (
      <span className={`status-${orderStatusNameMap[this.order.state]}`}>
        {orderStatusTextMap[this.order.state]}
      </span>
    )
  }

  @ToasterStore.handle()
  verifyHost(domain: string, options: IVerifyHostOptions) {
    return this.props.sslApis.verifyHost(options)
      .then(verified => {
        this.updateVerifyHostConfig(domain, verified)
      })
  }

  fetchHostConfigStatusByDns() {
    this.authInfo.forEach(auth => {
      const options = {
        domain: transformAuthKey(auth.AuthKey, AuthMethodType.Dns, this.dnsRecordType),
        method: AuthMethodType.Dns,
        value: auth.AuthValue,
        record_type: this.dnsRecordType
      }
      this.verifyHost(auth.Domain, options)
    })
  }

  fetchHostConfigStatusByDnsProxy() {
    this.authInfo.forEach(auth => {
      const options = {
        domain: transformAuthKey(auth.AuthKey, AuthMethodType.DnsProxy),
        method: AuthMethodType.DnsProxy,
        value: auth.AuthValue
      }
      this.verifyHost(auth.Domain, options)
    })
  }

  fetchHostConfigStatusByFile() {
    this.authInfo.forEach(auth => {
      const options = {
        domain: auth.Domain,
        method: AuthMethodType.File,
        path: auth.AuthKey,
        value: auth.AuthValue
      }
      this.props.sslApis.verifyHost(options)
        .then(verified => {
          this.updateVerifyHostConfig(auth.Domain, verified)
        })
    })
  }

  fetchHostConfigStatus() {
    const type = this.completedInfo.newDomains.authMethod
    if (!this.authInfo || this.authInfo.length === 0) {
      return
    }
    if (type === 'DNS') {
      this.fetchHostConfigStatusByDns()
    } else if (type === 'DNS_PROXY') {
      this.fetchHostConfigStatusByDnsProxy()
    } else {
      this.fetchHostConfigStatusByFile()
    }
  }

  render() {
    const authMethod = this.completedInfo.newDomains.authMethod as AuthMethodType

    return (
      <PageWithBreadcrumb>
        <div className="comp-cert-detail">
          <div className="detail-content-wrapper">
            <Form layout="horizontal" colon={false} className="cert-detail-form">
              {
                  this.infoType === 'order'
                    ? <LayoutBlock title="订单信息">
                      <FormItem
                        label="订单号"
                        className="cert-form-item"
                      >
                        {this.itemid ? this.itemid : '--'}
                      </FormItem>
                      <FormItem
                        label="证书备注名"
                        className="cert-form-item"
                      >
                        <div className="qn-form-text" >
                          {
                          !this.isLoading && this.completedInfo.newDomains.memoName
                            ? `${this.completedInfo.newDomains.memoName} `
                            : '--'
                          }
                        </div>
                      </FormItem>
                      <FormItem
                        label="产品名称"
                        className="cert-form-item"
                      >
                        <div className="qn-form-text" >
                          {
                          !this.isLoading && this.orderBaseInfo.sslBrand
                          && this.orderBaseInfo.sslType && this.orderBaseInfo.domainType.name
                            ? `${this.orderBaseInfo.sslBrand} `
                            + `${sslType[this.orderBaseInfo.sslType].text} `
                            + `(${sslType[this.orderBaseInfo.sslType].code})  `
                            + `${humanizeSSLDomainType(this.orderBaseInfo.domainType.name)}`
                            : '--'
                          }
                        </div>
                      </FormItem>
                      <FormItem
                        label="创建时间"
                        className="cert-form-item"
                      >
                        <div className="qn-form-text" >
                          {
                          !this.isLoading && this.order.createTime
                          ? humanizeTime(this.order.createTime)
                          : '--'
                          }
                        </div>
                      </FormItem>
                      <FormItem
                        label="订单状态"
                        className="cert-form-item"
                      >
                        <div className="qn-form-text" >
                          {this.orderStatusView}
                          {
                          !this.isLoading
                          && shouldHasCert(this.order.state)
                          && this.order.certID
                          ? <Tag color="blue6">
                            <Link relative to={`../../${this.order.certID}/cert`} target="_blank" rel="noopener">查看证书</Link>
                          </Tag>
                          : null
                          }
                          {!this.isLoading && (
                            <OrderStatusTooltip
                              state={this.order.state}
                              certType={this.orderBaseInfo.sslType}
                              confirmLetterUploaded={this.order.uploadConfirmLetter}
                              rejectReason={this.order.rejectReason}
                            />
                          )}
                          {
                            !this.isLoading
                          && this.order.state === OrderStatus.Pending
                          && isDVSSLType(this.certInfo.sslType)
                          && (
                            <div className="pending-tip">
                              证书未签发，请尽快验证域名所有权，
                              <a target="_blank" rel="noopener" href="https://developer.qiniu.com/ssl/manual/3667/ssl-certificate-of-free-dns-validation-guide">查看配置指南</a>。
                            </div>
                          )
                          }
                        </div>
                      </FormItem>
                      <FormItem
                        label="证书有效期"
                        className="cert-form-item"
                      >
                        <div className="qn-form-text" >
                          {this.sslYear}
                        </div>
                      </FormItem>
                      <FormItem
                        label="域名额度"
                        className="cert-form-item"
                      >
                        <span className="qn-form-text" >
                          {
                            (() => {
                              if (this.isLoading || !this.orderBaseInfo.domainType) {
                                return '--'
                              }
                              const normal = (
                              this.orderBaseInfo.domainType.normal
                              ? Math.max(this.orderBaseInfo.domainType.normal, this.normalNum)
                              : this.normalNum
                              )
                              const wildcard = (
                              this.orderBaseInfo.domainType.wildcard
                              ? Math.max(this.orderBaseInfo.domainType.wildcard, this.wildcardNum)
                              : this.wildcardNum
                              )
                              const res = []
                              if (normal > 0) {
                                res.push(`*标准域名 ${normal} 个`)
                              }
                              if (wildcard > 0) {
                                res.push(`*泛域名 ${wildcard} 个`)
                              }
                              return res.length > 0 && res.join('，')
                            })()
                          }
                        </span>
                      </FormItem>
                      <FormItem
                        label="已绑定域名"
                        className="cert-form-item"
                      >
                        <div className="qn-form-text" >
                          {
                          !this.isLoading && this.completedInfo.newDomains.commonName !== ''
                          ? `${this.completedInfo.newDomains.commonName}(通用名称)`
                          : '未绑定'
                          }
                        </div>
                        {
                          !this.isLoading && this.allDnsNames.length > 0
                          ? (
                            this.allDnsNames
                              .filter(domain => domain !== '' && domain !== this.completedInfo.newDomains.commonName)
                              .map(domain => (
                                <div className="qn-form-text" key={domain}>
                                  {`${domain}`}
                                </div>
                              ))
                          )
                          : null
                        }
                      </FormItem>
                      {
                        !this.isLoading
                        && this.authInfo
                          ? (
                            <FormItem
                              label="域名所有权验证"
                              className="cert-form-item"
                            >
                              <div className="qn-form-text" >
                                {
                                  `验证类型：${authMethod === AuthMethodType.Dns ? `DNS(${dnsRecordTypeTextMap[this.dnsRecordType]})` : authMethod}`
                                }
                                <Link
                                  to="https://developer.qiniu.com/ssl/manual/3667/ssl-certificate-of-free-dns-validation-guide"
                                  target="_blank"
                                  rel="noopener"
                                  style={{ marginLeft: '10px' }}
                                >
                                  (配置指南)
                                </Link>
                                {this.order.state === OrderStatus.Pending && (
                                  <>
                                    <ToolTip
                                      placement="bottom"
                                      arrowPointAtCenter
                                      title="点击可检测域名是否通过验证"
                                    >
                                      <Button onClick={() => this.fetchHostConfigStatus()} className="verify-btn" size="small" type="primary">检测验证结果</Button>
                                    </ToolTip>
                                  </>
                                )}
                              </div>
                              <div>
                                {
                                  this.authInfo.map(info => {
                                    const { Domain: domain, AuthKey: authKey, AuthValue: authValue } = info
                                    return (
                                      <div className="dns-info" key={domain}>
                                        <div className="qn-form-text" >
                                          校验域名：{domain}
                                        </div>
                                        <div className="qn-form-text">
                                          {humanizeAuthKey(authKey, authMethod, this.dnsRecordType)}
                                        </div>
                                        <div className="qn-form-text">
                                          <AuthValueItem
                                            authValue={authValue}
                                            authMethod={authMethod}
                                            recordType={this.dnsRecordType}
                                          />
                                        </div>
                                        {
                                          // 只有在 待确认 状态才显示校验结果
                                          this.order.state === OrderStatus.Pending
                                          && this.hostVerifiedMap.has(domain) && (
                                            <div className="qn-form-text" >
                                              检测结果：
                                              {
                                                this.hostVerifiedMap.get(domain)
                                                ? <span className="verified-success">域名所有权验证通过</span>
                                                : <span className="verified-fail">域名所有权验证未通过</span>
                                              }
                                            </div>
                                          )
                                        }
                                      </div>
                                    )
                                  })
                                }
                              </div>
                            </FormItem>
                          )
                        : null
                      }
                      {
                        !this.isLoading
                        && isDVSSLType(this.orderBaseInfo.sslType)
                        && this.completedInfo.newDomains.commonName !== '' && this.completedInfo.newDomains.encrypt !== ''
                          ? (
                            <FormItem
                              label="加密算法"
                              className="cert-form-item"
                            >
                              {this.completedInfo.newDomains.encrypt === 'ECDSA' ? 'ECC' : this.completedInfo.newDomains.encrypt}
                            </FormItem>
                          )
                        : null
                      }
                      <FormItem className="cert-form-item">
                        <div className="explain-text"><i>*名词解释：</i>“标准域名”例如：www.qiniu.com; qiniu.com；&quot;泛域名&quot;例如：*.qiniu.com; *.abc.qiniu.com</div>
                      </FormItem>
                    </LayoutBlock>
                  : <LayoutBlock title="证书信息">
                    <OEMDisabled>
                      <FormItem
                        label="订单号"
                        className="cert-form-item"
                      >
                        {
                          !this.isLoading && this.certInfo.orderid
                          ? <Link relative to={`../../${this.certInfo.orderid}/order`} target="_blank" rel="noopener">{this.certInfo.orderid}</Link>
                          : '--'
                        }
                      </FormItem>
                    </OEMDisabled>
                    <FormItem
                      label="证书 ID"
                      className="cert-form-item"
                    >
                      <div className="qn-form-text">
                        {
                          !this.isLoading && this.certInfo.certid
                            ? this.certInfo.certid
                            : '--'
                        }
                      </div>
                    </FormItem>
                    <FormItem
                      label="证书备注名"
                      className="cert-form-item"
                    >
                      <div className="qn-form-text" >
                        {
                          !this.isLoading && this.certInfo.memoName
                            ? `${this.certInfo.memoName} `
                            : '--'
                        }
                      </div>
                    </FormItem>
                    <FormItem
                      label="产品名称"
                      className="cert-form-item"
                    >
                      <div className="qn-form-text" >
                        {
                          !this.isLoading
                            ? this.certInfo.brand && this.certInfo.sslType
                            ? `${this.certInfo.brand} `
                            + `${sslType[this.certInfo.sslType].text} `
                            + `(${sslType[this.certInfo.sslType].code})  `
                            + `${humanizeSSLDomainType(this.certInfo.domainType)}`
                            : '自有证书'
                          : '--'
                        }
                      </div>
                    </FormItem>
                    <FormItem
                      label="创建时间"
                      className="cert-form-item"
                    >
                      <div className="qn-form-text">
                        {
                          !this.isLoading && this.certInfo.create_time
                          ? humanizeTime(this.certInfo.create_time)
                          : '--'
                        }
                      </div>
                    </FormItem>
                    <FormItem
                      label="生效时间"
                      className="cert-form-item"
                    >
                      <div className="qn-form-text" >
                        {
                          !this.isLoading && this.certInfo
                          ? `${humanizeTime(this.certInfo.notBefore)} ~ ${humanizeTime(this.certInfo.notAfter)}`
                          : '--'
                        }
                      </div>
                    </FormItem>
                    <FormItem
                      label="通用名称"
                      className="cert-form-item"
                    >
                      <div className="qn-form-text" >
                        {
                          !this.isLoading && this.certInfo.commonName !== ''
                          ? `${this.certInfo.commonName}`
                          : '未绑定'
                        }
                      </div>
                    </FormItem>
                    <FormItem
                      label="多域名(DNS Names)"
                      className="cert-form-item"
                    >
                      {
                          !this.isLoading
                          && this.certInfo.dnsNames
                          && this.certInfo.dnsNames.length > 1
                          ? this.certInfo.dnsNames.slice().sort().map(domain => {
                            if (domain === this.certInfo.commonName) {
                              return
                            }
                            return (
                              <div className="qn-form-text" key={domain} >
                                {`${domain}`}
                              </div>
                            )
                          })
                          : '--'
                      }
                    </FormItem>
                    {
                        !this.isLoading
                        && isDVSSLType(this.certInfo.sslType)
                        && this.certInfo.commonName !== '' && this.certInfo.encrypt !== ''
                          ? (
                            <FormItem
                              label="加密算法"
                              className="cert-form-item"
                            >
                              {this.certInfo.encrypt === 'ECDSA' ? 'ECC' : this.certInfo.encrypt}
                            </FormItem>
                          )
                        : null
                    }
                  </LayoutBlock>
              }
              {
                  this.infoType === 'order' && !this.isLoading && this.completedInfo.company.name
                  ? <div>
                    <CompanyContactShow
                      company={this.completedInfo.company!}
                      delegate={this.completedInfo.delegate}
                    />
                  </div>
                  : null
              }
              {
                  this.infoType === SearchType.Cert && !this.isLoading && this.certInfo.enabled
                  ? <LayoutBlock title="操作">
                    <div className="op-content">
                      {
                      !this.certInfo.brand || !this.certInfo.sslType || !this.certInfo.orderid
                      ? (
                        <Button
                          key="download"
                          className="btn-href"
                          onClick={() => this.handleDownload()}
                          shape="round"
                          icon="download"
                        >
                          下载证书
                        </Button>
                      )
                      : (
                        <Button
                          key="download"
                          className="btn-href"
                          shape="round"
                          icon="download"
                          onClick={() => this.handleOperation('download')}
                        >
                          下载证书
                        </Button>
                      )
                      }
                    </div>
                  </LayoutBlock>
                  : (
                    (() => {
                      if (this.isLoading || this.infoType === SearchType.Cert || this.order && this.certInfo) {
                        return null
                      }
                      const operations = []
                      // 显示 补全 操作
                      if ([9].indexOf(this.order.state) !== -1 && !this.order.oneKeyFreeCert) {
                        if (this.order.orderType === 'renew') {
                          operations.push({ to: 'fixupRenew', icon: 'edit', text: '补全' })
                        } else {
                          operations.push({ to: 'fixup', icon: 'edit', text: '补全' })
                        }
                      }
                      // 显示 支付/关闭 操作
                      if (isStatusPaying(this.order.state)) {
                        operations.push({ to: 'pay', icon: 'pay-circle-o', text: '支付' })
                      }
                      // 非亚信、待确认状态，显示【上传确认函】
                      if (canUploadConfirmation({
                        state: this.order.state,
                        productShortName: this.order.productShortName,
                        uploadConfirmLetter: this.order.uploadConfirmLetter
                      })) {
                        operations.push({ to: 'confirmation', icon: 'cloud-upload-o', text: '上传确认函' })
                      }
                      // 已签发/已重颁发 过期前90天的非重颁发订单，显示【续费】
                      if (
                        this.certInfo
                        && canRenew(this.order.renewable)
                      ) {
                        operations.push({ to: 'renewal', icon: 'shopping-cart', text: '续费' })
                      }
                      // 已签发/已重颁发 非重颁发 未过期的多域名、多域名泛域名订单，显示【添加域名】
                      if (
                        this.certInfo
                        && canAddDomain({
                          // now: this.now,
                          state: this.order.state,
                          orderType: this.order.orderType,
                          productType: this.orderBaseInfo.domainType.name,
                          notAfter: this.certInfo.notAfter
                        })
                      ) {
                        operations.push({ to: 'addDomain', icon: 'plus-square-o', text: '添加域名' })
                      }

                      if (operations.length === 0) {
                        return null
                      }

                      const list = operations.map((operation, index) => (
                        <Button
                          key={index}
                          className="btn-href"
                          shape="round"
                          icon={operation.icon}
                          onClick={() => this.handleOperation(operation.to)}
                        >
                          { operation.text }
                        </Button>
                      ))
                      return (
                        <LayoutBlock title="操作">
                          <div className="op-content">
                            {list}
                          </div>
                        </LayoutBlock>
                      )
                    })()
                  )
              }
              {
                  this.infoType === 'order' && !this.isLoading && this.order.orderType !== 'replace'
                  ? <OrderHistory
                    orderid={this.itemid}
                    sslBrand={this.orderBaseInfo.sslBrand}
                    originDomains={this.completedInfo ? this.completedInfo.newDomains.dnsNames.slice() : []}
                    updateParentDnsNames={this.updateDnsNames}
                    updateParentCertID={this.updateCertID}
                  />
                  : null
              }
            </Form>
            {
              !isOEM && (
                <LayoutBlock
                  title={
                    <span>
                      部署 CDN
                      <ToolTip title="证书签发后将自动部署至下列已预约的 CDN 域名"><Icon className="tip-icon" type="info-circle" /></ToolTip>
                    </span>
                  }
                  style={{ borderBottom: 'none' }}
                >
                  <AppointmentForDisplay
                    certId={this.certId}
                    orderId={this.orderId}
                    dnsNames={this.dnsNamesAndCommonName as string[]}
                    completeType={CompleteType.First}
                  />
                </LayoutBlock>
              )
            }
          </div>
          <Modal
            title="证书下载"
            visible={this.downloadLightbox.visible}
            onCancel={this.toggleDownloadLightbox}
            footer={null}
            width="50%"
          >
            <div className="lightbox-form-wrap">
              <DownloadCertForm
                {...this.downloadLightbox.config}
              />
            </div>
          </Modal>
        </div>
      </PageWithBreadcrumb>
    )
  }
}

export default observer(function _SSLInformation(props: ISSLInformationProps) {
  const sslApis = useInjection(SslApis)
  const sslClient = useInjection(SslClient)
  const routerStore = useInjection(RouterStore)
  const toasterStore = useInjection(ToasterStore)
  return (
    <SSLInformation
      {...props}
      sslApis={sslApis}
      routerStore={routerStore}
      sslClient={sslClient}
      toasterStore={toasterStore}
    />
  )
})
