/**
 * @file component Oem SubSidebar
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import SubSidebar, { LinkItem, Group } from 'portal-base/common/components/SubSidebar'
import { UserInfoStore } from 'portal-base/user/account'
import { useTranslation } from 'portal-base/common/i18n'

import { pages as pageMessages } from 'cdn/locales/messages'

import { oemConfig } from 'cdn/constants/env'
import { oemBasename } from 'cdn/constants/route'

export default observer(function Sidebar() {
  const userInfoStore = useInjection(UserInfoStore)
  const t = useTranslation()

  return (
    <SubSidebar className="sub-sidebar-wrapper">
      <LinkItem relative={false} to={`${oemBasename}/overview`}>{t(pageMessages.overview)}</LinkItem>
      <LinkItem relative={false} to={`${oemBasename}/domain`}>{t(pageMessages.domainManage)}</LinkItem>
      <LinkItem relative={false} to={`${oemBasename}/refresh-prefetch`}>{t(pageMessages.refreshPrefetch)}</LinkItem>
      <Group title={t(pageMessages.statistics)} path={`${oemBasename}/statistics`}>
        <LinkItem relative to="/usage">{t(pageMessages.usageStats)}</LinkItem>
        <LinkItem relative to="/log">{t(pageMessages.analysis)}</LinkItem>
      </Group>
      <LinkItem relative={false} to={`${oemBasename}/log`}>{t(pageMessages.logDownload)}</LinkItem>
      <LinkItem relative={false} to={`${oemBasename}/certificate`}>{t(pageMessages.certificateManage)}</LinkItem>
      {oemConfig.financial && (
        <LinkItem relative={false} to={`${oemBasename}/financial`}>{t(pageMessages.financial)}</LinkItem>
      )}
      {/* 当前只有 OEM 环境下的父账号能使用域名托管功能 */}
      {
        userInfoStore.parent_uid === 0 && oemConfig.domainHosting && (
          <LinkItem relative={false} to={`${oemBasename}/domain-hosting`}>{t(pageMessages.domainHosting)}</LinkItem>
        )
      }
    </SubSidebar>
  )
})
