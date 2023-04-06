import { useLocalStore } from 'portal-base/common/utils/store'
import React from 'react'
import { Spin } from 'react-icecream'

import { observer } from 'mobx-react-lite'

import UselessTooltip from 'components/InteractMarketing/common/UselessTooltip'

import KodoDomainInfoStore from './store'

import styles from './style.m.less'

export interface KodoDomainInfoProps {
  bucket: string
  domain: string
}

const KodoDomainInfo: React.FC<KodoDomainInfoProps> = observer(
  (props: KodoDomainInfoProps) => {
    const { domain } = props
    const store = useLocalStore(KodoDomainInfoStore, props)
    const { loadingHasGaba, loadingUsable, hasGaba, usable } = store

    return (
      <div className={styles.kodoDomainInfo}>
        <span className={styles.domainName} title={domain}>
          {domain}
        </span>
        <span className={styles.gaba}>
          <Spin spinning={loadingHasGaba} style={{ display: 'inline-block' }}>
            {loadingHasGaba && '查询备案中'}
            {!hasGaba && '未公安备案'}
          </Spin>

          <UselessTooltip
            className={styles.tooltip}
            infoName="域名"
            loading={loadingUsable}
            usable={usable}
          />
        </span>
      </div>
    )
  }
)

export default KodoDomainInfo
