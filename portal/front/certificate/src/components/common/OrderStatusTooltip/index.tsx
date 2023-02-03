/**
 * @file component OrderStatusTooltip
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */
import React from 'react'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'

import { CertType, isDVSSLType, OrderStatus } from '../../../constants/ssl'

export interface IProps {
  state: OrderStatus
  certType: CertType
  rejectReason: string
  confirmLetterUploaded: boolean
}

function TipIcon({ tip }: { tip: string }) {
  return (
    <Tooltip
      placement="topLeft"
      overlayClassName="tooltip"
      arrowPointAtCenter
      title={tip}
    >
      <Icon type="info-circle" className="status-icon" />
    </Tooltip>
  )
}

export default function OrderStatusTooltip(props: IProps) {
  const { state, rejectReason, certType, confirmLetterUploaded } = props

  // 已拒绝，显示拒绝原因
  if (state === OrderStatus.NotApproved && rejectReason) {
    return <TipIcon tip={rejectReason} />
  }

  // DV 证书，待确认状态时，显示“域名所有权未验证”
  if (state === OrderStatus.Pending && isDVSSLType(certType)) {
    return <TipIcon tip="域名所有权未验证" />
  }

  if (state === OrderStatus.Reviewing) {
    return <TipIcon tip="等待 CA 机构审核后颁发证书" />
  }

  // 待确认状态时，若已上传确认函，则提示 域名未验证
  if (state === OrderStatus.Pending && confirmLetterUploaded) {
    let toolTipTitle = '已上传确认函'

    if ([CertType.OV, CertType.OVPro, CertType.OVWildcard, CertType.OVProWildcard].indexOf(certType) > -1) {
      toolTipTitle = '确认函已上传，请联系人保持通讯畅通等待信息审核，审核后需完成域名所有权验证，证书签发周期为 3-5 个工作日。'
    }

    if ([CertType.EV, CertType.EVPro].indexOf(certType) > -1) {
      toolTipTitle = '确认函已上传，请联系人保持通讯畅通等待信息审核，审核后需完成域名所有权验证，证书签发周期为 5-7 个工作日。'
    }

    return <TipIcon tip={toolTipTitle} />
  }

  return null
}
