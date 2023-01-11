/**
 * @file Alarm Manage
 * @author linchen <gakiclin@gmail.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import Tabs from 'react-icecream/lib/tabs'
import Spin from 'react-icecream/lib/spin'
import { useInjection } from 'qn-fe-core/di'
import Page from 'portal-base/common/components/Page'
import { FeatureConfigStore as FeatureConfig } from 'portal-base/user/feature-config'

import { alarmCallbackFeatureConfigKey } from 'cdn/constants/alarm'

import AlarmRule from './AlarmRule'
import AlarmCallback from './AlarmCallback'

import './style.less'

export interface Props {
  domain?: string
}

export default observer(function AlarmManage(props: Props) {
  const featureConfig = useInjection(FeatureConfig)

  if (!featureConfig.inited) {
    return (
      <div className="comp-alarm-loading">
        <Spin size="large" />
      </div>
    )
  }

  const isDisabled = featureConfig.isDisabled(alarmCallbackFeatureConfigKey)

  const tabs: Array<React.ReactElement | boolean> = [
    <Tabs.TabPane className="alarm-content" tab="域名告警规则" key="alarm-rule">
      <AlarmRule domain={props.domain} />
    </Tabs.TabPane>,
    !isDisabled && (
      <Tabs.TabPane className="alarm-content" tab="告警通知回调" key="alarm-callback">
        <AlarmCallback />
      </Tabs.TabPane>
    )
  ].filter(Boolean)

  return (
    <Page className="comp-alarm-manage" hasSpace={false}>
      <Tabs>{tabs}</Tabs>
    </Page>
  )
})
