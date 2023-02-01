/**
 * @file ColumnRenderers for CertContent
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'

import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import Button from 'react-icecream/lib/button'
import { Link } from 'portal-base/common/router'
import { useTranslation } from 'portal-base/common/i18n'

import { IOrderInfo, OrderType, ICertInfo } from '../../apis/ssl'
import { isStatusDone, isStatusPaying } from '../../utils/certificate/status'
import {
  canRenew, canAddDomain, shortNameToInfo, canUploadConfirmation,
  canClose, canCertDeploy, canOrderDeploy, isPrivateCert
} from '../../utils/certificate'
import {
  OrderStatus, orderStatusTextMap, orderStatusNameMap,
  CertStatus, SSLDomainType, ProductShortName
} from '../../constants/ssl'
import OrderStatusTooltip from '../common/OrderStatusTooltip'

export interface IOperationInfo {
  operation: OperationName
  id: string
  orderid?: string
  tradeid?: string
  productShortName?: ProductShortName
  isPaid?: boolean
  productType?: SSLDomainType
}

export enum OperationName {
  Renewal = 'renewal',
  AddDomain = 'addDomain',
  Fixup = 'fixup',
  FixupRenew = 'fixupRenew',
  Download = 'download',
  OrderDownloadCert = 'orderDownloadCert',
  Confirmation = 'confirmation',
  Detail = 'detail',
  CertDetail = 'certDetail',
  Rename = 'rename',
  Pay = 'pay',
  Close = 'close',
  Delete = 'delete',
  Deploy = 'deploy'
}

export interface IOrderStatusRenderProps {
  record: IOrderInfo
  // now: number
}

const StatusTextRenderer = observer(function _StatusTextRenderer(props: IOrderStatusRenderProps) {
  const { record } = props
  const { state } = record
  const now = Date.now()

  if (canRenew(record.renewable)) {
    return (
      <span>
        <span className="status-done">已签发{state === OrderStatus.Reissued && '(重颁发)'}</span>
        <span className="status-paying"> (待续费)</span>
      </span>
    )
  }

  if (isStatusDone(state) && record.not_after > 0 && now > record.not_after * 1000) {
    return (
      <span>
        <span className="status-done">已签发</span>
        <span className="status-outdate"> (已过期)</span>
      </span>
    )
  }

  if (state === OrderStatus.Closed) {
    return <span className="status-closed">{record.isPaid ? '已退费' : '已关闭'}</span>
  }

  return <span className={`status-${orderStatusNameMap[state]}`}>{orderStatusTextMap[state]}</span>
})

const StatusTooltipRenderer = observer(function _StatusTooltipRenderer(props: Pick<IOrderStatusRenderProps, 'record'>) {
  const { state, reject_reason, product_short_name, upload_confirm_letter } = props.record
  const info = shortNameToInfo(product_short_name)

  return (
    <OrderStatusTooltip
      state={state}
      certType={info.certType}
      confirmLetterUploaded={upload_confirm_letter}
      rejectReason={reject_reason}
    />
  )
})

// 订单状态列
export const StatusRenderer = observer(function _StatusRenderer(props: IOrderStatusRenderProps) {
  return (
    <div>
      <StatusTextRenderer {...props} />
      <StatusTooltipRenderer record={props.record} />
    </div>
  )
})

export interface IOrderOperationsRenderProps {
  record: IOrderInfo
  // now: number
  doOperation(info: IOperationInfo): void
}

// 订单操作列
export const OrderOperationsRenderer = observer(function _OrderOperationsRenderer(props: IOrderOperationsRenderProps) {
  const { record, doOperation } = props
  const operations = []

  // 显示 补全 操作
  if ([OrderStatus.Paid].indexOf(record.state) !== -1 && !record.oneKeyFreeCert) {
    if (record.orderType === OrderType.Renew) {
      operations.push({ to: OperationName.FixupRenew, text: '补全' })
    } else {
      operations.push({ to: OperationName.Fixup, text: '补全' })
    }
  }

  // 显示 支付/关闭 操作
  if (isStatusPaying(record.state)) {
    operations.push({ to: OperationName.Pay, text: '支付' })
  }

  // 非亚信DV、待确认状态，显示【上传确认函】
  if (canUploadConfirmation({
    state: record.state,
    productShortName: record.product_short_name,
    uploadConfirmLetter: record.upload_confirm_letter
  })) {
    operations.push({ to: OperationName.Confirmation, text: '上传确认函' })
  }

  if (canRenew(record.renewable)) {
    operations.push({ to: OperationName.Renewal, text: '续费' })
  }

  // 已签发/已重颁发 未过期的多域名、多域名泛域名订单，显示【添加域名】
  if (canAddDomain({
    state: record.state,
    orderType: record.orderType,
    productType: record.product_type,
    notAfter: record.not_after
  })) {
    operations.push({ to: OperationName.AddDomain, text: '添加域名' })
  }

  if (canOrderDeploy(record.not_after, record.state)) {
    operations.push({ to: OperationName.Deploy, text: '部署 CDN' })
  }

  operations.push({ to: OperationName.Detail, text: '详情' })

  // 关闭订单 / 申请退款
  if (canClose(record.state) && !record.oneKeyFreeCert) {
    operations.push({
      to: OperationName.Close,
      text: record.isPaid ? '申请退款' : '关闭订单'
    })
  }

  // 已签发证书提供下载功能
  if (isStatusDone(record.state)) {
    operations.push({
      text: '下载',
      to: OperationName.OrderDownloadCert,
      productShortName: record.product_short_name
    })
  }

  const list = operations.map(operation => (
    <Button
      type="link"
      key={`${record.orderid}.${operation.to}`}
      className={`btn-href ${operation.to}`}
      onClick={() => doOperation({
        id: record.orderid,
        operation: operation.to,
        tradeid: record.trade_order_id,
        isPaid: record.isPaid
      })}
    >
      {operation.text}
    </Button>
  ))
  return (
    <span>
      {list}
    </span>
  )
})

export interface ICertOperationRendererProps {
  record: ICertInfo
  rowid: number
  doOperation(info: IOperationInfo): void
}

function getRenewalTip(record: ICertInfo) {
  const childOrderUrl = `/certificate/ssl/detail/${record.child_order_id}/order`
  let title = null
  switch (record.state) {
    case CertStatus.ReNewing:
      title = <span>证书续费中，已生成 <Link to={childOrderUrl} target="_blank" rel="noopener">新订单</Link></span>
      break
    case CertStatus.ReNewed:
      title = <span>已续费，<Link to={childOrderUrl} target="_blank" rel="noopener">新订单</Link> 已申请成功</span>
      break
    default:
      title = `您的自有证书类型为 ${record.cert_type || '自有'} 证书，七牛为您智能推荐相似证书，续费后可一键部署至 CDN。`
  }
  return (
    <Tooltip
      placement="topLeft"
      overlayClassName="tooltip"
      arrowPointAtCenter
      title={title}
    >
      <Icon type="info-circle" className="renewal-icon" />
    </Tooltip>
  )
}

const operationMessages = {
  download: {
    cn: '下载',
    en: 'Download'
  },
  detail: {
    cn: '详情',
    en: 'Detail'
  },
  rename: {
    cn: '重命名',
    en: 'Rename'
  },
  delete: {
    cn: '删除',
    en: 'Delete'
  },
  renew: {
    cn: '续费',
    en: 'Renew'
  },
  deploy: {
    cn: '部署 CDN',
    en: 'Deploy'
  }
}

// 证书操作列
export const CertOperationsRenderer = observer(function _CertOperationsRenderer(props: ICertOperationRendererProps) {
  const { record, doOperation } = props
  const t = useTranslation()

  const renewalButton = (
    <>
      <Button
        type="link"
        disabled={record.state !== CertStatus.None}
        className={`btn-href ${OperationName.Renewal}`}
        onClick={() => doOperation({
          id: record.certid,
          productShortName: record.product_short_name,
          productType: record.product_type,
          operation: OperationName.Renewal
        })}
      >
        {t(operationMessages.renew)}
      </Button>
      {isPrivateCert(record.product_short_name) && getRenewalTip(record)}
    </>
  )

  const deployButton = (
    <Button
      type="link"
      className={`btn-href ${OperationName.Deploy}`}
      onClick={() => doOperation({ id: record.certid, operation: OperationName.Deploy })}
    >{t(operationMessages.deploy)}</Button>
  )

  const detailButton = (
    <Button
      type="link"
      className={`btn-href ${OperationName.CertDetail}`}
      onClick={() => doOperation({ id: record.certid, operation: OperationName.CertDetail })}
    >{t(operationMessages.detail)}</Button>
  )

  const renameButton = (
    <Button
      type="link"
      className={`btn-href ${OperationName.Rename}`}
      onClick={() => doOperation({ id: record.certid, operation: OperationName.Rename })}
    >{t(operationMessages.rename)}</Button>
  )

  const userCertDownload = (
    <Button type="link" className={`btn-href ${OperationName.Download}`}>
      <a href={`/api/certificate/v1/ssl/${record.certid}/download`} target="_blank" rel="noopener">{t(operationMessages.download)}</a>
    </Button>
  )

  const orderCertDownload = (
    <Button
      type="link"
      className={`btn-href ${OperationName.Download}`}
      onClick={() => doOperation({
        operation: OperationName.Download,
        id: record.orderid
      })}
    >{t(operationMessages.download)}</Button>
  )

  const deleteButton = (
    <Button
      type="link"
      className={`btn-href ${OperationName.Delete}`}
      onClick={() => doOperation({ id: record.certid, operation: OperationName.Delete })}
    >{t(operationMessages.delete)}</Button>
  )

  return (
    <span>
      {(!record.product_short_name || !record.orderid) ? userCertDownload : orderCertDownload}
      {canRenew(record.renewable) && renewalButton}
      {canCertDeploy(record.not_after) && deployButton}
      {detailButton}
      {renameButton}
      {deleteButton}
    </span>
  )
})
