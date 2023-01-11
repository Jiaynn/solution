/**
 * @file component OemApp
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { Inject } from 'qn-fe-core/di'
import NotFound from 'portal-base/common/components/NotFound'
import { RouterStore, Route, Switch, Redirect } from 'portal-base/common/router'
import { I18nStore } from 'portal-base/common/i18n'

import Certificate from 'cdn/certificate/components/App/oem'

import { decodeName } from 'cdn/transforms/domain/url'

import { pages as pageMessages } from 'cdn/locales/messages'

import IamInfo from 'cdn/constants/iam-info'
import { oemBasename } from 'cdn/constants/route'

import Layout from 'cdn/components/Layout/oem'
import Overview from 'cdn/components/Overview'
import DomainDetail from 'cdn/components/Domain/Detail'
import DomainConflict from 'cdn/components/Domain/Conflict'
import Statistics from 'cdn/components/Statistics'
import Log from 'cdn/components/Log'
import RefreshPrefetch from 'cdn/components/RefreshPrefetch'
import DomainManage from 'cdn/components/Domain'
import DomainCreateWithQuery from 'cdn/components/Domain/Create'
import DomainCreateResult from 'cdn/components/Domain/Create/Result'
import DomainHosting from 'cdn/components/DomainHosting'
import User from 'cdn/components/User'
import Signin from 'cdn/components/User/Signin'
import Freezed from 'cdn/components/User/Freezed'
import Financial from 'cdn/components/Financial'
import { getUsagePageConfig, getCdnLogPageConfig } from 'cdn/components/Statistics/config'

import { OemBootProvider } from './BootProvider'

export default observer(function OemApp() {
  return (
    <OemBootProvider>
      <Inject render={({ inject }) => {
        const i18n = inject(I18nStore)
        const t = i18n.t
        return (
          <Route path={oemBasename}>
            <Switch placeholder={<NotFound />}>
              <Route relative exact title={t(pageMessages.login)} path="/signin"><Signin /></Route>
              <Route relative exact title={t(pageMessages.freeze)} path="/freeze"><Freezed /></Route>
              <Route path={oemBasename}>
                <Layout>
                  <Switch>
                    <Route relative exact path="/"><Redirect relative to="/overview" /></Route>
                    <Route relative path="/usage"><Redirect relative to="../statistics" /></Route>
                    <Route
                      relative
                      exact
                      title={t(pageMessages.overview)}
                      path="/overview"
                      component={({ query }) => <Overview hideAddon={query.hideAddon != null} />}
                    />
                    <Route relative title={t(pageMessages.domainManage)} path="/domain">
                      <Switch>
                        <Route relative exact path="/"><DomainManage /></Route>
                        <Route relative
                          exact
                          path="/create"
                          title={t(pageMessages.createDomain)}
                          component={
                            ({ query }) => <DomainCreateWithQuery query={query} />
                          }
                        />
                        <Route relative exact path="/create/result" title={t(pageMessages.domainCreateCompleted)}><DomainCreateResult /></Route>
                        <Route relative exact path="/conflict" title={t(pageMessages.retriveDomain)}><DomainConflict /></Route>
                        <Route relative
                          exact
                          path="/:name"
                          component={
                            ({ match }) => (
                              <DomainDetail
                                name={decodeName(match.params.name)}
                                anchor={
                                  inject(RouterStore).location!.hash
                                  ? inject(RouterStore).location!.hash.slice(1)
                                  : undefined
                                }
                              />
                            )
                          } />
                      </Switch>
                    </Route>
                    <Route relative exact title={t(pageMessages.refreshPrefetch)} path="/refresh-prefetch"><RefreshPrefetch /></Route>
                    <Route relative path="/statistics">
                      <Switch>
                        <Route relative exact path="/"><Redirect relative to="/usage" /></Route>
                        <Route relative title={t(pageMessages.usageStats)} path="/usage">
                          <Statistics type="usage" pageConfig={getUsagePageConfig(inject(IamInfo), i18n)} />
                        </Route>
                        <Route relative title={t(pageMessages.analysis)} path="/log">
                          <Statistics type="log" pageConfig={getCdnLogPageConfig(inject(IamInfo), i18n)} />
                        </Route>
                      </Switch>
                    </Route>
                    <Route relative exact title={t(pageMessages.logDownload)} path="/log"><Log /></Route>
                    <Route relative exact title={t(pageMessages.domainHosting)} path="/domain-hosting"><DomainHosting /></Route>
                    <Route relative title={t(pageMessages.accountManage)} path="/user">
                      {/* 子路由详见组件内部 */}
                      <User />
                    </Route>
                    <Route relative title={t(pageMessages.certificateManage)} path="/certificate">
                      <Certificate />
                    </Route>
                    <Route relative exact title={t(pageMessages.financial)} path="/financial"><Financial /></Route>
                  </Switch>
                </Layout>
              </Route>
            </Switch>
          </Route>
        )
      }} />
    </OemBootProvider>
  )
})
