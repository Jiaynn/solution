import { useInjection } from 'qn-fe-core/di'

import { BucketStore } from 'kodo/stores/bucket'
import { ConfigStore } from 'kodo/stores/config'

export function useMediaStyleImageConfig(bucketName: string) {
  const bucketStore = useInjection(BucketStore)
  const configStore = useInjection(ConfigStore)
  const bucketInfo = bucketStore.getDetailsByName(bucketName)

  return bucketInfo && configStore.getRegion({ region: bucketInfo.region }).dora.mediaStyle.image
}

export function useMediaStyleVideoConfig(bucketName: string) {
  const bucketStore = useInjection(BucketStore)
  const configStore = useInjection(ConfigStore)
  const bucketInfo = bucketStore.getDetailsByName(bucketName)

  return bucketInfo && configStore.getRegion({ region: bucketInfo.region }).dora.mediaStyle.video
}
