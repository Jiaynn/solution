/**
 * @file 本月流量 Top5 域名
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import Table, { ColumnProps } from 'react-icecream/lib/table'
import { Link } from 'portal-base/common/router'
import { useTranslation } from 'portal-base/common/i18n'

import { booleanPredicate } from 'cdn/utils'

import { humanizeTraffic, humanizeBandwidth, humanizeReqcount } from 'cdn/transforms/unit'

import AbilityConfig from 'cdn/constants/ability-config'

import Routes from 'cdn/constants/routes'

import * as messages from 'cdn/components/Overview/messages'

import Card from '../Card'
import LocalStore, { ITopDomain } from './store'

import './style.less'

const titleMessage = {
  cn: '本月域名流量 TOP 5',
  en: 'Top 5 domain traffic this month'
}

export default observer(function TopDomains() {
  const store = useLocalStore(LocalStore)
  const routes = useInjection(Routes)
  const abilityConfig = useInjection(AbilityConfig)
  const t = useTranslation()

  const columns: Array<ColumnProps<ITopDomain>> = [{
    title: t(messages.domain),
    dataIndex: 'name',
    render: function renderDomain(name: string) {
      return <Link to={routes.statisticsFlow(name)}>{name}</Link>
    }
  }, {
    title: t(messages.flow),
    dataIndex: 'flow',
    render: (val: number) => humanizeTraffic(val, 2)
  }, {
    title: t(messages.bandwidth),
    dataIndex: 'bandwidth',
    render: (val: number) => humanizeBandwidth(val, 2)
  }, !abilityConfig.hideDynTraffic && {
    title: t(messages.dynamicReqCount),
    dataIndex: 'reqcount',
    render: (val: number) => t(humanizeReqcount(val, 2))
  }].filter(booleanPredicate)

  return (
    <Card className="comp-overview-top-domains" title={t(titleMessage)}>
      <Table
        size="middle"
        loading={store.isLoading}
        rowKey="name"
        columns={columns}
        dataSource={store.topDomains}
        pagination={false}
      />
    </Card>
  )
})
