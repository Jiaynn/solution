import { useInjection } from 'qn-fe-core/di'
import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'

import { I18nStore } from 'portal-base/common/i18n'

import { getUsagePageConfig } from 'cdn/components/Statistics/config'
import IamInfo from 'cdn/constants/iam-info'

import Statistics from 'cdn/components/Statistics'
import SelectBucket from 'components/image/common/SelectBucket'
import ImageSolutionStore from 'store/imageSolution'

export default observer(function CDNOverview() {
  const iamInfo = useInjection(IamInfo)
  const i18nStore = useInjection(I18nStore)
  const imageSolutionStore = useInjection(ImageSolutionStore)

  useEffect(() => {
    imageSolutionStore.fetchBucketList()
  }, [imageSolutionStore])

  const onChange = (name: string) => {
    imageSolutionStore.updateCurrentBucket(name)
    imageSolutionStore.fetchCurrentDomains()
  }

  return (
    <>
      <SelectBucket value={imageSolutionStore.currentBucket} onChange={onChange} />
      <Statistics
        type="usage"
        pageConfig={getUsagePageConfig(iamInfo, i18nStore)}
      />
    </>
  )
})
