import React, { useEffect, useState } from 'react'

import { useInjection } from 'qn-fe-core/di'

import { Loading } from 'react-icecream-2'

import SelectBucket from 'components/Configuration/SelectBucket'
import { BucketListStore } from 'kodo/stores/bucket/list'

import { ObjectManage } from 'kodo/components/BucketDetails/ObjectManage'

export default function ImageManagement() {
  const [selectedBucketName, setSelectedBucketName] = useState('')
  const bucketListStore = useInjection(BucketListStore)
  const [loading, setLoading] = useState(true)
  const onChange = (value: string) => {
    setSelectedBucketName(value)
  }

  useEffect(() => {
    bucketListStore.fetchList().then(() => {
      const { nameList } = bucketListStore
      setSelectedBucketName(nameList.slice().sort()[0])
    })
    setLoading(false)
  }, [bucketListStore])

  return selectedBucketName !== '' && !loading
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
    : <Loading loading={loading} style={{ marginTop: '25%' }} />
}
