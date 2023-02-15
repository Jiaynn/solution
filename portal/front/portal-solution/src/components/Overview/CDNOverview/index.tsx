import { useInjection } from 'qn-fe-core/di'
import React from 'react'
import { observer } from 'mobx-react-lite'

import { I18nStore } from 'portal-base/common/i18n'

import { getUsagePageConfig } from 'cdn/components/Statistics/config'
import IamInfo from 'cdn/constants/iam-info'

import Statistics from 'cdn/components/Statistics'

export default observer(function CDNOverview() {
  const iamInfo = useInjection(IamInfo)
  const i18nStore = useInjection(I18nStore)
  return (
    <Statistics
      type="usage"
      pageConfig={getUsagePageConfig(iamInfo, i18nStore)}
    />
  )
})