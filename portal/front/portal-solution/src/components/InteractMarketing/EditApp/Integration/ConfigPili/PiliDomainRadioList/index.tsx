import { observer } from 'mobx-react-lite'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import React from 'react'
import { Button, Radio, Spin } from 'react-icecream'

import AppConfigStore from 'store/interactMarketing/appConfig'

import DomainWrapper from '../../DomainWrapper'
import SubConfigTitle from '../../SubConfigTitle'
import SubConfigWrapper from '../../SubConfigWrapper'
import WrapperWithShowMore from '../../WrapperWithShowMore'

import PiliDomainRadioListStore from './store'

const PiliDomainTitle: React.FC<{}> = props => (
  <div style={{ width: '8.5rem' }}>{props.children}</div>
)

export interface PiliDomainRadioListProps {}

const PiliDomainRadioList: React.FC<PiliDomainRadioListProps> = observer(
  props => {
    const appConfigStore = useInjection(AppConfigStore)
    const { hub } = appConfigStore.config

    const store = useLocalStore(PiliDomainRadioListStore, props)

    const { loading, publishRtmp, liveRtmp, liveHls, liveHdl } = store

    const toDomainList = () => {
      window.open(
        `https://portal.qiniu.com/pili/hub/${hub}/detail/domain`,
        '_blank'
      )
    }

    return (
      <Spin spinning={loading}>
        <SubConfigWrapper
          renderLinks={
            <div>
              <Button type="link" onClick={toDomainList}>
                域名管理
              </Button>
              <Button type="link" onClick={store.fetchPiliDomain}>
                刷新列表
              </Button>
            </div>
          }
        >
          <SubConfigTitle
            id="integration-hub-domains"
            safety={appConfigStore.config.publishRtmp.length > 0}
          >
            直播域名
          </SubConfigTitle>
          <WrapperWithShowMore
            title={<PiliDomainTitle>RTMP/SRT推流：</PiliDomainTitle>}
          >
            <Radio.Group
              value={appConfigStore.config.publishRtmp}
              onChange={e => {
                appConfigStore.updateConfig({ publishRtmp: e.target.value })
              }}
              style={{ gridTemplateColumns: 'repeat(2, minmax(12rem, 1fr)' }}
            >
              {publishRtmp.map(value => (
                <Radio key={value} value={value}>
                  <DomainWrapper domain={value} />
                </Radio>
              ))}
            </Radio.Group>
          </WrapperWithShowMore>

          <WrapperWithShowMore
            title={<PiliDomainTitle>RTMP播放：</PiliDomainTitle>}
          >
            <Radio.Group
              value={appConfigStore.config.liveRtmp}
              onChange={e => {
                appConfigStore.updateConfig({ liveRtmp: e.target.value })
              }}
              style={{ gridTemplateColumns: 'repeat(2, minmax(12rem, 1fr)' }}
            >
              {liveRtmp.map(value => (
                <Radio key={value} value={value}>
                  <DomainWrapper domain={value} />
                </Radio>
              ))}
            </Radio.Group>
          </WrapperWithShowMore>

          <WrapperWithShowMore
            title={<PiliDomainTitle>HLS播放：</PiliDomainTitle>}
          >
            <Radio.Group
              value={appConfigStore.config.liveHls}
              onChange={e => {
                appConfigStore.updateConfig({ liveHls: e.target.value })
              }}
              style={{ gridTemplateColumns: 'repeat(2, minmax(12rem, 1fr)' }}
            >
              {liveHls.map(value => (
                <Radio key={value} value={value}>
                  <DomainWrapper domain={value} />
                </Radio>
              ))}
            </Radio.Group>
          </WrapperWithShowMore>

          <WrapperWithShowMore
            title={<PiliDomainTitle>HDL播放：</PiliDomainTitle>}
          >
            <Radio.Group
              value={appConfigStore.config.liveHdl}
              onChange={e => {
                appConfigStore.updateConfig({ liveHdl: e.target.value })
              }}
              style={{ gridTemplateColumns: 'repeat(2, minmax(12rem, 1fr)' }}
            >
              {liveHdl.map(value => (
                <Radio key={value} value={value}>
                  <DomainWrapper domain={value} />
                </Radio>
              ))}
            </Radio.Group>
          </WrapperWithShowMore>
        </SubConfigWrapper>
      </Spin>
    )
  }
)
export default PiliDomainRadioList
