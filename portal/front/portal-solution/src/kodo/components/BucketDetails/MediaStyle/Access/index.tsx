import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { Divider, Drawer, DrawerFooter } from 'react-icecream-2'

import { BucketStore } from 'kodo/stores/bucket'

import OriginalProtected from './OriginalProtected'
import StyleSeparator from './Separator'

import styles from './style.m.less'

interface Props {
  bucketName: string

  visible: boolean
  onClose: () => void
  onRefresh: () => void
}

export default function AccessSetting(props: Props) {
  const bucketStore = useInjection(BucketStore)
  const toasterStore = useInjection(ToasterStore)
  const [styleSeparatorChanged, setStyleSeparatorChanged] = React.useState(false)
  const [originalProtectedChanged, setOriginalProtectedChanged] = React.useState(false)
  const [styleSeparatorSubmit, setStyleSeparatorSubmit] = React.useState<() => Promise<any>>()
  const [originalProtectedSubmit, setOriginalProtectedSubmit] = React.useState<() => Promise<any>>()

  const handleSubmit = React.useCallback(async () => {
    if (styleSeparatorSubmit != null && styleSeparatorChanged) {
      const req = styleSeparatorSubmit()
      toasterStore.promise(req)
      await req
    }

    if (originalProtectedSubmit != null && originalProtectedChanged) {
      const req = originalProtectedSubmit()
      toasterStore.promise(req)
      await req
    }

    props.onClose()

    if (styleSeparatorChanged || originalProtectedChanged) {
      toasterStore.success('访问设置更新成功')
      props.onRefresh()
    }
  }, [
    props,
    toasterStore,
    styleSeparatorChanged,
    originalProtectedChanged,
    styleSeparatorSubmit,
    originalProtectedSubmit
  ])

  React.useEffect(() => {
    if (!props.visible) return
    if (!props.bucketName) return
    toasterStore.promise(bucketStore.fetchDetailsByName(props.bucketName))
  }, [bucketStore, props.bucketName, props.visible, toasterStore])

  return (
    <Drawer
      width={640}
      title="访问设置"
      onOk={handleSubmit}
      visible={props.visible}
      onCancel={props.onClose}
      footer={(
        <DrawerFooter
          okButtonProps={{
            disabled: !styleSeparatorChanged && !originalProtectedChanged
          }}
        />
      )}
    >
      {props.visible && (
        <>
          <OriginalProtected
            bucketName={props.bucketName}
            onChanged={setOriginalProtectedChanged}
            onSubmitChange={v => setOriginalProtectedSubmit(() => v)}
          />
          <Divider className={styles.divider} />
          <StyleSeparator
            bucketName={props.bucketName}
            onChanged={setStyleSeparatorChanged}
            onSubmitChange={v => setStyleSeparatorSubmit(() => v)}
          />
        </>
      )}
    </Drawer >
  )
}
