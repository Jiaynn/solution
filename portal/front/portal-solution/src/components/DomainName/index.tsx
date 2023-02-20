/* eslint-disable react/jsx-no-bind */
import React, { useState, useEffect } from 'react'
import { Modal } from 'react-icecream/lib'

import { Query, RouterStore } from 'portal-base/common/router'

import { useInjection } from 'qn-fe-core/di'

import DomainCreateWithQuery from '../../cdn/components/Domain/Create'
import Domain from 'kodo/components/BucketDetails/Domain'
import { DomainStore } from 'kodo/stores/domain'
import SelectBucket from 'components/Configuration/SelectBucket'

import { basename } from 'constants/routes'
import BucketStore from 'cdn/stores/bucket'
import ImageSolutionStore from 'store/imageSolution'

interface DomainNameProps {
  query: Query;
}

export default function DomainName(props: DomainNameProps) {
  const { query } = props
  const domainStore = useInjection(DomainStore)
  const routerStore = useInjection(RouterStore)
  const bucketStore = useInjection(BucketStore)
  const imageSolutionStore = useInjection(ImageSolutionStore)
  const bucketName = String(query.bucket)

  const [visible, setVisible] = useState(false)
  function handleVisible(isVisible: boolean) {
    setVisible(isVisible)
  }

  function handleCreate() {
    return domainStore.fetchCDNDomainListByBucketName(bucketName)
  }

  const onChange = (value: string) => {
    routerStore.push(
      `${basename}/configuration/step/2?bucket=${value}&configurationState=${query.configurationState}&fixBucket`
    )
    domainStore.fetchCDNDomainListByBucketName(value)
  }
  useEffect(() => {
    imageSolutionStore.fetchBucketList()
    const state = JSON.parse(String(query.configurationState))
    bucketStore.fetchBuckets(true)
    if (!state) {
      setVisible(true)

    } else {
      setVisible(false)
    }
  }, [bucketStore, query.configurationState, imageSolutionStore])

  return (
    <div>
      <Modal
        title="绑定CDN加速域名"
        visible={visible}
        width={800}
        onCancel={() => setVisible(false)}
        footer={null}
        destroyOnClose
      >
        <DomainCreateWithQuery
          query={query}
          modalVisible={handleVisible}
          isCreateDomain={handleCreate}
        />
      </Modal>
      <SelectBucket value={bucketName} onChange={onChange} />
      <Domain bucketName={bucketName} visible={handleVisible} />
    </div>
  )
}
