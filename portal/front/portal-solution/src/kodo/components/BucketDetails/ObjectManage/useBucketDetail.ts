/**
 * @desc useBucketDetail
 * @author hovenjay <hovenjay@outlook.com>
 */

import { useState, useEffect } from 'react'
import { useInjection } from 'qn-fe-core/di'

import { BucketStore } from 'kodo/stores/bucket'

import { IBucket } from 'kodo/apis/bucket'

export function useBucketDetail(bucketName: string): IBucket | undefined {
  const bucketStore = useInjection(BucketStore)
  const [bucketDetail, setBucketDetail] = useState<IBucket | undefined>(undefined)

  useEffect(() => {
    const bucketInfo = bucketStore.getDetailsByName(bucketName)
    if (bucketInfo != null) {
      setBucketDetail(bucketStore.getDetailsByName(bucketName))
      return
    }

    bucketStore.fetchDetailsByName(bucketName).then(setBucketDetail)
  }, [bucketName, bucketStore])

  return bucketDetail
}
