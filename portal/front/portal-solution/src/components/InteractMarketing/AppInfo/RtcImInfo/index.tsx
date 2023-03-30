import { useLocalStore } from 'portal-base/common/utils/store'
import React from 'react'

import { observer } from 'mobx-react-lite'

import UselessTooltip from 'components/InteractMarketing/common/UselessTooltip'

import RtcImInfoStore from './store'

import styles from './style.m.less'

export interface RtcImInfoProps {
  rtcApp: string
  im: string
}

const RtcImInfo: React.FC<RtcImInfoProps> = observer(
  (props: RtcImInfoProps) => {
    const { im } = props
    const store = useLocalStore(RtcImInfoStore, props)
    const { loadingUsable, usable } = store

    return (
      <div className={styles.wrapper}>
        {im}
        <UselessTooltip
          className={styles.tooltip}
          infoName="IM应用"
          loading={loadingUsable}
          usable={usable}
        />
      </div>
    )
  }
)

export default RtcImInfo
