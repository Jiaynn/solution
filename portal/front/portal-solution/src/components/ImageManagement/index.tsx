import React, { useEffect, useState } from 'react'

import { useInjection } from 'qn-fe-core/di'

import SelectBucket from 'components/Configuration/SelectBucket'
import { BucketListStore } from 'kodo/stores/bucket/list'

import { ObjectManage } from 'kodo/components/BucketDetails/ObjectManage'

export default function ImageManagement() {
  const [selectedBucketName, setSelectedBucketName] = useState('')
  const bucketListStore = useInjection(BucketListStore)

  const onChange = (value: string) => {
    setSelectedBucketName(value)
  }

  useEffect(() => {
    bucketListStore.fetchList().then(() => {
      const { nameList } = bucketListStore
      setSelectedBucketName(nameList.slice().sort()[0])
    })
  }, [bucketListStore])

  return selectedBucketName !== ''
    ? (
      <>
        <SelectBucket
          defaultBucketName={selectedBucketName}
          onChange={onChange}
        />

        <ObjectManage
          bucketName={selectedBucketName}
          isUploadModalOpen={false}
        />
      </>
    )
    : null
}
