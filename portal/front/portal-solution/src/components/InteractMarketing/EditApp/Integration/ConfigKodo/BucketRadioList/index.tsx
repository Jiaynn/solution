import { observer } from 'mobx-react-lite'
import { useInjection } from 'qn-fe-core/di'
import { useLocalStore } from 'qn-fe-core/local-store'
import React from 'react'
import { Button, Radio, Spin } from 'react-icecream'
import { RadioChangeEvent } from 'react-icecream/lib/radio'

import AppConfigStore from 'store/interactMarketing/appConfig'

import SubConfigTitle from '../../SubConfigTitle'
import SubConfigWrapper from '../../SubConfigWrapper'
import WrapperWithShowMore from '../../WrapperWithShowMore'
import BtnToBucketList from './BtnToBucketList'
import BtnToBucketSetting from './BtnToBucketSetting'
import BtnToCreateBucket from './BtnToCreateBucket'

import BucketRadioListStore from './store'

export interface BucketRadioListProps {}

const BucketRadioList: React.FC<BucketRadioListProps> = observer(props => {
  const appConfigStore = useInjection(AppConfigStore)
  const { bucket } = appConfigStore.config

  const store = useLocalStore(BucketRadioListStore, props)
  const { loadingBuckets, buckets } = store

  const onBucketChange = (e: RadioChangeEvent) => {
    appConfigStore.updateConfig({ bucket: e.target.value })
  }

  return (
    <Spin spinning={loadingBuckets}>
      <SubConfigWrapper
        renderLinks={
          <div>
            <BtnToBucketList />
            <BtnToBucketSetting bucketName={bucket || ''} />
            <BtnToCreateBucket />
            <Button type="link" onClick={store.fetchBucketList}>
              刷新列表
            </Button>
          </div>
        }
      >
        <WrapperWithShowMore
          title={
            <SubConfigTitle
              id="integration-bucket"
              safety={bucket ? bucket.length > 0 : false}
            >
              存储空间*：
            </SubConfigTitle>
          }
          onClickShowMore={store.loadingMore}
        >
          <Radio.Group
            value={appConfigStore.config.bucket}
            onChange={onBucketChange}
            style={{ gridTemplateColumns: 'repeat(3, minmax(12rem, 1fr)' }}
          >
            {buckets.map(value => (
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
export default BucketRadioList
