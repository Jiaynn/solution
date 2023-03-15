import { observer } from 'mobx-react'
import SubSidebar, { LinkItem } from 'portal-base/common/components/SubSidebar'
import React from 'react'
import { Redirect, Route, Switch } from 'portal-base/common/router'
import { ContentLayout } from 'portal-base/common/components/Layout'

import { basenameMap, nameMap, Solution } from 'constants/solutions'
import { Welcome } from 'components/lowcode/Welcome'
import { ProjectList } from 'components/lowcode/ProjectList'
import { Home } from 'components/lowcode/Home'
import { Detail } from 'components/lowcode/Detail'

import './style.less'

const title = nameMap[Solution.Lowcode]

export const lowcodeBasename = basenameMap[Solution.Lowcode]

export const LowcodeSidebar = observer(() => <SubSidebar className="lowcode-sidebar" title={title}>
  <LinkItem to="/scene" relative>场景解决方案</LinkItem>
  <LinkItem to="/project" relative>项目列表</LinkItem>
</SubSidebar>)

const LowcodeRouterComponent = () => <Switch>
  <Route exact relative title={title} path="/">
    <Redirect relative to="/welcome" />
  </Route>
  <Route exact relative title="欢迎页" path="/welcome">
    <Welcome />
  </Route>
  <Route relative title="首页" path="/">
    <div className="lowcode-main">
      <ContentLayout sidebar={<LowcodeSidebar />}>
        <Switch>
          <Route exact relative path="/">
            <Redirect relative to="/list" />
          </Route>
          <Route relative path="/project">
            <Switch>
              <Route exact relative path="/">
                <Redirect relative to="/list" />
              </Route>
              <Route relative path="/list">
                <ProjectList />
              </Route>
            </Switch>
          </Route>
          <Route relative path="/scene">
            <Switch>
              <Route exact relative path="/">
                <Redirect relative to="/list" />
              </Route>
              <Route relative path="/list">
                <Home />
              </Route>
              <Route relative path="/detail">
                <Detail />
              </Route>
            </Switch>
          </Route>
        </Switch>
      </ContentLayout>
    </div>
  </Route>
</Switch>

export const LowcodeRouter = (
  <Route relative title={title} path={lowcodeBasename}>
    <LowcodeRouterComponent />
  </Route>
)
