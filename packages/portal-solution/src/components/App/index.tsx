/**
 * @file component App
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'

import NotFound from 'portal-base/common/components/NotFound'
import { Route, Switch, Redirect } from 'portal-base/common/router'
import Layout, { ContentLayout } from 'portal-base/common/components/Layout'
import SubSidebar, { LinkItem } from 'portal-base/common/components/SubSidebar'

import { basename, entry } from 'constants/routes'
import { name as productName } from 'constants/product'

import BootProvider from './BootProvider'
import Overview from 'components/Overview'
import Setting from 'components/Setting'
import ImageManagement from 'components/ImageManagement'
import ResourcePack from 'components/ResourcePack'

const Sidebar = observer(function MySidebar() {
  return (
    <SubSidebar title={productName}>
      <LinkItem to="/overview" relative exact>方案概览</LinkItem>
      <LinkItem to="/setting" relative>方案配置</LinkItem>
      <LinkItem to="/image-management" relative>图片管理</LinkItem>
      <LinkItem to="/resource-pack" relative>购买资源包</LinkItem>
    </SubSidebar>
  )
})

export default observer(function App() {
  return (
    <BootProvider>
      <Switch placeholder={<NotFound />}>
        <Route path="/overview" title="方案概览" exact>
          <Redirect to={entry} />
        </Route>
        <Route path={basename} title={productName}>
          <Layout>
            <ContentLayout sidebar={<Sidebar />}>
              <Switch placeholder={<NotFound />}>
                <Route relative title="方案概览" exact path="/overview"><Overview /></Route>
                <Route relative title="方案配置" exact path="/setting"><Setting /></Route>
                <Route relative title="图片管理" exact path="/image-management"><ImageManagement /></Route>
                <Route relative title="购买资源包" exact path="/resource-pack"><ResourcePack /></Route>
              </Switch>
            </ContentLayout>
          </Layout>
        </Route>
      </Switch>
    </BootProvider>
  )
})
