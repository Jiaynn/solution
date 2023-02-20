import React, { useEffect, useState } from 'react'

import { useInjection } from 'qn-fe-core/di'

import { Loading } from 'react-icecream-2'

import { observer } from 'mobx-react'

import SelectBucket from 'components/Configuration/SelectBucket'

import { ObjectManage } from 'kodo/components/BucketDetails/ObjectManage'
import ImageSolutionStore from 'store/imageSolution'
import { MediaStyleDrawer } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/Drawer'
import { MediaStyleDrawerStore } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/Drawer/store'
import { BucketStore } from 'kodo/stores/bucket'

export default observer(function ImageManagement() {
  const [selectedBucketName, setSelectedBucketName] = useState('')
  const [loading, setLoading] = useState(true)
  const mediaStyleStore = useInjection(MediaStyleDrawerStore)
  const bucketStore = useInjection(BucketStore)

  const onChange = (value: string) => {
    setSelectedBucketName(value)
  }

  const imageSolutionStore = useInjection(ImageSolutionStore)

  useEffect(() => {
    imageSolutionStore.fetchBucketList().then(() => {
      setSelectedBucketName(imageSolutionStore.bucketNames[0])
    })
    setLoading(false)
  }, [imageSolutionStore])

  return selectedBucketName !== '' && !loading
    ? (
      <>
        <MediaStyleDrawer
          {...mediaStyleStore}
          bucketName={selectedBucketName}
          region={bucketStore?.getDetailsByName(selectedBucketName)?.region ?? ''}
          onClose={mediaStyleStore.handleClose}
        />

        <SelectBucket
          value={selectedBucketName}
          onChange={onChange}
        />
        <ObjectManage
          bucketName={selectedBucketName}
          isUploadModalOpen={false}
        />
      </>
    )
    : <Loading loading={loading} style={{ marginTop: '25%' }} />
})
