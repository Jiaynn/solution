import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Radio, Button, Spin } from 'react-icecream'
import { RadioChangeEvent } from 'react-icecream/esm/radio'

import AppConfigStore from 'store/interactMarketing/appConfig'

import SubConfigTitle from './SubConfigTitle'
import SubConfigWrapper from './SubConfigWrapper'
import WrapperWithShowMore from './WrapperWithShowMore'
import DomainWrapper from './DomainWrapper'

const PiliDomainTitle: React.FC<{}> = props => (
  <div style={{ width: '8.5rem' }}>{props.children}</div>
)

const ConfigPili: React.FC<{}> = observer(() => {
  const appConfigStore = useInjection(AppConfigStore)
  const { hubs, publishRtmp, liveRtmp, liveHls, liveHdl, hubSize } = appConfigStore
  const { hub } = appConfigStore.config

  const [loadingHubs, setLoadingHubs] = useState(false)
  const [loadingDomains, setLoadingDomains] = useState(false)

  const reflashHubs = useCallback(() => {
    setLoadingHubs(true)
    appConfigStore
      .fecthPiliHubList()
      .then(() => {
        setLoadingDomains(true)
        appConfigStore.fecthPiliDomain().finally(() => {
          setLoadingDomains(false)
        })
      })
      .finally(() => {
        setLoadingHubs(false)
      })
  }, [appConfigStore])

  const onHubChange = (e: RadioChangeEvent) => {
    appConfigStore.updateConfig({ hub: e.target.value })
    setLoadingDomains(true)
    appConfigStore.fecthPiliDomain().finally(() => {
      setLoadingDomains(false)
    })
  }

  const toHubList = () => {
    window.open('https://portal.qiniu.com/pili/hub', '_blank')
  }

  const toHubSetting = () => {
    window.open(
      `https://portal.qiniu.com/pili/hub/${hub}/detail/configuration`,
      '_blank'
    )
  }

  const toCreateHub = () => {
    window.open('https://portal.qiniu.com/pili/hub', '_blank')
  }

  const toDomainList = () => {
    window.open(
      `https://portal.qiniu.com/pili/hub/${hub}/detail/domain`,
      '_blank'
    )
  }

  const reflashDomain = () => {
    setLoadingDomains(true)
    appConfigStore.fecthPiliDomain().finally(() => {
      setLoadingDomains(false)
    })
  }

  const onClickShowMore = () => {
    appConfigStore.updateHubSize(hubSize + 3)
    reflashHubs()
  }

  useEffect(() => {
    reflashHubs()
  }, [reflashHubs])

  return (
    <>
      <Alert message="直播服务相关配置" showIcon />

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
              <Button type="link" onClick={reflashHubs}>
                刷新列表
              </Button>
            </div>
          }
        >
          <WrapperWithShowMore
            renderTitle={
              <SubConfigTitle id="integration-hub" safety={hub.length > 0}>
                直播空间*：
              </SubConfigTitle>
            }
            onClickShowMore={onClickShowMore}
          >
            <Radio.Group
              value={appConfigStore.config.hub}
              onChange={onHubChange}
              style={{ gridTemplateColumns: 'repeat(3, minmax(12rem, 1fr)' }}
            >
              {hubs.map(value => (
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Radio.Group>
          </WrapperWithShowMore>
        </SubConfigWrapper>
      </Spin>

      <Spin spinning={loadingDomains}>
        <SubConfigWrapper
          renderLinks={
            <div>
              <Button type="link" onClick={toDomainList}>
                域名管理
              </Button>
              <Button type="link" onClick={reflashDomain}>
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
            renderTitle={<PiliDomainTitle>RTMP/SRT推流：</PiliDomainTitle>}
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
            renderTitle={<PiliDomainTitle>RTMP播放：</PiliDomainTitle>}
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
            renderTitle={<PiliDomainTitle>HLS播放：</PiliDomainTitle>}
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
            renderTitle={<PiliDomainTitle>HDL播放：</PiliDomainTitle>}
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
    </>
  )
})

export default ConfigPili
