import { observer } from 'mobx-react'
import React from 'react'

import { Spin } from 'react-icecream'

import { useLocalStore } from 'qn-fe-core/local-store'

import styles from './style.m.less'
import UselessTooltip from '../../common/UselessTooltip'
import PiliDomainInfoStore from './store'
import { PiliDomainType } from 'apis/_types/interfactMarketingType'

export interface PiliDomainInfoProps {
  type: PiliDomainType
  hub: string
  domain: string
}

const DOMAIN_TITLE: { [key in PiliDomainType]: string } = {
  publishRtmp: 'RTMP/SRT推流',
  liveRtmp: 'RTMP播放',
  liveHls: 'HLS播放',
  liveHdl: 'HDL播放'
}

const PiliDomainInfo: React.FC<PiliDomainInfoProps> = observer(props => {
  const { type, domain } = props

  const store = useLocalStore(PiliDomainInfoStore, props)
  const { loadingHasGaba, loadingUsable, hasGaba, usable } = store

  return (
    <span className={styles.piliDomainInfo}>
      {type && <span>{`${DOMAIN_TITLE[type]}：`}</span>}
      <span className={styles.domainName}>{domain}</span>
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
    </span>
  )
})

export default PiliDomainInfo
