/**
 * @file 个人中心页面
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React, { useCallback } from 'react'
import { observer } from 'mobx-react'
import Menu from 'react-icecream/lib/menu'
import { RouterStore, Route, Redirect, Switch } from 'portal-base/common/router'
import { UserInfoStore, Security } from 'portal-base/user/account'
import NotFound from 'portal-base/common/components/NotFound'
import Page from 'portal-base/common/components/Page'
import { useInjection } from 'qn-fe-core/di'
import { useTranslation } from 'portal-base/common/i18n'

import Routes from 'cdn/constants/routes'

import Profile from './Profile'
import SubAccount from './SubAccount'

import './style.less'

const messages = {
  profile: {
    cn: '基本信息',
    en: 'Personal information'
  },
  security: {
    cn: '安全设置',
    en: 'Security'
  },
  subAccount: {
    cn: '子账户管理',
    en: 'User management'
  }
}

export default observer(function User() {
  const routerStore = useInjection(RouterStore)
  const userInfoStore = useInjection(UserInfoStore)
  const { basename } = useInjection(Routes)
  const t = useTranslation()

  const handleSelect = useCallback((e: { key: string }) => {
    routerStore.push(e.key)
  }, [routerStore])

  return (
    <Page className="comp-user" hasSpace={false}>
      <Menu mode="horizontal" selectedKeys={[routerStore.location!.pathname]} onSelect={handleSelect}>
        <Menu.Item key={`${basename}/user/profile`}>{t(messages.profile)}</Menu.Item>
        {
          !userInfoStore.isOem && <Menu.Item key={`${basename}/user/sub-account`}>{t(messages.subAccount)}</Menu.Item>
        }
        <Menu.Item key={`${basename}/user/security`}>{t(messages.security)}</Menu.Item>
      </Menu>
      <Switch placeholder={<NotFound />}>
        <Route relative exact path="/"><Redirect relative to="/profile" /></Route>
        <Route relative exact path="/profile">
          <Profile />
        </Route>
        <Route relative exact path="/sub-account">
          {!userInfoStore.isOem && <SubAccount />}
        </Route>
        <Route relative exact path="/security">
          <Security className="comp-user-security" />
        </Route>
      </Switch>
    </Page>
  )
})
