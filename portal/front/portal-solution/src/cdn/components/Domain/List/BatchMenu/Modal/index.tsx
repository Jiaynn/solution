/**
 * @file 批量操作的确认弹窗
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import cns from 'classnames'
import { UnknownException } from 'qn-fe-core/exception'
import Modal from 'react-icecream/lib/modal'
import Icon from 'react-icecream/lib/icon'
import { I18nStore } from 'portal-base/common/i18n'

import {
  shouldForbidDisable, shouldForbidEnable, shouldForbidRemove,
  shouldForbidUnfreeze
} from 'cdn/transforms/domain'

import { OperationType, batchOperationTypes, batchOperationTypeTextMap } from 'cdn/constants/domain'

import { IDomain } from 'cdn/apis/domain'

import * as messages from '../messages'

import './style.less'

export interface IProps {
  i18n: I18nStore
  type: OperationType
  domains: IDomain[]
  onSubmit: (operableDomains: IDomain[]) => Promise<void>
}

export default function openConfirmModal(props: IProps) {
  const { type, domains, onSubmit, i18n } = props
  const t = i18n.t
  const operationText = t(batchOperationTypeTextMap[type as typeof batchOperationTypes[number]])

  let shouldForbidFn: (domain: IDomain) => string | undefined

  switch (type) {
    case OperationType.OnlineDomain:
      shouldForbidFn = shouldForbidEnable
      break
    case OperationType.OfflineDomain:
      shouldForbidFn = shouldForbidDisable
      break
    case OperationType.UnfreezeDomain:
      shouldForbidFn = shouldForbidUnfreeze
      break
    case OperationType.DeleteDomain:
      shouldForbidFn = shouldForbidRemove
      break
    default:
      throw new UnknownException(t(messages.checkOperationType))
  }

  const operableDomains = domains.filter(domain => !shouldForbidFn(domain))
  const total = domains.length
  const operableCount = operableDomains.length
  const iconClassName = cns({ 'error-icon': type === OperationType.DeleteDomain })

  if (!operableCount) {
    Modal.warning({
      title: t(messages.confirmOperation, operationText),
      content: t(messages.notAllowOperation, operationText),
      className: 'comp-domain-batch-modal',
      icon: <Icon type="exclamation-circle" className={iconClassName} />,
      okButtonProps: {
        type: 'primary'
      }
    })
    return
  }

  const modalContent = total === operableCount
    ? t(messages.confirmTotalOperation, operationText, total)
    : t(messages.partialNotAllowOperation, operationText, total, operableCount)

  Modal.confirm({
    title: t(messages.confirmOperation, operationText),
    content: modalContent,
    className: 'comp-domain-batch-modal',
    icon: <Icon type="exclamation-circle" className={iconClassName} />,
    onOk: () => onSubmit(operableDomains),
    okButtonProps: {
      type: 'primary'
    }
  })
}
