/*
 * @file 带 Tab 页面的 layout
 * @author nighca <nighca@live.cn>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import Tabs from 'react-icecream/lib/tabs'
import { RouterStore } from 'portal-base/common/router'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import './style.less'

export interface ITabItem {
  path: string
  name: string
  featureConfigKey?: string
}

function getActiveTab(routerStore: RouterStore, tabs: ITabItem[]) {
  return tabs.slice().sort(
    // 按 path 长度排个序，这样在多个 tab 可能匹配的时候，最长的那个会被先找到
    (tabA, tabB) => tabB.path.length - tabA.path.length
  ).find(
    tab => !!routerStore.matchPath({
      path: tab.path,
      exact: false,
      strict: false
    })
  )
}

export default observer(function LayoutWithTabs(props: { children: any, tabs: ITabItem[] }) {
  const routerStore = useInjection(RouterStore)
  const featureConfig = useInjection(FeatureConfigStore)

  const tabPanes = props.tabs.filter(
    ({ featureConfigKey }) => !featureConfigKey || !featureConfig.isDisabled(featureConfigKey)
  ).map(
    ({ name, path }) => <Tabs.TabPane tab={name} key={path} />
  )

  const activeTab = getActiveTab(routerStore, props.tabs)

  return (
    <div className="comp-layout-with-tabs">
      <div className="content-tabs">
        <Tabs
          animated={false}
          activeKey={activeTab?.path}
          onChange={activeKey => routerStore.push(activeKey)}
        >
          {tabPanes}
        </Tabs>
      </div>
      <div className="content-without-tabs">
        {props.children}
      </div>
    </div>
  )
})
