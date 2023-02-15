import React, { useEffect, useState } from 'react'

import { useInjection } from 'qn-fe-core/di'

import { Loading } from 'react-icecream-2'

import SelectBucket from 'components/Configuration/SelectBucket'

import { ObjectManage } from 'kodo/components/BucketDetails/ObjectManage'
import { SolutionApis } from 'apis/imageSolution'

export default function ImageManagement() {
  const [selectedBucketName, setSelectedBucketName] = useState('')
  const [loading, setLoading] = useState(true)
  const onChange = (value: string) => {
    setSelectedBucketName(value)
  }

  const solutionApi = useInjection(SolutionApis)

  useEffect(() => {
    solutionApi.getBucketList({ page_num: 1, page_size: 100, solution_code: 'image' }).then(res => {
      const bucket = res.list[0].bucket_id
      setSelectedBucketName(bucket)
    })
    setLoading(false)
  }, [solutionApi])

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
