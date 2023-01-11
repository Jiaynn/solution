/**
 * @desc 内容优化 layout
 * @author yaojingtian <yaojingtian@qiniu.com>
 */

import React, { PropsWithChildren } from 'react'
import { useInjection } from 'qn-fe-core/di'
import Page from 'portal-base/common/components/Page'

import LayoutWithTabs from 'cdn/components/Layout/WithTabs'
import Routes from 'cdn/constants/routes'

export default function ContentOptimizationLayout(props: PropsWithChildren<{}>) {
  const routes = useInjection(Routes)

  const tabs = [{
    path: routes.optimizationVideo,
    name: '视频瘦身',
    featureConfigKey: 'FUSION.FUSION_VIDEO_SLIM'
  }]

  return (
    <Page className="comp-page-content-optimization" header={null} hasSpace={false}>
      <LayoutWithTabs tabs={tabs}>{props.children}</LayoutWithTabs>
    </Page>
  )
}
