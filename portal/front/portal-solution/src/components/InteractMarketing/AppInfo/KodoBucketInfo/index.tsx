import { observer } from 'mobx-react-lite'
import { useLocalStore } from 'qn-fe-core/local-store'
import React from 'react'

import styles from './style.m.less'
import KodoBucketInfoStore from './store'
import UselessTooltip from 'components/InteractMarketing/common/UselessTooltip'

export interface KodoBucketInfoProps {
  bucket: string
}

const KodoBucketInfo: React.FC<KodoBucketInfoProps> = observer(props => {
  const { bucket } = props
  const store = useLocalStore(KodoBucketInfoStore, props)
  const { loadingUsable, usable } = store
  return (
    <div className={styles.wrapper}>
      {bucket}
      <UselessTooltip
        infoName="存储空间"
        loading={loadingUsable}
        usable={usable}
      />
    </div>
  )
})
export default KodoBucketInfo
