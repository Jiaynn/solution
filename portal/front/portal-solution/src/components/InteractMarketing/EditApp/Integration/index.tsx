import React from 'react'

import { observer } from 'mobx-react'

import { useInjection } from 'qn-fe-core/di'

import AppConfigStore from 'store/interactMarketing/appConfig'

import styles from './style.m.less'

import ConfigPili from './ConfigPili'
import ConfigRtc from './ConfigRtc'
import ConfigKodo from './ConfigKodo'

export interface IntegrationProps {}

const Integration = observer((_props: IntegrationProps) => {
  const appConfigStore = useInjection(AppConfigStore)
  const { isSelectedSafeComp } = appConfigStore
  return (
    <div className={styles.wrapper}>
      <ConfigPili />
      <ConfigRtc />
      {isSelectedSafeComp && <ConfigKodo />}
    </div>
  )
})

export default Integration
