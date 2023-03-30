import { observer } from 'mobx-react-lite'
import { useLocalStore } from 'qn-fe-core/local-store'
import React from 'react'

import styles from './style.m.less'
import PiliHubInfoStore from './store'
import UselessTooltip from 'components/InteractMarketing/common/UselessTooltip'

export interface PiliHubInfoProps {
  hub: string
}

const PiliHubInfo: React.FC<PiliHubInfoProps> = observer(props => {
  const { hub } = props
  const store = useLocalStore(PiliHubInfoStore, props)
  const { loadingUsable, usable } = store
  return (
    <div className={styles.wrapper}>
      {hub}
      <UselessTooltip
        infoName="直播空间"
        loading={loadingUsable}
        usable={usable}
      />
    </div>
  )
})
export default PiliHubInfo
