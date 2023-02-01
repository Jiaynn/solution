/*
* @file component SSLApply
* @author Yao Jingtian <yncst233@gmail.com>
*/

import React from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import Button from 'react-icecream/lib/button'
import Radio, { RadioChangeEvent } from 'react-icecream/lib/radio'
import Form from 'react-icecream/lib/form'
import Modal from 'react-icecream/lib/modal'
import Rate from 'react-icecream/lib/rate'
import Alert from 'react-icecream/lib/alert'
import Spin from 'react-icecream/lib/spin'

import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'

import {
  sslBrand, sslType, humanizeSSLDomainType, humanizeDomainType,
  sslMap, SSLDomainType, DomainType, CertType
} from '../../constants/ssl'
import { standardDomainRegx, wildcardDomainRegx } from '../../constants/domain'
import SslApis, { IHistoryOrder } from '../../apis/ssl'
import { payForOrder } from '../../utils/base'
import { getCertYearTipsByYear, getLatestDnsNames } from '../../utils/certificate'
import { formatMoney } from '../../transforms/money'
import HelpLink from '../common/HelpLink'

import InputNumber from '../InputNumber'
import PageWithBreadcrumbAndFooter from '../Layout/PageWithBreadcrumbAndFooter'
import ApplyState from '../../stores/apply-state'
import { basename } from '../../constants/app'
import SSLTypeTips from '../common/SSLTypeTips'
import PreSaleDeclare from '../common/PreSaleDeclare'
import SSLYearTips from '../common/SSLYearTips'

import '../SSLApply/style.less'

const RadioGroup = Radio.Group
const FormItem = Form.Item

type SSLRenewalProps = {
  applyState?: ApplyState
  orderid: string
}

type SSLRenewalInnerProps = SSLRenewalProps & {
  routerStore: RouterStore
  sslApis: SslApis
  toasterStore: ToasterStore
}

