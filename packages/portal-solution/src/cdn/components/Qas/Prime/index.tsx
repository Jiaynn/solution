/**
 * @file QAS Prime 等级说明组件
 * @author linchen <linchen@qiniu.com>
 */

import React from 'react'
import classnames from 'classnames'
import { observer } from 'mobx-react'
import moment from 'moment'

import Button from 'react-icecream/lib/button'

import { getFirstDayOfNextMonth } from 'cdn/transforms/datetime'

import {
  primeLevelTextMap,
  PrimeStatus,
  primeStatusTextMap,
  primeStatusButtonTextMap
} from 'cdn/constants/qas'

import {
  IPrimeItem,
  IQasPrimeStatus
} from 'cdn/apis/qas'

interface IPrimeItemProps {
  item: IPrimeItem
  status: IQasPrimeStatus
  onClick: (item: IQasPrimeStatus) => void
}

function calcPrimeStatusText(state: PrimeStatus) {
  const expireText = (
    state === PrimeStatus.Toon || state === PrimeStatus.Tooff
    ? `${getFirstDayOfNextMonth(moment())}起生效`
    : ''
  )

  return `${primeStatusTextMap[state]} ${expireText}`
}

export default observer((props: IPrimeItemProps) => {
  const { item, status, onClick } = props
  const getButtonDesc = (state: PrimeStatus) => (
    state === PrimeStatus.Original
    ? `${item.price} 倍单价开启`
    : primeStatusButtonTextMap[state]
  )

  if (!status) {
    return null
  }

  return (
    <div className="prime-item">
      <div className="prime-item-level">
        <span className="prime-item-level-title">
          {primeLevelTextMap[item.level]}
        </span>
        <span className={classnames('prime-item-level-status', {
          'prime-item-level-status-unused': status.state === PrimeStatus.Original
        })}
        >
          {calcPrimeStatusText(status.state)}
        </span>
      </div>
      <div className="prime-item-text">
        可用性保障
      </div>
      <p className="prime-item-sla">
        {item.sla}<span>%</span>
      </p>
      <p className="prime-item-desc">
        <span>{item.ratio} 倍</span>
        不可用时间赔偿
      </p>
      <Button className="prime-item-open" onClick={() => onClick(status)}>
        {getButtonDesc(status.state)}
      </Button>
    </div>
  )
})
