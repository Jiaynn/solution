/**
 * @file component ObjectPickerModal
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React, { useState } from 'react'

import { observer } from 'mobx-react'
import { useInjection } from 'qn-fe-core/di'
import { Modal, ModalFooter, Radio, RadioGroup } from 'react-icecream-2'

import { FileObject } from 'kodo-base/lib/components/ObjectManager/common/types'
import { ListItem, ObjectManagerProps, ObjectPicker } from 'kodo-base/lib/components/ObjectManager'

import { BucketStore } from 'kodo/stores/bucket'

import { KodoIamStore } from 'kodo/stores/iam'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { IFileResourceOptions, ResourceApis } from 'kodo/apis/bucket/resource'
import { IBucket } from 'kodo/apis/bucket'

import { ObjectPickerStore } from './store'
import { Upload } from './Upload'

import styles from './style.m.less'

type PickMode = 'upload' | 'picker'

function hasUploadPermission(iamStore: KodoIamStore, bucketName: string, bucketInfo: IBucket): boolean {
  if (!bucketInfo) return false

  if (bucketInfo.perm === ShareType.ReadOnly) {
    return false
  }

  if (iamStore.isActionDeny({ actionName: 'Upload', resource: bucketName })) {
    return false
  }

  return true
}

export const ObjectPickerModal = observer(function ObjectPickerModal() {
  const iamStore = useInjection(KodoIamStore)
  const bucketStore = useInjection(BucketStore)
  const resourceApis = useInjection(ResourceApis)
  const objectPickerStore = useInjection(ObjectPickerStore)
  const [pickMode, setPickMode] = useState<PickMode>('picker')
  const bucketInfo = bucketStore.getDetailsByName(objectPickerStore.bucket)
  const shouldAllowUpload = bucketInfo ? hasUploadPermission(iamStore, objectPickerStore.bucket, bucketInfo) : false

  const { bucket, accepts, picketed } = objectPickerStore

  const listApi = React.useMemo<ObjectManagerProps['list']['listApi']>(() => {
    if (!objectPickerStore.visible) return
    return (options: Omit<IFileResourceOptions, 'bucket'>) => (
      resourceApis.getFileResource({
        ...options,
        bucket
      })
    )
  }, [resourceApis, bucket, objectPickerStore.visible])

  React.useEffect(() => {
    objectPickerStore.setPicketed()
  }, [objectPickerStore, pickMode])

  React.useEffect(() => {
    // Modal 不可见时设置模式为初始的上传模式
    if (!objectPickerStore.visible) setPickMode('picker')
  }, [objectPickerStore.visible])

  return (
    <Modal
      width={880}
      autoDestroy
      className={styles.modal}
      title={objectPickerStore.title}
      visible={objectPickerStore.visible}
      onCancel={objectPickerStore.handleCancel}
      footer={(
        <ModalFooter
          cancelButtonProps={{ onClick: () => objectPickerStore.handleCancel() }}
          okButtonProps={{ disabled: !picketed, onClick: () => objectPickerStore.handleOk() }}
        />
      )}
    >
      <div className={styles.modalContent}>
        <div className={styles.radioGroup}>
          <RadioGroup
            radioType="button"
            value={pickMode}
            onChange={v => setPickMode(v)}
          >
            <Radio value="picker">空间内选择</Radio>
            <Radio disabled={!shouldAllowUpload} value="upload">上传文件</Radio>
          </RadioGroup>
        </div>
        {pickMode === 'picker' && (
          <ObjectPicker
            pageSize={50}
            listApi={listApi}
            accepts={accepts}
            scroll={{ y: 310 }}
            onChange={objectPickerStore.setPicketed}
            selected={picketed as FileObject<ListItem>}
          />
        )}
        {pickMode === 'upload' && shouldAllowUpload && (
          <Upload
            bucket={bucket}
            accepts={accepts}
            onChange={objectPickerStore.setPicketed}
          />
        )}
      </div>
    </Modal>
  )
})
