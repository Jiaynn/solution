/**
 * @file 当域名状态为 processing 时，workflow 的操作状态提示及操作
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'

import { Link } from 'portal-base/common/router'
import Modal from 'react-icecream/lib/modal'
import { useInjection } from 'qn-fe-core/di'

import { getMessageForOperationProcessing } from 'cdn/transforms/domain/messages'

import { isQiniu } from 'cdn/constants/env'
import { WorkflowTaskType, WorkflowTaskErrorCode, OperationType } from 'cdn/constants/domain'

import HelpLink from 'cdn/components/common/HelpLink'

import DomainApis from 'cdn/apis/domain'

import { useDomainDetailCtx } from './context'

const ticketLink = <HelpLink href="https://support.qiniu.com/tickets/new/form?category=%E9%85%8D%E7%BD%AE%E9%97%AE%E9%A2%98&space=CDN">联系技术支持</HelpLink>

export default function DomainStateProcessingMessage() {
  const { refreshDomainDetail, domainDetail } = useDomainDetailCtx()
  const {
    name, operTaskId, operTaskType, operTaskErrCode,
    operationType, https, configProcessRatio
  } = domainDetail

  const domainApis = useInjection(DomainApis)

  const handleRedo = React.useCallback(() => {
    domainApis.redoTask(name, operTaskId!).then(() => {
      Modal.success({
        title: '重试成功！',
        content: '您提交的任务将继续执行，请稍后查看域名状态。',
        okText: '确定',
        onOk: refreshDomainDetail
      })
    }).catch(() => {
      Modal.error({
        title: '重试失败！',
        content: <div>可稍后再尝试，多次尝试后仍然失败，可 {ticketLink} 处理。</div>,
        okText: '确定'
      })
    })
  }, [domainApis, name, operTaskId, refreshDomainDetail])

  const handleAbandon = React.useCallback(() => {
    domainApis.abandonTask(name, operTaskId!).then(() => {
      Modal.success({
        title: '回滚成功！',
        content: '确定后可重新提交操作。',
        okText: '确定',
        onOk: refreshDomainDetail
      })
    }).catch(() => {
      Modal.error({
        title: '回滚失败！',
        content: <div>请重试或 {ticketLink} 处理。</div>,
        okText: '确定'
      })
    })
  }, [domainApis, name, operTaskId, refreshDomainDetail])

  const qpsLimitMessage = (
    <p className="warning-message">
      由于处理 QPS 限制，处理无法继续，您可以选择以下处理方案：<br />
      1. 点击 <a onClick={handleRedo}>重试</a> 尝试重新提交任务。<br />
      2. 如果失败，可稍后再尝试，多次尝试后仍然失败，可 {ticketLink} 处理。
    </p>
  )

  const freeCertLimitMessage = (
    <p className="warning-message" style={{ maxWidth: '100%' }}>
      由于同一主域名绑定的免费 DV 证书不能超过 20 个，目前额度已达上限，处理无法继续，您可以选择以下处理方案：<br />
      1. 点击 <a onClick={handleAbandon}>回滚</a>，成功后域名即恢复可操作状态。<br />
      2. 可 <Link to="/certificate/apply" target="_blank">购买 DV 通配符证书</Link>，或使用新的主域名后再绑定免费证书。<br />
      3. 配置好证书后，重新提交域名配置修改。
    </p>
  )

  if (isQiniu && operTaskType && operTaskId) {
    switch (operTaskErrCode) {
      case WorkflowTaskErrorCode.QpsLimit:
        if ([WorkflowTaskType.Redo, WorkflowTaskType.All].includes(operTaskType)) {
          return qpsLimitMessage
        }
        break
      case WorkflowTaskErrorCode.FreeCertLimit:
        if ([WorkflowTaskType.Abandon, WorkflowTaskType.All].includes(operTaskType)) {
          return freeCertLimitMessage
        }
        break
      default:
    }
  }

  // 处于申请免费证书流程中的判断逻辑是 https.freeCert 字段为 true，configProcessRatio 在 0 和 1 之间
  const freeCertProcessing = https.freeCert && configProcessRatio! > 0 && configProcessRatio! < 1
  const certFAQLink = operationType === OperationType.ModifyHttpsCert && (
    <a href="https://developer.qiniu.com/fusion/kb/3905/ssl-certificate-faq">
      &nbsp;常见证书问题
    </a>
  )

  return (
    <p className="warning-message">
      {getMessageForOperationProcessing(operationType, freeCertProcessing!)}
      {certFAQLink}
    </p>
  )
}
