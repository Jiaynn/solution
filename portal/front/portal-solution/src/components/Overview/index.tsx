import React, { useEffect } from 'react'
import { Tabs } from 'react-icecream/lib'

import { Redirect, Route, Switch } from 'qn-fe-core/router'
import { useInjection } from 'qn-fe-core/di'
import { RouterStore } from 'portal-base/common/router'
import { observer } from 'mobx-react'

import KodoOverview from './KodoOverview'
import CDNOverview from './CDNOverview'
import { SolutionApis } from 'apis/imageSolution'

export default observer(function Overview() {

  const routerStore = useInjection(RouterStore)

  const handleTabChange = (value: string) => {
    routerStore.push(`/solutions/overview/${value}`)
  }

  const solutionApis = useInjection(SolutionApis)

  useEffect(() => {
    solutionApis.getDomains().then(res => {
      // eslint-disable-next-line no-console
      console.log(res.map(r => r.name))
    })
  })

  return (
    <div>
      <Tabs onChange={handleTabChange}>
        <Tabs.TabPane tab="流量概览" key="cdn" />
        <Tabs.TabPane tab="存储概览" key="kodo" />
      </Tabs>
      <Switch placeholder="404 not found">
        <Route relative path="/" exact>
          <Redirect relative to="/cdn" />
        </Route>
        <Route relative path="/cdn">
          <CDNOverview />
        </Route>
        <Route relative path="/kodo">
          <KodoOverview />
        </Route>
      </Switch>
    </div>
  )
})
