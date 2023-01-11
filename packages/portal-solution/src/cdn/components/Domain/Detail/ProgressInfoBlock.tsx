
import React from 'react'
import moment from 'moment'

import Progress from 'react-icecream/lib/progress'
import Button from 'react-icecream/lib/button'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import Row from 'react-icecream/lib/row'

import { getProgressStatus } from 'cdn/transforms/domain'

import { freeCertAvgProcessTime, OperatingState, hurryUpWaitingTime } from 'cdn/constants/domain'

import { IDomainDetail } from 'cdn/apis/domain'

interface IProgressInfoBlock {
  domain: IDomainDetail
  hurryUp: () => void
}

export default function ProgressInfoBlock({ domain, hurryUp }: IProgressInfoBlock) {
  const { https, configProcessRatio, hurryUpFreecert, operatingState, httpsOPTime } = domain
  if (operatingState !== OperatingState.Processing && operatingState !== OperatingState.Failed) {
    return null
  }
  const shouldMoreDetail = https && https.freeCert
  // 处理中 状态为 active， 失败 为 exception
  const processState = operatingState === OperatingState.Processing ? 'active' : 'exception'
  // 正常流程 40 分钟后，或者处理状态为失败时，才允许催单
  const canHurryUp = moment(httpsOPTime).add(hurryUpWaitingTime, 'minutes').isBefore(moment())
                      || operatingState !== OperatingState.Processing

  const action = hurryUpFreecert
    ? <Button type="ghost" disabled>已催单</Button>
    : <Button type="ghost" disabled={!canHurryUp} onClick={hurryUp}>催单</Button>

  const actionTip = hurryUpFreecert
    ? (
      <Tooltip title="催单已发送。">
        <Icon type="exclamation-circle" className="icon-tip" />
      </Tooltip>
)
    : !canHurryUp && (
      <Tooltip title="正常配置中暂不可催单，请耐心等待。">
        <Icon type="exclamation-circle" className="icon-tip" />
      </Tooltip>
    )

  const timeAndAction = shouldMoreDetail && (
    <>
      {
        operatingState === OperatingState.Processing
        && <span className="domain-process-time">预计 {Math.round(freeCertAvgProcessTime * (1 - configProcessRatio!))} 分钟后配置完成</span>
      }
      {action}{actionTip}
    </>
  )

  const status = shouldMoreDetail && (
    <Row>
      <span className="domain-process-title">配置状态：</span>
      {getProgressStatus(configProcessRatio!, operatingState)}
    </Row>
  )

  return (
    <div className="comp-domain-process">
      <Row>
        <span className="domain-process-title">配置进度：</span>
        <Progress className="domain-process-bar" percent={configProcessRatio! * 100} status={processState} showInfo={false} />
        {timeAndAction}
      </Row>
      {status}
    </div>
  )
}
