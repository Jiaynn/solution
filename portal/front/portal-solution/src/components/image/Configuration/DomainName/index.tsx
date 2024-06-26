import React, { useState, useEffect } from 'react'
import { Modal } from 'react-icecream/lib'
import { Query, RouterStore } from 'portal-base/common/router'
import { useInjection } from 'qn-fe-core/di'

import DomainCreateWithQuery from 'cdn/components/Domain/Create'
import Domain from 'kodo/components/BucketDetails/Domain'
import { DomainStore } from 'kodo/stores/domain'
import SelectBucket from 'components/image/common/SelectBucket'

import BucketStore from 'cdn/stores/bucket'
import ImageSolutionStore from 'store/imageSolution'
import { imagePath } from 'utils/router'

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
    return domainStore.fetchCDNDomainListByBucketName(bucketName).then(() => {
      handleVisible(false)
    })
  }

  const onChange = (value: string) => {
    domainStore.fetchCDNDomainListByBucketName(value).then(() => {
      routerStore.push(
        `${imagePath}/configuration/step/2?bucket=${value}&configurationState=${query.configurationState}&fixBucket`
      )
    })
  }

  useEffect(() => {
    const state = JSON.parse(String(query.configurationState || false))
    Promise.all([
      imageSolutionStore.fetchBucketList(),
      bucketStore.fetchBuckets(true)
    ]).then(() => {
      setVisible(!state)
    })
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
          onCreate={() => handleCreate()}
          onCancel={() => setVisible(false)}
        />
      </Modal>
      <SelectBucket value={bucketName} onChange={onChange} />
      <Domain bucketName={bucketName} visible={value => handleVisible(value)} />
    </div>
  )
}
