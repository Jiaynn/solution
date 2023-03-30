import { observer } from 'mobx-react'
import SubSidebar, { LinkItem } from 'portal-base/common/components/SubSidebar'

import React from 'react'

import { Redirect, Route, Switch } from 'portal-base/common/router'

import AppInfo from 'components/InteractMarketing/AppInfo'
import EditApp from 'components/InteractMarketing/EditApp'
import OpenService from 'components/InteractMarketing/OpenService'
import AppList from 'components/InteractMarketing/AppList'
import { basenameMap, nameMap, Solution } from 'constants/solutions'

const title = nameMap[Solution.InteractMarketing]
const basename = basenameMap[Solution.InteractMarketing]

export const InteractMarketingSideBar = observer(() => (
  <SubSidebar title={title}>
    <LinkItem to={`${basename}/app/list`} relative>
      应用管理
    </LinkItem>
  </SubSidebar>
))

export const InteractMarketingRouter = (
  <Route relative title={title} path={basename}>
    <Switch>
      <Route relative exact title={title} path="/">
        <Redirect relative to="/app/list" />
      </Route>

      <Route relative exact path="/open-service">
        <OpenService />
      </Route>

      <Route relative path="/app">
        <Route relative exact path="/list">
          <AppList />
        </Route>

        <Route relative path="/edit">
          <Route relative exact path="/">
            <Redirect relative to="/step" />
          </Route>

          <Route relative path="/step">
            <EditApp updateMode />
          </Route>

          <Route relative exact path="/completed">
            <AppInfo type="edit" />
          </Route>
        </Route>

        <Route relative path="/create">
          <Route relative exact path="/">
            <Redirect relative to="/step" />
          </Route>

          <Route relative path="/step">
            <EditApp />
          </Route>

          <Route relative exact path="/completed">
            <AppInfo type="create" />
          </Route>
        </Route>

        <Route relative exact path="/info">
          <AppInfo type="normal" />
        </Route>
      </Route>
    </Switch>
  </Route>
)
