import { observer } from 'mobx-react-lite'
import { useLocalStore } from 'qn-fe-core/local-store'
import React from 'react'

import { Button, Radio, Spin } from 'react-icecream'

import { useInjection } from 'qn-fe-core/di'

import { RadioChangeEvent } from 'react-icecream/lib/radio'

import RtcRadioListStore from './store'
import SubConfigTitle from '../../SubConfigTitle'
import SubConfigWrapper from '../../SubConfigWrapper'
import WrapperWithShowMore from '../../WrapperWithShowMore'
import AppConfigStore from 'store/interactMarketing/appConfig'

export interface RtcRadioListProps {}

const RtcRadioList: React.FC<RtcRadioListProps> = observer(props => {
  const appConfigStore = useInjection(AppConfigStore)
  const store = useLocalStore(RtcRadioListStore, props)
  const { loadingRtc, rtcApps } = store

  const toRtcList = () => {
    window.open('https://portal.qiniu.com/rtn/app', '_blank')
  }

  const toRtcDetails = () => {
    window.open(
      `https://portal.qiniu.com/rtn/app/detail/${appConfigStore.config.RTCApp}`,
      '_blank'
    )
  }

  const toCreateRtc = () => {
    window.open('https://portal.qiniu.com/rtn/app/create', '_blank')
  }

  const onRtcChange = (e: RadioChangeEvent) => {
    appConfigStore.updateConfig({ RTCApp: e.target.value })
  }

  return (
    <Spin spinning={loadingRtc}>
      <SubConfigWrapper
        renderLinks={
          <div>
            <Button type="link" onClick={toRtcList}>
              查看应用列表
            </Button>
            <Button type="link" onClick={toRtcDetails}>
              应用详情
            </Button>
            <Button type="link" onClick={toCreateRtc}>
              创建新应用
            </Button>
            <Button type="link" onClick={store.fetchRtcAppList}>
              刷新列表
            </Button>
          </div>
        }
      >
        <WrapperWithShowMore
          title={
            <SubConfigTitle
              id="integration-rtc"
              style={{ lineHeight: '1.5rem' }}
              safety={appConfigStore.config.RTCApp.length > 0}
            >
              <div>RTC应用*</div>
              <div style={{ fontSize: '1rem' }}>（连麦服务）：</div>
            </SubConfigTitle>
          }
          onClickShowMore={store.loadMore}
        >
          <Radio.Group
            value={appConfigStore.config.RTCApp}
            onChange={onRtcChange}
            style={{ gridTemplateColumns: 'repeat(3, minmax(12rem, 1fr)' }}
          >
            {rtcApps.map(value => (
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
export default RtcRadioList
