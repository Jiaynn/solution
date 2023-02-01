/**
 * @file component FlowTypeTab 流量类型切换 Tab
 * @author zhangheng01 <zhangheng01@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Radio } from 'react-icecream/lib'
import { useInjection } from 'qn-fe-core/di'
import { RadioChangeEvent } from 'react-icecream/lib/radio'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import { ConfigStore } from 'kodo/stores/config'

import { FlowSrcType, flowSrcTypeTextMap } from 'kodo/constants/statistics'

export interface IProps {
  onChange(value: FlowSrcType): void
  value: FlowSrcType
}

export default observer(
  function FlowTypeTab(props: IProps): React.ReactElement<IProps> {
    const configStore = useInjection(ConfigStore)
    const featureStore = useInjection(FeatureConfigStore)

    const globalConfig = configStore.getFull()

    return (
      <Radio.Group
        buttonStyle="solid"
        onChange={(e: RadioChangeEvent) => props.onChange(e.target.value)}
        value={props.value}
      >
        <Radio.Button value={FlowSrcType.ExternalOutflow}>
          {flowSrcTypeTextMap[FlowSrcType.ExternalOutflow]}
        </Radio.Button>
        {!featureStore.isDisabled('KODO.KODO_STATISTICS_FLOW_OUT_SINGLE')
        && globalConfig.statistics.bucketFlow.singleOut.enable
        && (
          <Radio.Button value={FlowSrcType.SingleExternalOutflow}>
            {flowSrcTypeTextMap[FlowSrcType.SingleExternalOutflow]}
          </Radio.Button>
        )}
        {globalConfig.fusion.domain.enable && !featureStore.isDisabled('KODO.KODO_DOMAIN_SETTING') && (
          <Radio.Button value={FlowSrcType.CDN}>
            {flowSrcTypeTextMap[FlowSrcType.CDN]}
          </Radio.Button>
        )}
        <Radio.Button value={FlowSrcType.ExternalInflow}>
          {flowSrcTypeTextMap[FlowSrcType.ExternalInflow]}
        </Radio.Button>
      </Radio.Group>
    )
  }
)
