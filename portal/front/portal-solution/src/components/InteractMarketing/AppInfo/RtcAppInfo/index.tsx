import { observer } from 'mobx-react-lite'
import { useLocalStore } from 'qn-fe-core/local-store'
import React from 'react'

import styles from './style.m.less'
import RtcAppInfoStore from './store'
import UselessTooltip from 'components/InteractMarketing/common/UselessTooltip'

export interface RtcAppInfoProps {
  rtcApp: string
}

const RtcAppInfo: React.FC<RtcAppInfoProps> = observer(props => {
  const { rtcApp } = props
  const store = useLocalStore(RtcAppInfoStore, props)
  const { loadingUsable, usable } = store
  return (
    <div className={styles.wrapper}>
      {rtcApp}
      <UselessTooltip
        infoName="RTC应用"
        loading={loadingUsable}
        usable={usable}
      />
    </div>
  )
})
export default RtcAppInfo
