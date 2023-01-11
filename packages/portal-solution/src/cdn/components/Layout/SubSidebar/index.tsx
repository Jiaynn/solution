/**
 * @file component SubSidebar
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import SubSidebar, { LinkItem, Group } from 'portal-base/common/components/SubSidebar'
import { IamDisabled, Iamed } from 'portal-base/user/iam'
import { Featured } from 'portal-base/user/feature-config'
import { nameMap, Product } from 'portal-base/common/product'

import IamInfo from 'cdn/constants/iam-info'
import { cdnBasename } from 'cdn/constants/route'

export default observer(function Sidebar() {
  const iamInfo = useInjection(IamInfo)
  const iamActions = iamInfo.mustCdnIamActions()

  return (
    <SubSidebar title={nameMap[Product.Cdn]} className="sub-sidebar-wrapper">
      <Iamed actions={[iamActions.Dashboard]}>
        <LinkItem relative={false} to={`${cdnBasename}/overview`}>概览</LinkItem>
      </Iamed>
      <Iamed actions={[iamActions.CreateDomain, iamActions.GetDomainList]}>
        <LinkItem relative={false} to={`${cdnBasename}/domain`}>域名管理</LinkItem>
      </Iamed>
      <IamDisabled>
        <Featured feature="FUSION.FUSION_CONTENT_OPTIMIZATION">
          <LinkItem relative={false} to={`${cdnBasename}/content-optimization`}>内容优化</LinkItem>
        </Featured>
      </IamDisabled>
      <Iamed actions={[iamActions.Refresh, iamActions.Prefetch]}>
        <LinkItem relative={false} to={`${cdnBasename}/refresh-prefetch`}>刷新预取</LinkItem>
      </Iamed>
      <Group title="统计分析" path={`${cdnBasename}/statistics`}>
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
          iamActions.GetHitRate,
          iamActions.GetUV
        ]}
        >
          <LinkItem relative to="/log">日志分析</LinkItem>
        </Iamed>
      </Group>
      <Iamed actions={[iamActions.DownloadCDNLog]}>
        <LinkItem relative={false} to={`${cdnBasename}/log`}>日志下载</LinkItem>
      </Iamed>
      <IamDisabled>
        <LinkItem relative={false} to={`${cdnBasename}/notice`}>通知管理</LinkItem>
        <Featured feature="FUSION.FUSION_APM">
          <LinkItem relative={false} to={`${cdnBasename}/apm`}>质量魔镜</LinkItem>
        </Featured>
        <Featured feature="FUSION.FUSION_QAS">
          <LinkItem relative={false} to={`${cdnBasename}/qas`}>质量保障服务</LinkItem>
        </Featured>
        <LinkItem relative={false} to={`${cdnBasename}/alarm`}>告警配置</LinkItem>
        <LinkItem relative={false} to={`${cdnBasename}/contact`}>告警联系人</LinkItem>
      </IamDisabled>
    </SubSidebar>
  )
})
