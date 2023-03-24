import { Route } from 'qn-fe-core/router'
import React from 'react'
import Layout, { ContentLayout } from 'portal-base/common/components/Layout'
import NotFound from 'portal-base/common/components/NotFound'
import { Switch, Redirect } from 'portal-base/common/router'

import BasicBootProvider from 'components/common/App/BootProvider'
import { basename } from 'constants/routes'

const BasicAppContainer = () => (
  <Route path={basename} >
    <Layout>
      <ContentLayout sidebar={null}>
        <Switch placeholder={<NotFound />}>
          <Route relative exact title="首页" path="/">
            <Redirect relative to="/a" />
          </Route>
          <Route relative title="首页" path="/a">
            /a
          </Route>
          <Route relative title="用户信息" path="/b">
            /b
          </Route>
          <Route relative title="Hello" path="/c">
            /c
          </Route>
        </Switch>
      </ContentLayout>
    </Layout>
  </Route>
)

const BasicApp = () => <BasicBootProvider>
  <BasicAppContainer />
</BasicBootProvider>

export default BasicApp
