import { observer } from 'mobx-react-lite'
import { useLocalStore } from 'qn-fe-core/local-store'
import React from 'react'

import { Button, Radio, Spin } from 'react-icecream'

import { useInjection } from 'qn-fe-core/di'

import { message } from 'antd'

import HubRadioListStore from './store'
import SubConfigWrapper from '../../SubConfigWrapper'
import WrapperWithShowMore from '../../WrapperWithShowMore'
import SubConfigTitle from '../../SubConfigTitle'
import AppConfigStore from 'store/interactMarketing/appConfig'

const toHubList = () => {
  window.open('https://portal.qiniu.com/pili/hub', '_blank')
}

const toCreateHub = () => {
  window.open('https://portal.qiniu.com/pili/hub', '_blank')
}

export interface HubRadioListProps {}

const HubRadioList: React.FC<HubRadioListProps> = observer(props => {
  const appConfigStore = useInjection(AppConfigStore)
  const { hub } = appConfigStore.config
  const store = useLocalStore(HubRadioListStore, props)
  const { loadingHubs, hubsForShow } = store

  const toHubSetting = () => {
    if (!hub || hub === '') {
      message.error('无空间')
    }
    window.open(
      `https://portal.qiniu.com/pili/hub/${hub}/detail/configuration`,
      '_blank'
    )
  }

  return (
    <Spin spinning={loadingHubs}>
      <SubConfigWrapper
        renderLinks={
          <div>
            <Button type="link" onClick={toHubList}>
              查看空间列表
            </Button>
            <Button type="link" onClick={toHubSetting}>
              空间设置
            </Button>
            <Button type="link" onClick={toCreateHub}>
              创建新空间
            </Button>
            <Button type="link" onClick={store.fetchHubs}>
              刷新列表
            </Button>
          </div>
        }
      >
        <WrapperWithShowMore
          title={
            <SubConfigTitle id="integration-hub" safety={hub.length > 0}>
              直播空间*：
            </SubConfigTitle>
          }
          onClickShowMore={store.loadMoreHub}
        >
          <Radio.Group
            value={appConfigStore.config.hub}
            onChange={e => {
              appConfigStore.updateConfig({ hub: e.target.value })
            }}
            style={{ gridTemplateColumns: 'repeat(3, minmax(12rem, 1fr)' }}
          >
            {hubsForShow.map(value => (
              <Radio key={value} value={value}>
                {value}
              </Radio>
            ))}
          </Radio.Group>
        </WrapperWithShowMore>
      </SubConfigWrapper>
    </Spin>
  )
})
export default HubRadioList
