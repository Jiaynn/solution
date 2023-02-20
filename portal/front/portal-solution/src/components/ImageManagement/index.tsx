import React, { useEffect, useState } from 'react'

import { useInjection } from 'qn-fe-core/di'

import { Loading } from 'react-icecream-2'

import SelectBucket from 'components/Configuration/SelectBucket'

import { ObjectManage } from 'kodo/components/BucketDetails/ObjectManage'
import ImageSolutionStore from 'store/imageSolution'

export default function ImageManagement() {
  const [selectedBucketName, setSelectedBucketName] = useState('')
  const [loading, setLoading] = useState(true)
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
}
