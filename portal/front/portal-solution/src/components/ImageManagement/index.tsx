import React, { useCallback, useEffect, useState } from 'react'

import { useInjection } from 'qn-fe-core/di'

import { observer } from 'mobx-react'

import { Empty, Loading } from 'react-icecream-2'

import SelectBucket from 'components/Configuration/SelectBucket'

import { ObjectManage } from 'kodo/components/BucketDetails/ObjectManage'
import ImageSolutionStore from 'store/imageSolution'
import { MediaStyleDrawer } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/Drawer'
import { MediaStyleDrawerStore } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/Drawer/store'
import { BucketStore } from 'kodo/stores/bucket'

import './style.less'

export default observer(function ImageManagement() {
  const mediaStyleStore = useInjection(MediaStyleDrawerStore)
  const bucketStore = useInjection(BucketStore)

  const [selectedBucketName, setSelectedBucketName] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = useCallback((value: string) => {
    setSelectedBucketName(value)
  }, [])

  const imageSolutionStore = useInjection(ImageSolutionStore)

  useEffect(() => {
    setLoading(true)
    imageSolutionStore.fetchBucketList().then(() => {
      onChange(imageSolutionStore.bucketNames[0])
    }).finally(() => setLoading(false))
  }, [imageSolutionStore, onChange])

  if (loading) {
    return (
      <Loading
        className="absolution-center"
        loading={loading}
      />
    )
  }

  if (selectedBucketName) {
    return (
      <>
        <MediaStyleDrawer
          {...mediaStyleStore}
          bucketName={selectedBucketName}
          region={bucketStore?.getDetailsByName(selectedBucketName)?.region ?? ''}
          onClose={mediaStyleStore.handleClose}
          key={`${selectedBucketName}-MediaStyleDrawer`}
        />

        <SelectBucket
          value={selectedBucketName}
          onChange={onChange}
        />
        <ObjectManage
          bucketName={selectedBucketName}
          isUploadModalOpen={false}
          key={`${selectedBucketName}-ObjectManage`}
        />
      </>
    )
  }

  return (
    <div className="absolution-center">
      <Empty />
    </div>
  )
})
