import { observer } from 'mobx-react'
import SubSidebar, { LinkItem } from 'portal-base/common/components/SubSidebar'
import React from 'react'
import { Redirect, Route, Switch } from 'portal-base/common/router'

import Overview from 'components/image/Overview'
import Configuration from 'components/image/Configuration'
import MediaStyleDrawerProvider from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/Drawer/Provider'
import ImageManagement from 'components/image/ImageManagement'
import ResourcePack from 'components/image/ResourcePack'
import { basenameMap, nameMap, Solution } from 'constants/solutions'

const title = nameMap[Solution.Image]

export const imageBasename = basenameMap[Solution.Image]

export const ImageSidebar = observer(() => <SubSidebar title={title}>
  <LinkItem to="image/overview" relative >方案概览</LinkItem>
  <LinkItem to="image/configuration" relative>方案配置</LinkItem>
  <LinkItem to="image/image-management" relative>图片管理</LinkItem>
</SubSidebar>)

export const ImageRouter = (
  <Route relative title={title} path={imageBasename}>
    <Switch>
      <Route exact relative title={title} path="/">
        <Redirect relative to="/overview" />
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
