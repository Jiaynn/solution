/*
 * @file component SSLApplyResult
 * @author Yao Jingtian <yncst233@gmail.com>
 */

import React from 'react'
import { observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react'

import Button from 'react-icecream/lib/button'
import Icon from 'react-icecream/lib/icon'

import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'
import { ToasterStore } from 'portal-base/common/toaster'

import { sslType as SSLType, isTrustAsia } from '../../constants/ssl'
import SslApis, { IOrderDetail } from '../../apis/ssl'

import PageWithBreadcrumb from '../Layout/PageWithBreadcrumb'
import { basename } from '../../constants/app'
import { shortNameToInfo } from '../../utils/certificate'

import './style.less'

type SSLApplyResultProps = {
  type: string
  orderid: string
}

type SSLApplyResultInnerProps = SSLApplyResultProps & {
  routerStore: RouterStore
  sslApis: SslApis
  toasterStore: ToasterStore
}

@observer
export class SSLApplyResult extends React.Component<SSLApplyResultInnerProps> {
  constructor(props: SSLApplyResultInnerProps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, props.toasterStore)
    this.fetchOrderInfo = this.fetchOrderInfo.bind(this)
    this.setOrderInfo = this.setOrderInfo.bind(this)
    this.gotoComplete = this.gotoComplete.bind(this)
    this.gotoParentOrder = this.gotoParentOrder.bind(this)
    this.gotoOrder = this.gotoOrder.bind(this)
    this.resultType = this.props.type
  }

  @observable certName = ''
  @observable resultType
  @observable orderParentId = ''
  @observable isTrustAsia = false

  @action setOrderInfo(data: IOrderDetail) {
    if (!data.state) {
      return
    }
    if (data.state === 8 || data.state === 12) {
      this.resultType = 'warn'
    } else if (data.orderType === 'renew') {
      this.resultType = 'renewed'
    } else if (data.orderType === 'replace') {
      this.resultType = 'replaced'
    } else {
      this.resultType = 'success'
    }
    if (data.orderParentId) {
      this.orderParentId = data.orderParentId
    }
    this.isTrustAsia = isTrustAsia(data.product_short_name)

    const { brand, certType } = shortNameToInfo(data.product_short_name)

    this.certName = `${brand} ${SSLType[certType].text}(${SSLType[certType].code})`
  }

  @ToasterStore.handle()
  @action fetchOrderInfo() {
    return this.props.sslApis.fetchOrderPrepareInfo(this.props.orderid).then(res => {
      this.setOrderInfo(res)
    })
  }

  gotoCheck() {
    this.props.routerStore.push('/financial/orders')
  }
  gotoComplete() {
    if (this.resultType === 'success') {
      this.props.routerStore.push(`${basename}/complete/first/${this.props.orderid}`)
    } else if (this.resultType === 'renewed') {
      this.props.routerStore.push(`${basename}/complete/renew/${this.props.orderid}`)
    }
  }
  gotoParentOrder() {
    this.props.routerStore.push(`${basename}/ssl/detail/${this.orderParentId}/order`)
  }
  gotoOrder() {
    this.props.routerStore.push(`${basename}/ssl/detail/${this.props.orderid}/order`)
  }

  componentDidMount() {
    this.fetchOrderInfo()
  }

  render() {
    return (
      <PageWithBreadcrumb>
        <div className="comp-cert-apply">
          <div className="apply-content-wrapper">
            <hr className="split-line" />
            {
              this.resultType !== 'query'
              ? <div>
                <div className={`result-info ${this.resultType}-info`}>
                  <div className="result-icon">
                    {
                    this.resultType === 'warn'
                    ? <Icon type="exclamation-circle" />
                    : <Icon type="check-circle" />
                    }
                  </div>
                  <div className={`${this.resultType}-text`}>
                    {
                    this.resultType === 'warn'
                      ? <span>您须先完成未支付账单，否则无法完成此订单</span>
                      : (
                        this.resultType === 'success' || this.resultType === 'renewed'
                          ? <span>{`恭喜您，购买的${this.certName}证书已支付成功`}</span>
                          : (
                            this.resultType === 'replaced'
                            ? <span>恭喜您，添加域名已完成支付，请等待后续审核确认后即可签发新证书</span>
                            : null
                          )
                      )
                    }
                  </div>
                  {
                    this.resultType === 'success'
                      ? <div className="more-info">为了您可以快速通过审核，请尽快补全信息</div>
                      : (
                        this.resultType === 'renewed'
                        ? <div className="more-info">为了您可以快速通过审核，请尽快确认补全信息</div>
                        : null
                      )
                  }
                </div>
                <div className="button-wrap">
                  {
                    this.resultType === 'warn'
                    ? <Button type="primary" onClick={this.gotoCheck}>查看账单</Button>
                    : (
                      this.resultType === 'replaced'
                      ? <Button type="primary" onClick={this.gotoParentOrder}>查看订单</Button>
                      : <Button type="primary" onClick={this.gotoComplete}>补全信息</Button>
                    )
                  }
                  {
                    this.isTrustAsia && this.resultType !== 'replaced' && <Button type="primary" onClick={this.gotoOrder}>查看订单</Button>
                  }
                </div>
              </div>
              : <div className={`result-info ${this.resultType}-info`}>支付结果查询中...</div>
            }

          </div>
        </div>
      </PageWithBreadcrumb>
    )
  }
}

export default observer(function _SSLApplyResult(props: SSLApplyResultProps) {
  const sslApis = useInjection(SslApis)
  const routerStore = useInjection(RouterStore)
  const toasterStore = useInjection(ToasterStore)
  return <SSLApplyResult {...props} sslApis={sslApis} routerStore={routerStore} toasterStore={toasterStore} />
})
