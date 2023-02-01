/**
 * @description style create/edit drawer
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { observer } from 'mobx-react'
import { Icon,Modal } from 'react-icecream/lib'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { useLocalStore } from 'qn-fe-core/local-store'

import { BucketStore } from 'kodo/stores/bucket'

import HelpDocLink from 'kodo/components/common/HelpDocLink'

import { ImageStyleApis, MediaStyle } from 'kodo/apis/bucket/image-style'
import { EditMode } from './constants'
import { useDoraImageConfig } from '../Image'
import Preview from './Preview'
import Form from './Form'
import { LocalStore } from './store'

import styles from './style.m.less'

interface Props {
  style?: MediaStyle
  bucketName: string
  visible: boolean
  onSave: () => void
  onClose: () => void
}

export default observer(function StyleDrawer(props: Props) {
  const bucketStore = useInjection(BucketStore)
  const toasterStore = useInjection(ToasterStore)
  const imageStyleApis = useInjection(ImageStyleApis)
  const doraImageConfig = useDoraImageConfig(props.bucketName)
  const { style, bucketName, visible, onSave, onClose } = props
  const store = useLocalStore(LocalStore, { style, doraImageConfig })
  const [modalVisible, setModalVisible] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isCreated = !style
  const isEditMode = !!style
  const title = React.useMemo(() => (
    <div>
      {isCreated ? '新建' : '编辑'}图片处理样式
      <HelpDocLink doc="imageStyleIntro" className={styles.docIcon}><Icon type="file-text" /></HelpDocLink>
    </div>
  ), [isCreated])

  React.useEffect(() => {
    if (visible) {
      store.createFormState(style)
      if (isCreated) setModalVisible(true)
    } else {
      store.form.reset()
      store.updateCode('')
    }
  }, [style, store, visible, isCreated])

  React.useEffect(() => {
    if (visible) {
      const bucketInfo = bucketStore.getDetailsByName(bucketName)
      if (!bucketInfo) {
        toasterStore.error('暂无空间信息')
      }
    }
  }, [visible, bucketName, bucketStore, toasterStore])

  const onSubmit = React.useCallback(
    async () => {
      try {
        // 确认校验一下
        setIsSubmitting(true)
        if (!await store.validateCanSave()) return

        const bucketInfo = bucketStore.getDetailsByName(bucketName)
        if (!bucketInfo) {
          toasterStore.error('暂无空间信息')
          return
        }

        const fields = store.form.$
        const styleName = fields.name.value
        if (isCreated && bucketInfo.styles && typeof bucketInfo.styles === 'object' && bucketInfo.styles[styleName]) {
          toasterStore.error(`${bucketName} 已存在 ${styleName} 图片样式`)
          return
        }

        const code = fields.editMode.value === EditMode.Manual ? fields.code.value : store.code
        await imageStyleApis.saveImageStyle(bucketName, [{ name: styleName, commands: code }])
        onSave()
      } catch (e) {
        toasterStore.error(e)
      } finally {
        setIsSubmitting(false)
      }
    },
    [bucketName, bucketStore, imageStyleApis, isCreated, onSave, store, toasterStore]
  )

  const handleSceneChange = React.useCallback(
    commands => store.createFormState({ name: store.form.$.name.value || '', commands }),
    [store]
  )

  const isEqual = store.form.$.code.value === store.code
  const isManualMode = store.form.$.editMode.value === EditMode.Manual
  const previewStyle: MediaStyle = { name: store.form.$.name.value, commands: store.code }

  const handleUpdateCode = React.useMemo(() => {
    const fn = () => {
      store.syncFormCodeFieldToCode()
      return isEqual
    }
    return isManualMode ? fn : undefined
  }, [isManualMode, isEqual, store])

  return (
    <Modal width={1240} title={title} visible={visible} onCancel={onClose} footer={null} destroyOnClose>
      <div className={styles.drawer}>
        <Form
          isEditMode={isEditMode}
          bucketName={bucketName}
          nameInputDisabled={!!style}
          onCodeChange={store.updateCode}
          formState={store.form}
          canSave={store.canSave}
          modalVisible={modalVisible}
          isSubmitting={isSubmitting}
          onModalVisibleChange={setModalVisible}
          onSubmit={onSubmit}
          onClose={onClose}
          onSceneChange={handleSceneChange}
        />
        <Preview
          style={previewStyle}
          bucketName={bucketName}
          commandsVisible={!isManualMode}
          onUpdateCode={handleUpdateCode}
        />
      </div>
    </Modal>
  )
})
