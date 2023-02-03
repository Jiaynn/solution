/**
 * @file description OrderHistory for SSLInformation
 * @author [Yao Jingtian] [yncst233@gmail.com]
 */

import React from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { without, sortBy, last } from 'lodash'

import { useInjection } from 'qn-fe-core/di'
import Table from 'react-icecream/lib/table'
import Collapse from 'react-icecream/lib/collapse'
import Button from 'react-icecream/lib/button'
import Modal from 'react-icecream/lib/modal'

import { RouterStore } from 'portal-base/common/router'
import { ToasterStore } from 'portal-base/common/toaster'
import { Loadings } from 'portal-base/common/loading'
import { CommonApiException } from 'portal-base/common/apis/common'

import { orderStatusTextMap, orderStatusNameMap, OrderStatus } from '../../constants/ssl'
import SslApis, { IHistoryOrder, IOrderAuth } from '../../apis/ssl'
import { getLatestDnsNames, canClose } from '../../utils/certificate'
import { isStatusPaying } from '../../utils/certificate/status'
import { payForOrder, humanizeTime } from '../../utils/base'
import { basename } from '../../constants/app'
import { AuthMethodType, DnsRecordType, dnsRecordTypeTextMap } from '../../constants/domain'
import { humanizeAuthKey } from '../../transforms/domain'
import AuthValueItem from '../common/AuthValueItem'

const Column = Table.Column
const Panel = Collapse.Panel

export enum OperationType {
  CertDetail = 'certDetail',
  Pay = 'pay',
  Close = 'close',
  Auth = 'auth'
}

interface IOperationInfo {
  operation: OperationType,
  id: string,
  tradeid: string,
  auth?: {
    authMethod: AuthMethodType
    authArray: IOrderAuth[]
    recordType?: DnsRecordType
  }
  isPaid?: boolean
}

export interface IOrderHistoryProps {
  orderid: string,
  originDomains: string[],
  sslBrand: string,
  updateParentDnsNames: (data: string[]) => any
  updateParentCertID: (data: string) => any,
  orders?: any[]
}

type OrderHistoryInnerProps = IOrderHistoryProps & {
  routerStore: RouterStore
  sslApis: SslApis
  toasterStore: ToasterStore
}

@observer
export class OrderHistory extends React.Component<OrderHistoryInnerProps> {
  constructor(props: OrderHistoryInnerProps) {
    super(props)
    makeObservable(this)
    ToasterStore.bindTo(this, props.toasterStore)
    this.fetchOrderHistory = this.fetchOrderHistory.bind(this)
    this.updateReplaceOrders = this.updateReplaceOrders.bind(this)
    this.handleOperation = this.handleOperation.bind(this)
    this.handleCloseOrder = this.handleCloseOrder.bind(this)
    this.closeOrder = this.closeOrder.bind(this)
    this.getAddonDomains = this.getAddonDomains.bind(this)
  }

  loadings = new Loadings('load')
  @computed get isLoading() {
    return this.loadings.isLoading('load')
  }

  @observable orders = this.props.orders || []

  @action updateReplaceOrders(data: IHistoryOrder[]) {
    if (!data) {
      this.orders = []
      return
    }
    this.orders = sortBy(data, 'create_time')
    if (this.orders.length > 0) {
      const latestDnsNames = getLatestDnsNames(this.orders, this.props.originDomains)
      this.props.updateParentDnsNames(latestDnsNames)
      const successOrders = this.orders.filter(order => order.certID && order.certID !== '')
      if (successOrders.length === 0) {
        return
      }
      const lastestCertID = last(successOrders).certID
      this.props.updateParentCertID(lastestCertID)
    }
  }

  @ToasterStore.handle()
  fetchOrderHistory() {
    const result = this.props.sslApis.fetchReplaceOrders(this.props.orderid).then(
      list => this.updateReplaceOrders(list)
    )
    return this.loadings.promise('load', result)
  }

  @ToasterStore.handle('订单关闭成功！')
  closeOrder(orderId: string) {
    return this.props.sslApis.closeSSLOrder(orderId).catch(
      error => {
        if (error instanceof CommonApiException && error.code === 400609) {
          throw error.withMessage('重颁发订单确认中，暂不可关闭')
        }
        return Promise.reject(error)
      }
    )
  }

  handleCloseOrder(orderId: string) {
    this.closeOrder(orderId).then(
      () => this.fetchOrderHistory()
    )
  }

