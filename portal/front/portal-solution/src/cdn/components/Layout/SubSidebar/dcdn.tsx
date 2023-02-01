/**
 * @file component Dcdn SubSidebar
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import SubSidebar, { LinkItem, Group } from 'portal-base/common/components/SubSidebar'
import { IamDisabled, Iamed } from 'portal-base/user/iam'
import { nameMap, Product } from 'portal-base/common/product'

import IamInfo from 'cdn/constants/iam-info'
import { dcdnBasename } from 'cdn/constants/route'

export default observer(function Sidebar() {
  const iamInfo = useInjection(IamInfo)
  const iamActions = iamInfo.mustDcdnIamActions()

  return (
    <SubSidebar title={nameMap[Product.Dcdn]} className="sub-sidebar-wrapper">
      <Iamed actions={[iamActions.Dashboard]}>
        <LinkItem relative={false} to={`${dcdnBasename}/overview`}>概览</LinkItem>
      </Iamed>
      <Iamed actions={[iamActions.CreateDomain, iamActions.GetDomainList]}>
        <LinkItem relative={false} to={`${dcdnBasename}/domain`}>域名管理</LinkItem>
      </Iamed>
      <Iamed actions={[iamActions.Refresh, iamActions.Prefetch]}>
        <LinkItem relative={false} to={`${dcdnBasename}/refresh-prefetch`}>刷新预取</LinkItem>
      </Iamed>
      <Group title="统计分析" path={`${dcdnBasename}/statistics`}>
        <Iamed actions={[
          iamActions.GetDomainList,
          iamActions.GetBandwidthAndFlux
        ]}
        >
          <LinkItem relative to="/usage">用量统计</LinkItem>
        </Iamed>
        <Iamed actions={[
          iamActions.GetDomainList,
          iamActions.GetISPReqCount,
          iamActions.GetReqCount,
          iamActions.GetTop,
          iamActions.GetStateCode,
          iamActions.GetUV
        ]}
        >
          <LinkItem relative to="/log">日志分析</LinkItem>
        </Iamed>
      </Group>
      <Iamed actions={[iamActions.DownloadCDNLog]}>
        <LinkItem relative={false} to={`${dcdnBasename}/log`}>日志下载</LinkItem>
      </Iamed>
      <IamDisabled>
        <LinkItem relative={false} to={`${dcdnBasename}/alarm`}>告警配置</LinkItem>
      </IamDisabled>
    </SubSidebar>
  )
})
