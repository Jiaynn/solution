import React from 'react'

import { Link } from 'portal-base/common/router'

import { shouldForbidConfiguration } from 'cdn/transforms/domain'
import { getMessageForOperationFailure } from 'cdn/transforms/domain/messages'

import { OperatingState, DomainType } from 'cdn/constants/domain'

import DomainStateProcessingMessage from './DomainStateProcessingMessage'
import { useDomainDetailCtx } from './context'

export default function DomainStateMessage() {
  const { domainDetail } = useDomainDetailCtx()
  const { operationType, operatingState, operatingStateDesc } = domainDetail

  switch (operatingState) {
    case OperatingState.Failed:
      return (
        <p className="error-message">
          {getMessageForOperationFailure(operationType, operatingStateDesc)}
        </p>
      )
    case OperatingState.Processing: {
      return <DomainStateProcessingMessage />
    }
    case OperatingState.Frozen:
      return (
        <p className="warning-message">该域名已被冻结，如有疑问请创建工单联系我们</p>
      )
    case OperatingState.Offlined:
      return (
        <p className="warning-message">该域名已停用，不支持自助修改配置</p>
      )
    default:
      if (!shouldForbidConfiguration(domainDetail)) {
        return null
      }
      return domainDetail.type !== DomainType.Test
        ? <p className="warning-message">该域名暂时不支持自助修改配置，请创建工单联系我们进行人工修改</p>
        : <p className="warning-message">测试域名无法自助修改配置，建议<Link to="create">创建自定义域名</Link></p>
  }
}
