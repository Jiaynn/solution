import SubSidebar, { LinkItem } from 'portal-base/common/components/SubSidebar'
import React from 'react'
import { Redirect, Route, Switch } from 'portal-base/common/router'

import { isElectron } from 'constants/is'
import { basenameMap, nameMap, Solution } from 'constants/solutions'
import { LowCodeWelcome } from 'components/lowcode/Welcome'
import { ProjectList } from 'components/lowcode/ProjectList'
import { LowCodeSchemeList } from 'components/lowcode/SchemeList'
import { LowCodeDetail } from 'components/lowcode/Detail'
import { LowCodeHeader } from 'components/lowcode/common/Header'

import './index.less'

const title = nameMap[Solution.Lowcode]

export const lowcodeBasename = basenameMap[Solution.Lowcode]

const prefixCls = 'lowcode-main'

export const LowcodeSidebar = () => <SubSidebar className="lowcode-sub-sidebar" title={title}>
  <LinkItem to="/lowcode/scene" relative>场景解决方案</LinkItem>
  {isElectron && <LinkItem to="/lowcode/project" relative>项目列表</LinkItem>}
</SubSidebar>

const LowcodeRouterComponent = () => <Switch>
  <Route exact relative title={title} path="/">
    <Redirect relative to="/welcome" />
  </Route>
  <Route exact relative title="欢迎页" path="/welcome">
    <LowCodeWelcome />
  </Route>
  <Route relative title="首页" path="/">
    <div className={prefixCls}>
      <LowcodeSidebar />
      <div className={`${prefixCls}-right`}>
        <LowCodeHeader className={`${prefixCls}-right-header`} />
        <div className={`${prefixCls}-right-content`}>
          <Switch>
            <Route exact relative path="/">
              <Redirect relative to="/scene" />
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
            {
              isElectron && <Route relative path="/project">
                <Switch>
                  <Route exact relative path="/">
                    <Redirect relative to="/list" />
                  </Route>
                  <Route relative path="/list">
                    <ProjectList />
                  </Route>
                </Switch>
              </Route>
            }
          </Switch>
        </div>
      </div>
    </div>
  </Route>
</Switch>

export const LowcodeRouter = (
  <Route relative title={title} path={lowcodeBasename}>
    <LowcodeRouterComponent />
  </Route>
)
