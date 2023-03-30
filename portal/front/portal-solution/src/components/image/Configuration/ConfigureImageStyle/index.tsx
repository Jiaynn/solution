import React, { useEffect, useState } from 'react'

import { observer } from 'mobx-react'

import { useInjection } from 'qn-fe-core/di'

import { Spin } from 'antd'

import { Query, RouterStore } from 'portal-base/common/router'

import ImageStyleContent from 'kodo/components/BucketDetails/ImageStyle'
import styles from './style.m.less'
import SelectBucket from 'components/image/common/SelectBucket'

import { BucketStore } from 'kodo/stores/bucket'

import { getFirstQuery } from 'kodo/utils/url'
import ImageSolutionStore from 'store/imageSolution'
import { imagePath } from 'utils/router'

interface IProps {
  query: Query;
}

export default observer(function ConfigureImageStyle({ query }: IProps) {
  const { bucket, configurationState } = query

  const defaultBucketName = getFirstQuery(bucket) as string

  const [selectedBucketName, setSelectedBucketName] = useState(defaultBucketName)

  const [visible, setVisible] = useState(false)
  const bucketStore = useInjection(BucketStore)
  const routerStore = useInjection(RouterStore)

  const imageSolutionStore = useInjection(ImageSolutionStore)

  useEffect(() => {
    Promise.all([
      imageSolutionStore.fetchBucketList(),
      bucketStore.fetchDetailsByName(defaultBucketName)
    ]).finally(() => {
      setVisible(true)
    })
  }, [bucketStore, defaultBucketName, imageSolutionStore])

  const onChange = (value: string) => {
    routerStore.push(
      `${imagePath}/configuration/step/3?bucket=${value}&configurationState=${configurationState}&fixBucket`
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