@observer
export class SSLRenewal extends React.Component<SSLRenewalInnerProps> {
  constructor(props: SSLRenewalInnerProps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, props.toasterStore)
    this.applyState.handleBrandChange = this.applyState.handleBrandChange.bind(this)
    this.applyState.handleBrandTypeChange = this.applyState.handleBrandTypeChange.bind(this)
    this.applyState.handleYearChange = this.applyState.handleYearChange.bind(this)
    this.applyState.handleDomainTypeChange = this.applyState.handleDomainTypeChange.bind(this)
    this.applyState.handleUp = this.applyState.handleUp.bind(this)
    this.applyState.handleDown = this.applyState.handleDown.bind(this)
    this.toggleLightbox = this.toggleLightbox.bind(this)
    this.handlePay = this.handlePay.bind(this)
  }

  preOrderid = this.props.orderid

  @observable applyState: ApplyState = this.props.applyState || new ApplyState(this.props.sslApis)

  // 未加载数据前展示 loading 状态
  @observable hasInitialized = false

  loadings = new Loadings('load', 'submit')
  @computed get isSubmitting() {
    return this.loadings.isLoading('submit')
  }

  @computed get isLoading() {
    return !this.hasInitialized || this.loadings.isLoading('load')
  }

  @observable lightbox = {
    visible: false
  }

  @action toggleLightbox() {
    this.lightbox.visible = !this.lightbox.visible
  }

  @action updateLimit(data: IHistoryOrder[]) {
    const dnsNames = getLatestDnsNames(data)
    const dnsNormalNum = dnsNames.filter(domain => standardDomainRegx.test(domain)).length
    const dnsWildcardNum = dnsNames.filter(domain => wildcardDomainRegx.test(domain)).length
    const isCommonNameNormal = 1

    this.applyState.currentValues.domainType.normal = Math.max(
      this.applyState.currentValues.domainType.normal,
      dnsNormalNum + isCommonNameNormal
    )
    this.applyState.currentValues.domainType.wildcard = Math.max(
      this.applyState.currentValues.domainType.wildcard,
      dnsWildcardNum + (1 - isCommonNameNormal)
    )
  }

  @action fetchPreOrderData() {
    const { sslApis } = this.props

    const result = new Promise<void>(resolve => {
      sslApis.fetchOrderPrepareInfo(this.preOrderid).then(res => {
        this.updateHasInitialized()
        this.applyState.updateCurrentValues(res)
        // 更新最新的limit
        if ([SSLDomainType.Multiple, SSLDomainType.MultipleWildcard].indexOf(res.product_type) !== -1) {
          sslApis.fetchReplaceOrders(this.preOrderid).then(
            list => {
              this.updateLimit(list)
              this.applyState.initOptionsByCurrentValues()
              resolve()
            }
          )
        } else {
          this.applyState.initOptionsByCurrentValues()
          resolve()
        }
      })
    })
    return this.loadings.promise('load', result)
  }

  @ToasterStore.handle()
  @action handlePay() {
    const { routerStore, sslApis } = this.props
    const years = this.applyState.currentValues.year

    const result = sslApis.orderRenew({
      orderid: this.preOrderid,
      years
    }).then(res => {
      if (res.trade_order_id) {
        payForOrder({ orderId: res.order_id, tradeOrderId: res.trade_order_id }, routerStore)
      } else {
        routerStore.push(`${basename}/apply/result/${res.order_id}/success`)
      }
    })

    return this.loadings.promise('submit', result)
  }

  @action updateHasInitialized() {
    this.hasInitialized = true
  }

  componentDidMount() {
    if (!this.props.applyState) {
      this.fetchPreOrderData()
    } else {
      this.updateHasInitialized()
    }
  }

  renderPrice(price: string): string {
    return !Number.isNaN(parseInt(price, 10))
      ? formatMoney(parseInt(price, 10), undefined, 100, undefined)
      : price
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

    const productTip = <HelpLink href="https://developer.qiniu.com/ssl">产品文档</HelpLink>
    const { sslType: currentSSLType, sslBrand: currentSSLBrand } = this.applyState.currentValues

    return (
      <PageWithBreadcrumbAndFooter
        sideItems={productTip}
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
            <Spin spinning={this.isLoading}>
              {
              this.isLoading
              ? <div style={{ minHeight: '500px' }}></div>
              : <Form layout="horizontal" colon={false} {...leftAlignFormItemLayout}>
                <FormItem label="证书品牌">
                  <RadioGroup
                    className="brand-group"
                    value={this.applyState.currentValues.sslBrand}
                  >
                    {sslBrand.map(brand => (
                      <Radio
                        key={brand}
                        className="ant-radio-border adv-radio radio-horizontal"
                        value={brand}
                        disabled={this.applyState.currentValues.sslBrand !== brand}
                      >
                        <span className="radio-info">
                          <span className={`radio-icon brand-${brand}`}></span>
                          <span className="radio-text">{ brand }</span>
                          { brand === 'TrustAsia' && <span className="radio-tip">限免</span>}
                        </span>
                      </Radio>
                    ))}
                  </RadioGroup>
                </FormItem>
                <FormItem label="证书种类">
                  <RadioGroup value={this.applyState.currentValues.sslType}>
                    {
                      this.applyState.sslTypes.map(sslid => (
                        <Radio.Button
                          key={sslid}
                          className="ant-radio-border adv-radio radio-vertical"
                          value={sslid}
                          disabled={this.applyState.currentValues.sslType !== sslid}
                        >
                          {
                        sslid === CertType.DV
                        ? (
                          <span className="radio-info" style={{ textAlign: 'right' }}>
                            <span className="radio-text" style={{ marginRight: '5px' }}>{ sslType[sslid].code }</span>
                            <span className="radio-tip">限免</span>
                          </span>
                        )
                        : (
                          <span className="radio-info">
                            <span className="radio-text">{ sslType[sslid].code }</span>
                          </span>
                        )
                          }
                          <span className="radio-remark">{ sslType[sslid].text }</span>
                          <Rate
                            disabled
                            allowHalf
                            value={sslMap[this.applyState.currentValues.sslBrand][sslid]!.star}
                          />
                        </Radio.Button>
                      ))
                    }
                  </RadioGroup>
                  <SSLTypeTips sslType={currentSSLType} sslBrand={currentSSLBrand} />
                </FormItem>
                <FormItem label="证书年限">
                  <RadioGroup
                    size="small"
                    value={this.applyState.currentValues.year}
                    onChange={(e: RadioChangeEvent) => this.applyState.handleYearChange(e.target.value)}
                  >
                    {
                      this.applyState.years.map(year => (
                        <Radio key={year} className="ant-radio-border adv-radio radio-horizontal" value={year}>
                          <span className="radio-info">
                            <span className="radio-text">
                              {`${year}年`}
                              {getCertYearTipsByYear(year)}
                            </span>
                          </span>
                        </Radio>
                      ))
                    }
                  </RadioGroup>
                  <SSLYearTips year={this.applyState.currentValues.year} />
                </FormItem>
                <FormItem label="证书域名类型">
                  <RadioGroup
                    size="small"
                    value={this.applyState.currentValues.domainType.name}
                  >
                    {Object.keys(this.applyState.domainTypes!).map((type: SSLDomainType) => (
                      <Radio
                        key={type}
                        className="ant-radio-border adv-radio radio-horizontal"
                        value={type}
                        disabled={this.applyState.currentValues.domainType.name !== type}
                      >
                        <span className="radio-info">
                          <span className="radio-text">{ humanizeSSLDomainType(type) }</span>
                        </span>
                      </Radio>
                    ))}
                  </RadioGroup>
                  {
                  this.applyState.currentValues.domainType.name === SSLDomainType.MultipleWildcard
                  ? Object.keys(this.applyState.currentValues.domainType).map(typename => {
                    const values = this.applyState.currentValues
                    if (typename === DomainType.Normal || typename === DomainType.Wildcard) {
                      return (
                        <div key={typename} className="domain-number">
                          <div>{`${humanizeDomainType(typename)}数量`}</div>
                          <InputNumber
                            type={typename}
                            value={values.domainType[typename]}
                            handleUp={this.applyState.handleUp}
                            handleDown={this.applyState.handleDown}
                            handleChange={this.applyState.handleChange}
                            handleBlur={this.applyState.handleBlur}
                            canChange={this.applyState.canInputNumberChange}
                            disabled
                          />
                        </div>
                      )
                    }
                    return false
                  })
                  : Object.keys(this.applyState.currentValues.domainType).map(typename => {
                    const values = this.applyState.currentValues
                    if (typename === DomainType.Normal || typename === DomainType.Wildcard) {
                      return (
                        <div key={typename} className="domain-number">
                          <div>{`${humanizeDomainType(typename)}数量`}</div>
                          <InputNumber
                            type={typename}
                            value={values.domainType[typename]}
                            handleUp={this.applyState.handleUp}
                            handleDown={this.applyState.handleDown}
                            handleChange={this.applyState.handleChange}
                            handleBlur={this.applyState.handleBlur}
                            canChange={this.applyState.canInputNumberChange}
                            disabled
                          />
                        </div>
                      )
                    }
                    return false
                  })
                  }
                  <span>
                    {
                      (() => {
                        switch (this.applyState.currentValues.domainType.name) {
                          case SSLDomainType.Single:
                            return '仅支持 1 个标准域名'
                          case SSLDomainType.Multiple: {
                            const num = this.applyState.currentValues.domainType.normal
                            return `支持 ${num} 个标准域名。`
                          }
                          case SSLDomainType.Wildcard:
                            return '仅支持 1 个泛域名'
                          case SSLDomainType.MultipleWildcard: {
                            const normal = this.applyState.currentValues.domainType.normal
                            const wildcard = this.applyState.currentValues.domainType.wildcard
                            return `支持 ${normal} 个标准域名和 ${wildcard} 个通配符域名。`
                          }
                          default:
                        }
                      })()
                    }
                  </span>
                  <div className="explain-text"><i>*名词解释：</i>“标准域名”例如：www.qiniu.com; qiniu.com; abc.qiniu.com；&quot;泛域名&quot;例如：*.qiniu.com; *.abc.qiniu.com</div>
                </FormItem>
                <FormItem label=" ">
                  <PreSaleDeclare />
                </FormItem>
              </Form>
              }
            </Spin>
          </div>
          {
            !this.isLoading && (
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
                      <span className="qn-form-text" >{`${this.applyState.currentValues.year}年`}</span>
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
                        !Number.isNaN(parseInt(this.applyState.price.actual, 10))
                        ? formatMoney(parseInt(this.applyState.price.actual, 10), undefined, 100, undefined)
                        : this.applyState.price.actual
                        }
                      </span>
                      {
                        !Number.isNaN(parseInt(this.applyState.price.origin, 10))
                        && this.applyState.currentValues.year > 1
                        ? <span className="discount">
                          <span>已优惠
                            {
                              formatMoney(
                                parseInt(this.applyState.price.origin, 10) - parseInt(this.applyState.price.actual, 10),
                                undefined,
                                100,
                                undefined
                              )
                            }
                          </span>
                        </span>
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
            )
          }
        </div>
      </PageWithBreadcrumbAndFooter>
    )
  }
}

export default observer(function _SSLRenewal(props: SSLRenewalProps) {
  const sslApis = useInjection(SslApis)
  const routerStore = useInjection(RouterStore)
  const toasterStore = useInjection(ToasterStore)
  return <SSLRenewal {...props} sslApis={sslApis} routerStore={routerStore} toasterStore={toasterStore} />
})

