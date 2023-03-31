import { observer } from 'mobx-react-lite'
import { useLocalStore } from 'qn-fe-core/local-store'
import React from 'react'

import { Button, Radio, Spin } from 'react-icecream'

import { useInjection } from 'qn-fe-core/di'

import AddrRadioListStore from './store'
import DomainWrapper from '../../DomainWrapper'
import SubConfigTitle from '../../SubConfigTitle'
import SubConfigWrapper from '../../SubConfigWrapper'
import WrapperWithShowMore from '../../WrapperWithShowMore'
import AppConfigStore from 'store/interactMarketing/appConfig'

export interface AddrRadioListProps {}

const AddrRadioList: React.FC<AddrRadioListProps> = observer(props => {
  const appConfigStore = useInjection(AppConfigStore)
  const { addr } = appConfigStore.config
  const store = useLocalStore(AddrRadioListStore, props)
  const { loadingAddr, bucketDomains } = store

  return (
    <Spin spinning={loadingAddr}>
      <SubConfigWrapper
        renderLinks={
          <div>
            <Button type="link" onClick={store.fetchAddr}>
              刷新列表
            </Button>
          </div>
        }
      >
        <WrapperWithShowMore
          title={
            <SubConfigTitle
              id="integration-addr"
              safety={addr ? addr.length > 0 : false}
            >
              外链域名*：
            </SubConfigTitle>
          }
        >
          <Radio.Group
            value={appConfigStore.config.addr}
            onChange={e => {
              appConfigStore.updateConfig({ addr: e.target.value })
            }}
            style={{ gridTemplateColumns: 'repeat(2, minmax(12rem, 1fr)' }}
          >
            {bucketDomains.map(value => (
              <Radio key={value} value={value}>
                <DomainWrapper domain={value} />
              </Radio>
            ))}
          </Radio.Group>
        </WrapperWithShowMore>
      </SubConfigWrapper>
    </Spin>
  )
})
export default AddrRadioList
