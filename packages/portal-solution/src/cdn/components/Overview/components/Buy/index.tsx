/**
 * @file 流量包
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { Link } from 'portal-base/common/router'

import AbilityConfig from 'cdn/constants/ability-config'

import Card from '../Card'
import BuySvg from '../../images/buy.svg'

import './style.less'

export default observer(function Buy() {
  const abilityConfig = useInjection(AbilityConfig)

  const extra = (
    <a className="extra-link" rel="noopener" href="https://qmall.qiniu.com/template/NTI">
      <BuySvg className="extra-svg" />
      <span className="extra-label">购买流量包</span>
    </a>
  )

  return (
    <Card className="comp-overview-buy" title="流量包" extra={extra}>
      <div className="buy-info">
        点击 <Link to="/financial/respack-mgr/all">查看详情</Link>，选择 {abilityConfig.productName} 相关计费项查询详细信息
      </div>
    </Card>
  )
})
