import { observer } from 'mobx-react'
import SubSidebar, { LinkItem } from 'portal-base/common/components/SubSidebar'
import React from 'react'
import { Redirect, Route, Switch } from 'portal-base/common/router'

import { basenameMap, nameMap, Solution } from 'constants/solutions'
import { LowCodeWelcome } from 'components/lowcode/Welcome'
import { ProjectList } from 'components/lowcode/ProjectList'
import { LowCodeSchemeList } from 'components/lowcode/SchemeList'
import { LowCodeDetail } from 'components/lowcode/Detail'

const title = nameMap[Solution.Lowcode]

export const lowcodeBasename = basenameMap[Solution.Lowcode]

export const LowcodeSidebar = observer(() => <SubSidebar title={title}>
  <LinkItem to="/lowcode/scene" relative>场景解决方案</LinkItem>
  <LinkItem to="/lowcode/project" relative>项目列表</LinkItem>
</SubSidebar>)

const LowcodeRouterComponent = () => <Switch>
  <Route exact relative title={title} path="/">
    <Redirect relative to="/welcome" />
  </Route>
  <Route exact relative title="欢迎页" path="/welcome">
    <LowCodeWelcome />
  </Route>
  <Route relative title="首页" path="/">
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
            <LowCodeSchemeList />
          </Route>
          <Route relative path="/detail">
            <LowCodeDetail />
          </Route>
        </Switch>
      </Route>
    </Switch>
  </Route>
</Switch>

export const LowcodeRouter = (
  <Route relative title={title} path={lowcodeBasename}>
    <LowcodeRouterComponent />
  </Route>
)
