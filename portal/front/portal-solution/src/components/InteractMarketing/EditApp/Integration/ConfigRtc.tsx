import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Radio, Spin } from 'react-icecream'
import { RadioChangeEvent } from 'react-icecream/lib/radio'

import AppConfigStore from 'store/interactMarketing/appConfig'
import SubConfigTitle from './SubConfigTitle'
import SubConfigWrapper from './SubConfigWrapper'
import WrapperWithShowMore from './WrapperWithShowMore'

const ConfigRtc: React.FC<{}> = observer(() => {
  const appConfigStore = useInjection(AppConfigStore)
  const [loadingRtc, setLoadingRtc] = useState(false)
  const [loadingIm, setLoadingIm] = useState(false)
  const [rtcSize, setRtcSize] = useState(3)

  const onClickShowMore = () => {
    setLoadingRtc(true)
    appConfigStore
      .fetchRtcAppList({ page_num: 1, page_size: rtcSize })
      .then(() => {
        setLoadingIm(true)
        appConfigStore.fetchIMServer().finally(() => {
          setLoadingIm(false)
        })
      })
      .finally(() => {
        setLoadingRtc(false)
      })
    setRtcSize(6)
  }

  const onRtcChange = (e: RadioChangeEvent) => {
    appConfigStore.updateConfig({ RTCApp: e.target.value })

    setLoadingIm(true)
    appConfigStore.fetchIMServer().finally(() => {
      setLoadingIm(false)
    })
  }

  const onImChange = (e: RadioChangeEvent) => {
    appConfigStore.updateConfig({ IMServer: e.target.value })
  }

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

  const reflashRtc = useCallback(() => {
    setLoadingRtc(true)
    appConfigStore
      .fetchRtcAppList({ page_num: 1, page_size: rtcSize })
      .then(() => {
        setLoadingIm(true)
        appConfigStore.fetchIMServer().finally(() => {
          setLoadingIm(false)
        })
      })
      .finally(() => {
        setLoadingRtc(false)
      })
  }, [appConfigStore, rtcSize])

  const toImDetails = () => {
    window.open(
      `http://portal.qiniu.com/rtn/app/detail/${appConfigStore.config.RTCApp}`,
      '_blank'
    )
  }

  const reflashIm = () => {
    setLoadingIm(true)
    appConfigStore.fetchIMServer().finally(() => {
      setLoadingIm(false)
    })
  }

  useEffect(() => {
    reflashRtc()
  }, [reflashRtc])

  return (
    <>
      <Alert message="RTC服务相关配置" showIcon />
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
              <Button type="link" onClick={reflashRtc}>
                刷新列表
              </Button>
            </div>
          }
        >
          <WrapperWithShowMore
            renderTitle={
              <SubConfigTitle
                id="integration-rtc"
                style={{ lineHeight: '1.5rem' }}
                safety={appConfigStore.config.RTCApp.length > 0}
              >
                <div>RTC应用*</div>
                <div style={{ fontSize: '1rem' }}>（连麦服务）：</div>
              </SubConfigTitle>
            }
            onClickShowMore={onClickShowMore}
          >
            <Radio.Group
              value={appConfigStore.config.RTCApp}
              onChange={onRtcChange}
              style={{ gridTemplateColumns: 'repeat(3, minmax(12rem, 1fr)' }}
            >
              {appConfigStore.rtcApps.map(value => (
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Radio.Group>
          </WrapperWithShowMore>
        </SubConfigWrapper>
      </Spin>

      <Spin spinning={loadingIm}>
        <SubConfigWrapper
          renderLinks={
            <div>
              <Button type="link" onClick={toImDetails}>
                应用详情
              </Button>
              <Button type="link" onClick={reflashIm}>
                刷新列表
              </Button>
            </div>
          }
        >
          <WrapperWithShowMore
            renderTitle={
              <SubConfigTitle
                id="integration-im"
                style={{ lineHeight: '1.5rem' }}
                safety={appConfigStore.config.IMServer.length > 0}
              >
                <div>通讯服务*</div>
                <div style={{ fontSize: '1rem' }}>（IM）：</div>
              </SubConfigTitle>
            }
          >
            <Radio.Group
              value={appConfigStore.config.IMServer}
              onChange={onImChange}
              style={{ gridTemplateColumns: 'repeat(3, minmax(12rem, 1fr)' }}
            >
              {appConfigStore.imServer.map(value => (
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Radio.Group>
          </WrapperWithShowMore>
        </SubConfigWrapper>
      </Spin>
    </>
  )
})

export default ConfigRtc
