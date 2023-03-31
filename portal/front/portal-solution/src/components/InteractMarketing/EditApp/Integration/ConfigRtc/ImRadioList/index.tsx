import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import React from 'react'
import { Alert, Button, Radio, Spin } from 'react-icecream'
import { RadioChangeEvent } from 'react-icecream/lib/radio'

import AppConfigStore from 'store/interactMarketing/appConfig'
import SubConfigTitle from '../../SubConfigTitle'
import SubConfigWrapper from '../../SubConfigWrapper'
import WrapperWithShowMore from '../../WrapperWithShowMore'
import ImRadioListStore from './store'

const ImRadioList: React.FC<{}> = observer(() => {
  const appConfigStore = useInjection(AppConfigStore)
  const store = useLocalStore(ImRadioListStore)
  const { loading, im: imServer } = store

  const onImChange = (e: RadioChangeEvent) => {
    appConfigStore.updateConfig({ IMServer: e.target.value })
  }

  const toImDetails = () => {
    window.open(
      `http://portal.qiniu.com/rtn/app/detail/${appConfigStore.config.RTCApp}`,
      '_blank'
    )
  }

  return (
    <>
      <Alert message="RTC服务相关配置" showIcon />

      <Spin spinning={loading}>
        <SubConfigWrapper
          renderLinks={
            <div>
              <Button type="link" onClick={toImDetails}>
                应用详情
              </Button>
              <Button type="link" onClick={store.fetchIM}>
                刷新列表
              </Button>
            </div>
          }
        >
          <WrapperWithShowMore
            title={
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
              {imServer.map(value => (
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

export default ImRadioList
