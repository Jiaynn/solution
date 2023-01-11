/**
 * @file component App
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { Inject } from 'qn-fe-core/di'
import { I18nStore } from 'portal-base/common/i18n'
import NotFound from 'portal-base/common/components/NotFound'
import { RouterStore, Route, Switch, Redirect } from 'portal-base/common/router'

import { decodeName } from 'cdn/transforms/domain/url'

import IamInfo from 'cdn/constants/iam-info'
import { cdnBasename, notificationBasename } from 'cdn/constants/route'

import Layout from 'cdn/components/Layout'
import FullScreenLayout from 'cdn/components/Layout/FullScreen'
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
import Apm from 'cdn/components/Apm'
import Alarm from 'cdn/components/Alarm'
import MigrateNotice from 'cdn/components/Alarm/MigrateNotice'
import QualityAssuranceService from 'cdn/components/Qas'
import ContentOptimizationLayout from 'cdn/components/ContentOptimization/Layout'
import VideoSlim from 'cdn/components/ContentOptimization/VideoSlim'
import VideoSlimPreview from 'cdn/components/ContentOptimization/VideoSlim/Preview'
import VideoSlimPreviewDemo from 'cdn/components/ContentOptimization/VideoSlim/Preview/Demo'
import { getUsagePageConfig, getCdnLogPageConfig } from 'cdn/components/Statistics/config'

import { CdnBootProvider } from './BootProvider'

const optimizationVideoPreview = (
  <Route title="视频瘦身效果预览" path={`${cdnBasename}/content-optimization/video/preview`}>
    <FullScreenLayout>
      <Switch>
        <Route relative exact path="/demo"><VideoSlimPreviewDemo /></Route>
        <Route relative
          exact
          path="/:id"
          component={
            ({ match }) => <VideoSlimPreview taskId={match.params.id} />
          } />
      </Switch>
    </FullScreenLayout>
  </Route>
)

const optimizationVideo = (
  <Route relative path="/content-optimization">
    <ContentOptimizationLayout>
      <Route relative exact path="/"><Redirect relative to="/video" /></Route>
      <Route relative
        exact
        path="/video"
        title="视频瘦身"
        component={({ query }) => (
          <VideoSlim domain={query.domain as string | undefined} />
        )} />
    </ContentOptimizationLayout>
  </Route>
)

export default observer(function App() {
  return (
    <CdnBootProvider>
      <Inject render={({ inject }) => (
        <Route path={cdnBasename}>
          <Switch placeholder={<NotFound />}>
            {optimizationVideoPreview}
            <Route path={cdnBasename}>
              <Layout>
                <Switch>
                  <Route relative exact path="/"><Redirect relative to="/overview" /></Route>
                  <Route relative path="/usage"><Redirect relative to="../statistics" /></Route>
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
                  <Route relative exact title="通知管理" path="/notice">
                    <MigrateNotice title="通知管理" url={`${notificationBasename}/user-setting/basic/finance`} />
                  </Route>
                  <Route relative exact title="质量魔镜" path="/apm"><Apm /></Route>
                  <Route relative exact title="质量保障服务" path="/qas"><QualityAssuranceService /></Route>
                  {optimizationVideo}
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
                  <Route relative title="告警联系人" path="/contact">
                    <MigrateNotice title="告警联系人" url={`${notificationBasename}/recipient/user`} />
                  </Route>
                  <Route relative path="/statistics">
                    <Switch>
                      <Route relative exact path="/"><Redirect relative to="/usage" /></Route>
                      <Route relative title="用量统计" path="/usage">
                        <Statistics type="usage" pageConfig={getUsagePageConfig(inject(IamInfo), inject(I18nStore))} />
                      </Route>
                      <Route relative title="日志分析" path="/log">
                        <Statistics type="log" pageConfig={getCdnLogPageConfig(inject(IamInfo), inject(I18nStore))} />
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
    </CdnBootProvider>
  )
})
