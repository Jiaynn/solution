import React, { useEffect, useState } from 'react'

import { observer } from 'mobx-react'

import { useInjection } from 'qn-fe-core/di'

import { Spin } from 'antd'

import { Query, RouterStore } from 'portal-base/common/router'

import ImageStyleContent from 'kodo/components/BucketDetails/ImageStyle'
import styles from './style.m.less'
import SelectBucket from '../SelectBucket'

import { BucketStore } from 'kodo/stores/bucket'

import ConfigurationStore from './ConfigurationStore'

import { basename } from 'constants/routes'
import { getFirstQuery } from 'kodo/utils/url'

interface IProps {
  query: Query;
}

export default observer(function ConfigureImageStyle({ query }: IProps) {
  const { bucket, configurationState } = query
  // 等于1 为true第一次进入
  const isFristVisit = !JSON.parse(getFirstQuery(configurationState))

  const defaultBucketName = getFirstQuery(bucket) as string

  const [selectedBucketName, setSelectedBucketName] = useState(defaultBucketName)

  const [visible, setVisible] = useState(false)
  const bucketStore = useInjection(BucketStore)
  const configurationStore = ConfigurationStore
  const routerStore = useInjection(RouterStore)

  configurationStore.setIsFristVisit(isFristVisit)

  useEffect(() => {
    bucketStore.fetchDetailsByName(defaultBucketName).then(() => {
      setVisible(true)
    })
  }, [bucketStore, defaultBucketName])

  const onChange = (value: string) => {
    routerStore.push(
      `${basename}/configuration/step/3?bucket=${value}&configurationState=${configurationState}&fixBucket`
    )
    setSelectedBucketName(value)
    bucketStore.fetchDetailsByName(value)
  }

  return (
    <div className={styles.wrapper}>
      <SelectBucket value={defaultBucketName} onChange={onChange} />
      {visible
? (
  <ImageStyleContent bucketName={selectedBucketName} />
      )
: (
  <Spin />
      )}
    </div>
  )
})
