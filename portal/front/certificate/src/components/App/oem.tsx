/*
 * @file component OEM App
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'

import { Route, Switch, Redirect } from 'portal-base/common/router'

import SSLOverview from '../SSLOverview'
import SSLInformation from '../SSLInformation'

export default observer(function App() {
  return (
    <Switch>
      <Route relative path="/" exact><Redirect relative to="/ssl" /></Route>
      <Route relative path="/ssl">
        <Switch>
          <Route relative path="/" exact><SSLOverview /></Route>
          <Route
            relative
            path="/detail/:itemid/:type"
            component={({ match }) => <SSLInformation itemid={match.params.itemid} type={match.params.type === 'cert' ? 'cert' : 'order'} />}
          />
        </Switch>
      </Route>
    </Switch>
  )
})