  handleOperation(operationInfo: IOperationInfo) {
    const { routerStore } = this.props
    const operation = operationInfo.operation
    switch (operation) {
      case 'certDetail': {
        routerStore.push(`${basename}/ssl/detail/${operationInfo.id}/cert`)
        break
      }
      case 'pay': {
        payForOrder({ orderId: operationInfo.id, tradeOrderId: operationInfo.tradeid }, routerStore)
        break
      }
      case 'close': {
        const orderid = operationInfo.id
        const tip = (
          operationInfo.isPaid
          ? '申请退款后，该订单将被关闭，退款金额将返还至您的七牛账户，如仍需重颁发，请重新申请。确认要退款吗？'
          : '关闭订单后，如仍需重颁发，请重新申请。确认关闭订单吗？'
        )
        Modal.confirm({
          content: tip,
          onOk: () => this.handleCloseOrder(orderid)
        })
        break
      }
      case 'auth': {
        if (!operationInfo.auth || !operationInfo.auth.authArray) {
          Modal.warning({
            title: '暂无验证信息，请提交工单联系技术支持！'
          })
          return
        }

        const authMethod = operationInfo.auth.authMethod
        const recordType = operationInfo.auth.recordType || DnsRecordType.Txt

        // 这部分 forEach 的过程也可以考虑用 lodash.flatten + map 或者 lodash.flatMap 来做
        const dnsInfoList: React.ReactNode[] = []
        operationInfo.auth.authArray.forEach(({ AuthKey: authKey, AuthValue: authValue }) => dnsInfoList.push(
          <div key={authKey}>{humanizeAuthKey(authKey, authMethod, recordType)}</div>,
          <AuthValueItem key={authValue} authValue={authValue} authMethod={authMethod} recordType={recordType} />
        ))

        Modal.info({
          title: '验证信息',
          width: 740,
          content: (
            <div className="validate-info">
              <div>
                验证类型：{ authMethod === AuthMethodType.Dns ? `DNS(${dnsRecordTypeTextMap[recordType]})` : authMethod }
                {/* 这边使用 <a> 而不是 <Link> 是因为 Modal.info 不能为 content 提供 context */}
                <a href="https://developer.qiniu.com/ssl/manual/3667/ssl-certificate-of-free-dns-validation-guide" target="_blank" rel="noopener" style={{ marginLeft: '10px' }}>(配置指南)</a>
              </div>
              <div className="dns-info">
                { dnsInfoList }
              </div>
            </div>
          )
        })
        break
      }
      default:
    }
  }

  getAddonDomains(dnsnames: string, index: number) {
    const now = dnsnames ? dnsnames.split(',') : []
    if (index === 0) {
      const prevDomains = this.props.originDomains
      return prevDomains.length > 0 ? without(now, ...prevDomains) : now
    }
    const successPrevs = this.orders.slice(0, index).filter(
      order => order.state === 1
    )
    const prev = (
      successPrevs.length > 0
      ? last(successPrevs).dnsnames.split(',')
      : this.props.originDomains
    )
    return prev.length > 0 ? without(now, ...prev) : now
  }

  componentDidMount() {
    if (!this.props.orders) {
      this.fetchOrderHistory()
    }
  }

  render() {
    if (!this.orders || !this.orders.length) {
      return null
    }

    return (
      <Collapse defaultActiveKey={['1']}>
        <Panel header="添加域名记录" key="1">
          <Table key="orderTable"
            dataSource={this.orders.slice()}
            pagination={false}
            rowKey={(record: any) => record.orderid}
            loading={this.isLoading}
          >
            <Column
              title="#"
              dataIndex="orderid"
              key="orders.orderid"
              render={(_text, _record, index) => `${index + 1}`}
            />
            <Column
              title="修改时间"
              dataIndex="create_time"
              key="orders.create_time"
              render={create_time => humanizeTime(create_time)}
            />
            <Column
              title="添加域名"
              dataIndex="dnsnames"
              key="orders.dnsnames"
              render={(text, _record, index) => {
                const addon = this.getAddonDomains(text, index)
                if (addon.length === 0) {
                  return '未修改'
                }
                return (
                  <div>{ addon.map(domain => <div key={domain}>{domain}</div>) }</div>
                )
              }}
            />
            <Column<any>
              title="状态"
              dataIndex="state"
              key="orders.state"
              render={(state: OrderStatus, record) => {
                if (state === OrderStatus.Closed) {
                  return <span className="status-closed">{record.isPaid ? '已退费' : '已关闭'}</span>
                }
                return <span className={`status-${orderStatusNameMap[state]}`}>{orderStatusTextMap[state]}</span>
              }}
            />
            <Column<any>
              title="操作"
              key="orders.operations"
              render={(_text, record, _index) => {
                const operations = []
                // 显示 支付 操作
                if (isStatusPaying(record.state)) {
                  operations.push({ to: OperationType.Pay, text: '支付' })
                }

                // DV 证书、已付款，显示 验证信息
                if (this.props.sslBrand === 'TrustAsia' && !isStatusPaying(record.state)) {
                  operations.push({ to: OperationType.Auth, text: '验证信息' })
                }

                // 关闭订单 / 申请退款
                if (canClose(record.state)) {
                  operations.push({
                    to: OperationType.Close,
                    text: record.isPaid ? '申请退款' : '关闭订单',
                    isPaid: record.isPaid
                  })
                }

                const list = operations.map(operation => {
                  const operationInfo: IOperationInfo = {
                    id: record.orderid,
                    operation: operation.to,
                    tradeid: record.trade_order_id
                  }
                  if (operation.to === OperationType.Auth) {
                    operationInfo.auth = {
                      authMethod: record.auth_method,
                      authArray: record.auth_array,
                      recordType: record.record_type
                    }
                  }
                  return (
                    <a href="javascript:;" key={operation.to}>
                      <Button
                        key={`${record.orderid}.${operation.to}`}
                        type="link"
                        onClick={() => this.handleOperation(operationInfo)}
                      >
                        {operation.text}
                      </Button>
                    </a>
                  )
                })
                return (
                  <span>
                    {list}
                  </span>
                )
              }}
            />
          </Table>
        </Panel>
      </Collapse>
    )
  }
}

export default observer(function _OrderHistory(props: IOrderHistoryProps) {
  const sslApis = useInjection(SslApis)
  const routerStore = useInjection(RouterStore)
  const toasterStore = useInjection(ToasterStore)
  return <OrderHistory {...props} sslApis={sslApis} routerStore={routerStore} toasterStore={toasterStore} />
})
