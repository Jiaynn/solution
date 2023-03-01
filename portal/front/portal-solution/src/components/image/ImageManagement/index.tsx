import React, { useCallback, useEffect, useState } from 'react'

import { useInjection } from 'qn-fe-core/di'

import { observer } from 'mobx-react'

import { Loading } from 'react-icecream-2'

import { Button, Icon } from 'react-icecream'

import { RouterStore } from 'portal-base/common/router'

import SelectBucket from 'components/common/SelectBucket'

import { ObjectManage } from 'kodo/components/BucketDetails/ObjectManage'
import ImageSolutionStore from 'store/imageSolution'
import { MediaStyleDrawer } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/Drawer'
import { MediaStyleDrawerStore } from 'kodo/components/BucketDetails/MediaStyle/CreateStyle/common/Drawer/store'
import { BucketStore } from 'kodo/stores/bucket'
import './style.less'
import { getSolutionPath } from 'constants/routes'

export default observer(function ImageManagement() {
  const mediaStyleStore = useInjection(MediaStyleDrawerStore)
  const bucketStore = useInjection(BucketStore)
  const imageSolutionStore = useInjection(ImageSolutionStore)
  const routerStore = useInjection(RouterStore)

  const [selectedBucketName, setSelectedBucketName] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = useCallback((value: string) => {
    setSelectedBucketName(value)
  }, [])

  const onCreateBucket = () => {
    routerStore.push(`${getSolutionPath('image')}/configuration/open-service`)
  }

  useEffect(() => {
    setLoading(true)
    imageSolutionStore.fetchBucketList().then(() => {
      onChange(imageSolutionStore.bucketNames[0])
    }).finally(() => setLoading(false))
  }, [imageSolutionStore, onChange])

  if (loading) {
    return (
      <Loading
        className="absolution-center"
        loading={loading}
      />
    )
  }

  if (selectedBucketName) {
    return (
      <>
        <MediaStyleDrawer
          {...mediaStyleStore}
          bucketName={selectedBucketName}
          region={bucketStore?.getDetailsByName(selectedBucketName)?.region ?? ''}
          onClose={mediaStyleStore.handleClose}
          key={`${selectedBucketName}-MediaStyleDrawer`}
        />

        <SelectBucket
          value={selectedBucketName}
          onChange={onChange}
        />
        <ObjectManage
          bucketName={selectedBucketName}
          isUploadModalOpen={false}
          key={`${selectedBucketName}-ObjectManage`}
        />
      </>
    )
  }

  return (
    <>
      <SelectBucket
        value="无空间"
        onChange={onChange}
      />

      <div className="card absolution-center">
        <Icon type="info" className="info-icon" />
        <h1 className="title">未创建图片存储空间</h1>
        <div className="description">您还没有创建图片的存储空间，有了图片存储空间后才可以对图片进行管理操作，请点击下方按钮前去开通服务后创建空间吧</div>
        <Button type="primary" onClick={onCreateBucket}>开通服务</Button>
      </div>
    </>
  )
})
