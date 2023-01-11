/**
 * @file component DcdnApp
 * @author liaoxiaoyou <liaoxiaoyou@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { Inject } from 'qn-fe-core/di'
import { I18nStore } from 'portal-base/common/i18n'
import NotFound from 'portal-base/common/components/NotFound'
import { RouterStore, Route, Switch, Redirect } from 'portal-base/common/router'

import { decodeName } from 'cdn/transforms/domain/url'

import { dcdnBasename } from 'cdn/constants/route'
import IamInfo from 'cdn/constants/iam-info'

import Layout from 'cdn/components/Layout/dcdn'
import Overview from 'cdn/components/Overview'
import DomainDetail from 'cdn/components/Domain/Detail'
import DomainConflict from 'cdn/components/Domain/Conflict'
import Statistics from 'cdn/components/Statistics'
import Log from 'cdn/components/Log'
import RefreshPrefetch from 'cdn/components/RefreshPrefetch'
import DomainManage from 'cdn/components/Domain'
import DomainCreateWithQuery from 'cdn/components/Domain/Create'
import DomainCreateResult from 'cdn/components/Domain/Create/Result'
import DomainVerifyOwnership from 'cdn/components/Domain/Create/VerifyOwnership'
import Alarm from 'cdn/components/Alarm'
import { getUsagePageConfig, getDcdnLogPageConfig } from 'cdn/components/Statistics/config'

import { DcdnBootProvider } from './BootProvider'

export default observer(function DcdnApp() {
  return (
    <DcdnBootProvider>
      <Inject render={({ inject }) => (
        <Route path={dcdnBasename}>
          <Switch placeholder={<NotFound />}>
            <Route path={dcdnBasename}>
              <Layout>
                <Switch>
                  <Route relative exact path="/"><Redirect relative to="/overview" /></Route>
                  <Route
                    relative
                    exact
                    title="概览"
                    path="/overview"
                    component={({ query }) => <Overview hideAddon={query.hideAddon != null} />}
                  />
                  <Route relative title="域名管理" path="/domain">
                    <Switch>
                      <Route relative exact path="/"><DomainManage /></Route>
                      <Route relative
                        exact
                        path="/create"
                        title="添加域名"
                        component={
                          ({ query }) => <DomainCreateWithQuery query={query} />
                        }
                      />
                      <Route
                        relative
                        exact
                        path="/create/result"
                        title="创建完成"
                        component={
                          ({ query }) => (
                            <DomainCreateResult
                              retryImmediately={Boolean(query.retryImmediately)}
                            />
                          )
                        }
                      />
                      <Route relative exact path="/conflict" title="找回域名"><DomainConflict /></Route>
                      <Route relative exact path="/verify-ownership" title="验证域名归属权"><DomainVerifyOwnership /></Route>
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
                  <Route relative exact title="刷新预取" path="/refresh-prefetch"><RefreshPrefetch /></Route>
                  <Route relative title="告警配置" path="/alarm">
                    <Switch>
                      <Route relative exact path="/">
                        <Alarm />
                      </Route>
                      <Route relative
                        path="/:domain"
                        component={({ match: { params } }) => (
                          <Alarm domain={params.domain} />
                        )}
                      />
                    </Switch>
                  </Route>
                  <Route relative path="/statistics">
                    <Switch>
                      <Route relative exact path="/"><Redirect relative to="/usage" /></Route>
                      <Route relative title="用量统计" path="/usage">
                        <Statistics type="usage" pageConfig={getUsagePageConfig(inject(IamInfo), inject(I18nStore))} />
                      </Route>
                      <Route relative title="日志分析" path="/log">
                        <Statistics type="log" pageConfig={getDcdnLogPageConfig(inject(IamInfo), inject(I18nStore))} />
                      </Route>
                    </Switch>
                  </Route>
                  <Route relative exact title="日志下载" path="/log"><Log /></Route>
                </Switch>
              </Layout>
            </Route>
          </Switch>
        </Route>
      )} />
    </DcdnBootProvider>
  )
})
