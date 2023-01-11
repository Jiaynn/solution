/**
 * @file SSL 证书
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import { Link } from 'portal-base/common/router'

import AbilityConfig from 'cdn/constants/ability-config'

import Card from '../Card'
import SimplifyCard from '../SimplifyCard'
import BuySvg from '../../images/buy.svg'

import LocalStore from './store'

import './style.less'

export default observer(function Certificate() {
  const store = useLocalStore(LocalStore)
  const { productName } = useInjection(AbilityConfig)

  const { certStat } = store
  const data = [
    { count: certStat && certStat.used, desc: `已部署 ${productName} 证书` },
    { count: certStat && certStat.renewable, desc: '即将过期证书', renewable: certStat && certStat.renewable > 0 }
  ]

  const extra = (
    <Link className="extra-link" to="/certificate/apply">
      <BuySvg className="extra-svg" />
      <span className="extra-label">购买证书</span>
    </Link>
  )

  return (
    <Card className="comp-overview-certificate" title="SSL 证书" extra={extra}>
      <SimplifyCard loading={store.isLoading} style={{ height: 62, marginTop: 24 }}>
        <div className="card-row">
          {data.map((it, index) => (
            <div className="card-item" key={index}>
              <div className="item-count">{it.count == null ? '--' : it.count}</div>
              {it.renewable && <Link to="/certificate/ssl#cert" className="renew-link">续费</Link>}
              <div className="item-desc">{it.desc}</div>
            </div>
          ))}
        </div>
      </SimplifyCard>
    </Card>
  )
})
