/*
 * @file apm component
 * @author zhuhao <zhuhao@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'

import { useInjection } from 'qn-fe-core/di'
import Page from 'portal-base/common/components/Page'
import { useLocalStore } from 'portal-base/common/utils/store'
import { FeatureConfigStore } from 'portal-base/user/feature-config'

import Search from './Search'
import LocalStore from './store'
import Analysis from './Analysis'

import './style.less'

interface ApmInnerProps {
  featureConfig: FeatureConfigStore
  store: LocalStore
}

@observer
class ApmInner extends React.Component<ApmInnerProps> {

  render() {
    const { store } = this.props
    if (this.props.featureConfig.isDisabled('FUSION.FUSION_APM')) {
      return null
    }

    return (
      <Page className="apm-wrapper">
        <Search
          options={store.searchOptions}
          onSubmit={options => store.updateOptions(options)}
        />
        <div className="apm-introduce-wrapper">
          统计数据来源于性能监测服务公司，七牛云通过对基础质量数据按照一定的科学算法进行统计分析，为客户展示账号下域名实际使用到资源的质量状态，详细算法请参考
          <a href="https://developer.qiniu.com/fusion/manual/5911/third-party-apm" target="_blank" rel="noopener noreferrer">统计规则说明</a>
          。若需要更详细的第三方监测数据，请联系七牛商务进行合作沟通。
        </div>
        <Analysis options={store.searchOptions} />
      </Page>
    )
  }
}

export default function Apm() {
  const store = useLocalStore(LocalStore)
  const featureConfig = useInjection(FeatureConfigStore)

  return (
    <ApmInner store={store} featureConfig={featureConfig} />
  )
}

