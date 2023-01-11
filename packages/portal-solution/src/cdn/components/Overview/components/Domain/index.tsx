/**
 * @file 域名概览
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import { Link } from 'portal-base/common/router'
import { Iamed } from 'portal-base/user/iam'
import { UserInfoStore as UserInfo } from 'portal-base/user/account'

import { shouldForbidCreateDomain } from 'cdn/transforms/domain'

import Routes from 'cdn/constants/routes'
import IamInfo from 'cdn/constants/iam-info'

import Card from '../Card'
import SimplifyCard from '../SimplifyCard'
import AddSvg from '../../images/add.svg'

import LocalStore from './store'

export default observer(function Domain() {
  const store = useLocalStore(LocalStore)
  const routes = useInjection(Routes)
  const { iamActions } = useInjection(IamInfo)
  const userInfo = useInjection(UserInfo)

  const data = [
    { count: store.totalDomains, desc: '域名数量' },
    { count: store.hotDomains, desc: '活跃域名' }
  ]

  const extra = !shouldForbidCreateDomain(userInfo) && (
    <Iamed actions={[iamActions.CreateDomain]}>
      <Link className="extra-link" to={routes.domainCreate()}>
        <AddSvg className="extra-svg" />
        <span className="extra-label">添加域名</span>
      </Link>
    </Iamed>
  )

  return (
    <Card className="comp-overview-domain" title="域名详情" extra={extra}>
      <SimplifyCard loading={store.isLoading} style={{ height: 62, marginTop: 24 }}>
        <div className="card-row">
          {data.map((it, index) => (
            <div className="card-item" key={index}>
              <div className="item-count">{it.count == null ? '--' : it.count}</div>
              <div className="item-desc">{it.desc}</div>
            </div>
          ))}
        </div>
      </SimplifyCard>
    </Card>
  )
})
