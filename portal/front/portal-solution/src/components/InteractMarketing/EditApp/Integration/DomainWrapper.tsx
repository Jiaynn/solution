import { observer } from 'mobx-react'
import { ToasterStore } from 'portal-base/common/toaster'
import { useInjection } from 'qn-fe-core/di'
import React, { useState, useEffect } from 'react'

import { Spin } from 'react-icecream'

import { InteractMarketingApis } from 'apis/interactMarketing'

import styles from './style.m.less'

interface DomainWrapperProps {
  domain: string
}

const DomainWrapper: React.FC<DomainWrapperProps> = observer(props => {
  const { domain } = props
  const apis = useInjection(InteractMarketingApis)
  const toaster = useInjection(ToasterStore)

  // 是否备案
  const [hasGaba, setHasGaba] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apis
      .getDomainStatus(domain)
      .then(res => {
        if (res) {
          setHasGaba(res?.hasGaba)
        }
      })
      .finally(() => {
        setLoading(false)
      })
      .catch(e => {
        toaster.error(e)
      })
  }, [apis, domain, toaster])

  return (
    <div className={styles.domainWrapper}>
      <span className={styles.domain}>{domain}</span>
      <span className={styles.gaba}>
        <Spin spinning={loading}>
          {loading && '查询备案中'}
          {!hasGaba && '(未公安备案)'}
        </Spin>
      </span>
    </div>
  )
})

export default DomainWrapper
