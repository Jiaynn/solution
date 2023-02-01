/**
 * @file Domain State Component
 * @author linchen <gakilcin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import Icon from 'react-icecream/lib/icon'
import Tooltip from 'react-icecream/lib/tooltip'
import { useTranslation } from 'portal-base/common/i18n'

import { humanizeOperationTypeMessage, humanizeOperatingState, isNotIcpFrozen } from 'cdn/transforms/domain'

import { OperatingState, FreezeType, OperationType } from 'cdn/constants/domain'

import * as messages from './messages'

import './style.less'

export interface IProps {
  state: OperatingState
  operationType: OperationType
  freezeType?: FreezeType
}

export default observer(function DomainState(props: IProps) {
  const extra = (
    shouldShowToolTip(props.state, props.freezeType) && (
      <Tooltip title={<DomainStateTip {...props} />} overlayStyle={{ fontSize: '12px' }}>
        <Icon type="question-circle" style={{ color: '#999', marginLeft: '8px' }} />
      </Tooltip>
    )
  )

  const t = useTranslation()

  return (
    <div className="comp-domain-state">
      <span className={`state-dot state-dot-${props.state}`}></span>
      {t(humanizeOperatingState(props.state, props.freezeType))}
      {extra}
    </div>
  )
})

function DomainStateTip({ state, operationType, freezeType }: IProps) {
  const t = useTranslation()

  switch (state) {
    case OperatingState.Processing: {
      return <>{t(messages.operationProcessing, t(humanizeOperationTypeMessage(operationType)))}</>
    }
    case OperatingState.Frozen: {
      return freezeType === FreezeType.NotIcp
        ? <NotIcpFrozenTipMessage />
        : null
    }
    default: {
      return null
    }
  }
}

export function NotIcpFrozenTipMessage() {
  const t = useTranslation()

  return (
    <span>
      {t(messages.notIcpFrozen)}
    </span>
  )
}

function shouldShowToolTip(state: OperatingState, freezeType?: FreezeType) {
  return state === OperatingState.Processing || isNotIcpFrozen(state, freezeType)
}
