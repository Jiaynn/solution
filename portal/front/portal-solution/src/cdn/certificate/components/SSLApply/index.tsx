/*
 * @file component SSLApply
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import React from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import Button from 'react-icecream/lib/button'
import Radio from 'react-icecream/lib/radio'
import Form from 'react-icecream/lib/form'
import Modal from 'react-icecream/lib/modal'
import Rate from 'react-icecream/lib/rate'
import Alert from 'react-icecream/lib/alert'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'

import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import {
  sslBrand, sslType, humanizeSSLDomainType, humanizeDomainType,
  sslMap, SSLDomainType, ProductShortName, CertDomainItem, DomainType
} from '../../constants/ssl'
import SslApis from '../../apis/ssl'
import { payForOrder } from '../../utils/base'
import { getCertYearTipsByYear, shortNameToInfo } from '../../utils/certificate'
import HelpLink from '../common/HelpLink'
import { formatMoney } from '../../transforms/money'
import CertificatePeriod from './CertificatePeriod'

import InputNumber from '../InputNumber'
import PageWithBreadcrumbAndFooter from '../Layout/PageWithBreadcrumbAndFooter'
import ApplyState from '../../stores/apply-state'
import { basename } from '../../constants/app'
import SSLTypeTips from '../common/SSLTypeTips'
import PreSaleDeclare from '../common/PreSaleDeclare'
import SSLYearTips from '../common/SSLYearTips'

import './style.less'

const RadioGroup = Radio.Group
const FormItem = Form.Item

export interface SSLApplyProps {
  shortName: ProductShortName,
  years?: number
  limit?: number
  wildcardLimit?: number
  certid?: string
  orderid?: string
  renew?: boolean
}

type SSLApplyInnerProps = SSLApplyProps & {
  routerStore: RouterStore
  sslApis: SslApis
  toasterStore: ToasterStore
}

export function getSSLDomainTypeFromParam(limit: number, wildcardLimit: number): SSLDomainType | null {
  if (limit == null && wildcardLimit == null) {
    return null
  }
  if (wildcardLimit == null) {
    if (limit === 1) {
      return SSLDomainType.Single
    }
    if (limit > 1) {
      return SSLDomainType.Multiple
    }
  } else {
    if (limit == null) {
      return SSLDomainType.Wildcard
    }
    return SSLDomainType.MultipleWildcard
  }
  return null
}

export function getCertDomainItemFromSSLDomainType(
  shortName: ProductShortName,
  productType: SSLDomainType
): CertDomainItem | null {
  if (!shortName || !productType) {
    return null
  }
  const { brand, certType } = shortNameToInfo(shortName)
  if (!brand || !certType) {
    return null
  }
  const certTypeItem = sslMap[brand][certType]!
  const domainTypeMap = certTypeItem.domain
  if (productType === SSLDomainType.SingleWildcard) {
    return domainTypeMap[SSLDomainType.Wildcard]!
  }
  return domainTypeMap[productType]!
}

export function isValidApplyProps(params: Partial<SSLApplyProps>) {
  if (!params.shortName || params.limit! < 0 || params.wildcardLimit! < 0) {
    return false
  }
  const { brand, certType } = shortNameToInfo(params.shortName)
  if (!brand || !certType) {
    return false
  }
  const certTypeItem = sslMap[brand][certType]!
  const domainTypeMap = certTypeItem.domain
  const yearsList = certTypeItem.years
  if (params.years != null) {
    if (!yearsList.find(years => years === params.years)) {
      return false
    }
  }
  const sslDomainType = getSSLDomainTypeFromParam(params.limit!, params.wildcardLimit!)
  if (!sslDomainType || !domainTypeMap) {
    return false
  }
  const { min, max, normal, wildcard } = domainTypeMap[sslDomainType]!
  if (sslDomainType === SSLDomainType.MultipleWildcard) {
    const totalCert = params.limit! + params.wildcardLimit!
    if (min! > totalCert || max! < totalCert) {
      return false
    }
  }
  if (params.limit != null && normal != null) {
    if (
      (normal.min != null && normal.min > params.limit)
      || (normal.max != null && normal.max < params.limit)
    ) {
      return false
    }
  }
  if (params.wildcardLimit != null && wildcard != null) {
    if (
      (wildcard.min != null && wildcard.min > params.wildcardLimit)
      || (wildcard.max != null && wildcard.max < params.wildcardLimit)
    ) {
      return false
    }
  }
  return true
}

@observer
export class SSLApply extends React.Component<SSLApplyInnerProps> {
  constructor(props: SSLApplyInnerProps) {
    super(props)

    makeObservable(this)
    ToasterStore.bindTo(this, props.toasterStore)
    this.applyState.handleBrandChange = this.applyState.handleBrandChange.bind(this)
    this.applyState.handleBrandTypeChange = this.applyState.handleBrandTypeChange.bind(this)
    this.applyState.handleYearChange = this.applyState.handleYearChange.bind(this)
    this.applyState.handleDomainTypeChange = this.applyState.handleDomainTypeChange.bind(this)
    this.applyState.handleUp = this.applyState.handleUp.bind(this)
    this.applyState.handleDown = this.applyState.handleDown.bind(this)
    this.applyState.setDefaultCert(props)
    this.updateRenew(props.renew)

    this.toggleLightbox = this.toggleLightbox.bind(this)
    this.handlePay = this.handlePay.bind(this)
  }

  @observable applyState = new ApplyState(this.props.sslApis)
  @observable renew: boolean | undefined = false
  loadings = new Loadings('submit')
  @computed get isSubmitting() {
    return this.loadings.isLoading('submit')
  }

  @observable lightbox = {
    visible: false
  }

  @action toggleLightbox() {
    this.lightbox.visible = !this.lightbox.visible
  }

  @action updateRenew(renew?: boolean) {
    this.renew = renew
  }

  @ToasterStore.handle()
  @action handlePay() {
    const prepareInfo = this.applyState.currentValues
    const notWildcardDomain = (
      prepareInfo.domainType.name === SSLDomainType.Single
      || prepareInfo.domainType.name === SSLDomainType.Multiple
    )
    const wildcard_limit = (
      notWildcardDomain
      ? prepareInfo.domainType.wildcard - 1
      : prepareInfo.domainType.wildcard
    )
    const { routerStore, sslApis } = this.props

    const orderRequest = this.renew
      ? sslApis.renewOrder({
        orderid: this.applyState.orderid,
        certid: this.applyState.certid,
        name: '',
        product_short_name: this.applyState.getProduceShortName(),
        years: prepareInfo.year,
        limit: prepareInfo.domainType.normal - 1,
        wildcard_limit,
        product_type: prepareInfo.domainType.name
      })
      : sslApis.prepareOrder({
        product_short_name: this.applyState.getProduceShortName(),
        years: prepareInfo.year,
        limit: prepareInfo.domainType.normal - 1,
        wildcard_limit,
        product_type: prepareInfo.domainType.name
      })

    const result = orderRequest.then(res => {
      if (res.trade_order_id) {
        payForOrder({ orderId: res.order_id, tradeOrderId: res.trade_order_id }, routerStore)
      } else {
        routerStore.push(`${basename}/apply/result/${res.order_id}/success`)
      }
    })

    return this.loadings.promise('submit', result)
  }

  renderPrice(price: string): string {
    return !Number.isNaN(parseInt(price, 10))
      ? formatMoney(parseInt(price, 10), undefined, 100, undefined)
      : price
  }

  getSSLTip(domainType: SSLDomainType): string | undefined {
    const currentSslBrand = this.applyState.currentValues.sslBrand
    const currentSslType = this.applyState.currentValues.sslType
    const sslInfo = sslMap[currentSslBrand][currentSslType]!
    const domainInfo = sslInfo.domain[domainType]!
    switch (domainType) {
      case SSLDomainType.Single:
        return '仅支持一个标准域名'
      case SSLDomainType.Multiple: {
        const mmax = domainInfo.normal!.max
        return `支持多个标准域名。域名总数量不超过${mmax}个`
      }
      case SSLDomainType.Wildcard:
        return '仅支持一个泛域名'
      case SSLDomainType.MultipleWildcard: {
        const totalMax = domainInfo.max
        return `支持多个标准域名和通配符域名，标准域名至少两个。域名总数量不超过${totalMax}个`
      }
      default:
    }
  }

  render() {
    const leftAlignFormItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 }
    }
    const lightboxLeftAlignFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }

    const noticeForDv = (
      this.applyState.currentValues.sslBrand === 'TrustAsia'
      ? (
        <p style={{ color: '#e55c5c', lineHeight: '18px' }}>
          部分 DV 证书（包含免费证书）如因 CA 审核失败无法签发，建议更换 OV/EV 证书。
        </p>
)
      : null
    )

    const productTip = <HelpLink href="https://developer.qiniu.com/ssl">产品文档</HelpLink>
    const { sslType: currentSSLType, sslBrand: currentSSLBrand } = this.applyState.currentValues

    return (
      <PageWithBreadcrumbAndFooter sideItems={productTip}
        footer={
          <div className="apply-footer-submit-wrapper">
            <div>
              费用：
              <span className="price price-actual">
                {this.renderPrice(this.applyState.price.actual)}
              </span>
              <span className="price price-origin">
                {
                  this.renderPrice(this.applyState.price.origin)
                }
              </span>
              {
            this.applyState.price.isOnSale
            ? <span className="price price-sale">
              {
                this.renderPrice(this.applyState.price.salePrice)
              }
            </span>
            : null
              }
              {
            this.applyState.price.isOnSale
            ? <Alert
              message="限时特惠1个月，全场9折，购买2年及以上更享折上折！"
              type="error"
              closable={false}
            />
            : null
              }
            </div>
            <Button type="primary" onClick={this.toggleLightbox}>核对信息并支付</Button>
          </div>
        }
      >
        <div className="comp-cert-apply">
          <div className="apply-content-wrapper">
            <Form layout="horizontal" colon={false} {...leftAlignFormItemLayout}>
              <FormItem
                label="证书品牌"
              >
                <RadioGroup
                  className="brand-group"
                  onChange={this.applyState.handleBrandChange}
                  value={this.applyState.currentValues.sslBrand}
                >
                  {
                    sslBrand.map(brand => (
                      <Radio key={brand} className="ant-radio-border adv-radio radio-horizontal" value={brand}>
                        <span className="radio-info">
                          <span className={`radio-icon brand-${brand}`}></span>
                          <span className="radio-text">{ brand }</span>
                          {
                                brand === 'TrustAsia'
                                ? <span className="radio-tip">限免</span>
                                : null
                          }
                        </span>
                      </Radio>
                    ))
                  }
                </RadioGroup>
                { noticeForDv }
              </FormItem>
              <FormItem
                label="证书种类"
              >
                <RadioGroup
                  onChange={this.applyState.handleBrandTypeChange}
                  value={this.applyState.currentValues.sslType}
                >
                  {
                    this.applyState.sslTypes.map(sslid => {
                      const tip = sslMap[this.applyState.currentValues.sslBrand][sslid]!.tip
                      return (
                        <Radio.Button key={sslid} className="ant-radio-border adv-radio radio-vertical" value={sslid}>
                          {tip && <div className="cert-info-tip">{tip}</div> }
                          <span className="radio-info">
                            <span className="radio-text">{ sslType[sslid].code }</span>
                          </span>
                          <div className="radio-remark">{ sslType[sslid].text }</div>
                          <Rate
                            disabled
                            allowHalf
                            value={sslMap[this.applyState.currentValues.sslBrand][sslid]!.star}
                          />
                        </Radio.Button>
                      )
                    })
                  }
                </RadioGroup>
                <SSLTypeTips sslType={currentSSLType} sslBrand={currentSSLBrand} />
              </FormItem>
              <FormItem
                label="证书年限"
              >
                <CertificatePeriod
                  shortName={this.applyState.getProduceShortName()}
                  value={this.applyState.currentValues.year}
                  onChange={this.applyState.handleYearChange}
                  years={this.applyState.years}
                  discounts={this.applyState.discounts}
                />
                <SSLYearTips year={this.applyState.currentValues.year} />
              </FormItem>
              <FormItem
                label="证书域名类型"
              >
                <RadioGroup
                  size="small"
                  value={this.applyState.currentValues.domainType.name}
                  onChange={this.applyState.handleDomainTypeChange}
                >
                  {
                    Object.keys(this.applyState.domainTypes!).map((type: SSLDomainType) => (
                      <Radio key={type} className="ant-radio-border adv-radio radio-horizontal" value={type}>
                        <span className="radio-info">
                          <span className="radio-text">{ humanizeSSLDomainType(type) }<Tooltip title={this.getSSLTip(type as SSLDomainType)}><Icon className="domain-type-tip" type="question-circle" /></Tooltip></span>
                        </span>
                      </Radio>
                    ))
                  }
                </RadioGroup>
                {
                    this.applyState.currentValues.domainType.name === SSLDomainType.MultipleWildcard
                      ? Object.keys(this.applyState.currentValues.domainType.limit).map((typename: 'min' | 'max' | DomainType.Normal | DomainType.Wildcard) => {
                        if (typename !== 'min' && typename !== 'max') {
                          return (
                            <div key={typename} className="domain-number">
                              <div>{`${humanizeDomainType(typename)}数量`}</div>
                              <InputNumber
                                type={typename}
                                value={this.applyState.currentValues.domainType[typename]}
                                handleUp={this.applyState.handleUp}
                                handleDown={this.applyState.handleDown}
                                handleChange={this.applyState.handleChange}
                                handleBlur={this.applyState.handleBlur}
                                canChange={this.applyState.canInputNumberChange}
                              />
                            </div>
                          )
                        }
                        return null
                      })
                      : Object.keys(this.applyState.currentValues.domainType.limit).map((typename: 'min' | 'max' | DomainType.Normal | DomainType.Wildcard) => {
                        if (typename !== 'min' && typename !== 'max') {
                          return (
                            <div key={typename} className="domain-number">
                              <div>{`${humanizeDomainType(typename)}数量`}</div>
                              <InputNumber
                                type={typename}
                                value={this.applyState.currentValues.domainType[typename]}
                                handleUp={this.applyState.handleUp}
                                handleDown={this.applyState.handleDown}
                                handleChange={this.applyState.handleChange}
                                handleBlur={this.applyState.handleBlur}
                                canChange={this.applyState.canInputNumberChange}
                              />
                            </div>
                          )
                        }
                        return null
                      })
                }
                <div className="explain-text"><i>*名词解释：</i>“标准域名”例如：www.qiniu.com; qiniu.com; abc.qiniu.com；&quot;泛域名&quot;例如：*.qiniu.com; *.abc.qiniu.com</div>
              </FormItem>
              <FormItem label=" ">
                <PreSaleDeclare />
              </FormItem>
            </Form>
          </div>
          <Modal
            title="核对信息"
            visible={this.lightbox.visible}
            onCancel={this.toggleLightbox}
            footer={null}
            width="420px"
          >
            <div className="lightbox-form-wrap">
              <Form layout="horizontal" {...lightboxLeftAlignFormItemLayout}>
                <FormItem
                  label="产品名称"
                >
                  <span className="qn-form-text" >证书</span>
                </FormItem>
                <FormItem
                  label="品牌"
                >
                  <span className="qn-form-text" >{this.applyState.currentValues.sslBrand}</span>
                </FormItem>
                <FormItem
                  label="证书型号"
                >
                  <span className="qn-form-text" >
                    {
                      // eslint-disable-next-line max-len
                      `${sslType[this.applyState.currentValues.sslType].text}(${sslType[this.applyState.currentValues.sslType].code})`
                    }
                  </span>
                </FormItem>
                <FormItem
                  label="标准域名"
                  className={this.applyState.currentValues.domainType.normal === 0 ? 'hidden' : undefined}
                >
                  <span className="qn-form-text" >{`${this.applyState.currentValues.domainType.normal}个`}</span>
                </FormItem>
                <FormItem
                  label="泛域名"
                  className={this.applyState.currentValues.domainType.wildcard === 0 ? 'hidden' : undefined}
                >
                  <span className="qn-form-text" >{`${this.applyState.currentValues.domainType.wildcard}个`}</span>
                </FormItem>
                <FormItem
                  label="购买时长"
                >
                  <span className="qn-form-text">
                    {`${this.applyState.currentValues.year}年`}
                    {getCertYearTipsByYear(this.applyState.currentValues.year)}
                  </span>
                </FormItem>
                <FormItem
                  label="付费方式"
                >
                  <span className="qn-form-text" >预付费</span>
                </FormItem>
                <FormItem
                  label="总计费用"
                >
                  <span className="price">
                    {
                      this.renderPrice(this.applyState.price.actual)
                    }
                  </span>
                  {
                    this.applyState.price.origin !== this.applyState.price.actual
                    && Number.isNaN(parseInt(this.applyState.price.origin, 10)) === false
                    && Number.isNaN(parseInt(this.applyState.price.actual, 10)) === false
                      ? (
                        <span className="discount">
                          <span>已优惠
                            {
                              (() => {
                                const disc = parseInt(this.applyState.price.origin, 10)
                                  - parseInt(this.applyState.price.actual, 10)
                                return formatMoney(disc, undefined, 100, undefined)
                              })()
                            }
                          </span>
                        </span>
                      )
                      : null
                  }
                </FormItem>
              </Form>
              <div className="footer-right">
                <Button key="back" type="ghost" onClick={this.toggleLightbox}>返回修改</Button>
                <Button key="submit" type="primary" disabled={this.isSubmitting} onClick={this.handlePay}>确认支付</Button>
              </div>
            </div>
          </Modal>
        </div>
      </PageWithBreadcrumbAndFooter>
    )
  }
}

export default observer(function _SSLApply(props: SSLApplyProps) {
  const sslApis = useInjection(SslApis)
  const routerStore = useInjection(RouterStore)
  const toasterStore = useInjection(ToasterStore)
  return <SSLApply {...props} sslApis={sslApis} routerStore={routerStore} toasterStore={toasterStore} />
})
