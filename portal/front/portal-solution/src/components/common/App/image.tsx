import { observer } from 'mobx-react'
import SubSidebar, { LinkItem } from 'portal-base/common/components/SubSidebar'

import React from 'react'

import { Redirect, Route, Switch } from 'portal-base/common/router'

import { solutionsTitleMap } from 'constants/routes'
import Overview from 'components/image/Overview'
import Configuration from 'components/image/Configuration'
import MediaStyleDrawerProvider from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/Drawer/Provider'
import ImageManagement from 'components/image/ImageManagement'
import ResourcePack from 'components/image/ResourcePack'

const title = solutionsTitleMap.image

export const ImageSidebar = observer(() => <SubSidebar title={title}>
  {/* <LinkItem to="/overview" relative exact>方案概览</LinkItem> */}
  <LinkItem to="image/configuration" relative>方案配置</LinkItem>
  <LinkItem to="image/image-management" relative>图片管理</LinkItem>
</SubSidebar>)

export const ImageRouter = (
  <Route relative title={title} path="/image">
    <Switch>
      <Route exact relative title={title} path="/">
        <Redirect relative to="/configuration" />
      </Route>
      <Route relative title="方案概览" path="/overview"><Overview /></Route>
      <Route relative title="方案配置" path="/configuration">
        {/* 子路由详见组件内部 */}
        <Configuration />
      </Route>
      <Route
        relative
        title="图片管理"
        exact
        path="/image-management"
        component={() => <MediaStyleDrawerProvider>
          <ImageManagement />
        </MediaStyleDrawerProvider>}
      />
      <Route relative title="购买资源包" exact path="/resource-pack"><ResourcePack /></Route>
    </Switch>
  </Route>
)