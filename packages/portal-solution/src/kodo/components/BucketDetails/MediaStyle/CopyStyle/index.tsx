
import React from 'react'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'
import { DownThinIcon, UpThinIcon } from 'react-icecream-2/icons'
import { FormItem, MenuItem, Modal, Table, TableType, ModalFooter, Button } from 'react-icecream-2'

import { sensorsTagFlag } from 'kodo/utils/sensors'

import { KodoIamStore } from 'kodo/stores/iam'

import { ShareType } from 'kodo/constants/bucket/setting/authorization'

import { BucketSelect } from 'kodo/components/common/BucketSelect'

import { IBucketListItem } from 'kodo/apis/bucket/list'
import { ImageStyleApis, MediaStyle } from 'kodo/apis/bucket/image-style'

import styles from './style.m.less'

interface ModalProps {
  bucketName: string
  styles: MediaStyle[]
  visible: boolean
  onClose: () => void
}

const MediaStyleTable: TableType<MediaStyle> = Table

function BatchCopyModal(props: ModalProps) {
  const { visible, onClose } = props

  const iamStore = useInjection(KodoIamStore)
  const toasterStore = useInjection(ToasterStore)
  const imageStyleApis = useInjection(ImageStyleApis)
  const [loading, setLoading] = React.useState(false)
  const [showTable, setShowTable] = React.useState(false)
  const [bucket, setBucket] = React.useState<string | null | undefined>()
  const [forceCopyList, setForceCopyList] = React.useState<string[]>([])
  const [ignoreCopyList, setIgnoreCopyList] = React.useState<string[]>([])
  const [existingStyle, setExistingStyle] = React.useState<MediaStyle[]>([])

  const paddingStyles = React.useMemo(() => (
    props.styles.filter(style => !ignoreCopyList.includes(style.name))
  ), [ignoreCopyList, props.styles])

  const hasUnresolvedConflict = React.useMemo(() => {
    const existingNameSet = new Set(existingStyle.map(i => i.name))
    const conflictStyles = props.styles.filter(style => existingNameSet.has(style.name))
    return conflictStyles.some(style => !forceCopyList.includes(style.name) && !ignoreCopyList.includes(style.name))
  }, [existingStyle, forceCopyList, ignoreCopyList, props.styles])

  const fetchStyleIamPermission = React.useCallback(() => {
    setLoading(true)
    const promise = iamStore.fetchResourceByActions(
      ['GetBucketStyle', 'PutImageStyle']
    )
      .catch(() => { /* */ })
      .finally(() => setLoading(false))
    toasterStore.promise(promise)
  }, [iamStore, toasterStore])

  const handleBucketDisableCheck = (bucketItem: IBucketListItem) => {
    if (bucketItem.tbl === props.bucketName) return '当前所在空间'
    if (bucketItem.perm !== ShareType.Own) return '非自有空间'
    if (
      iamStore.isActionDeny({ actionName: 'GetBucketStyle', resource: bucketItem.tbl })
      || iamStore.isActionDeny({ actionName: 'PutImageStyle', resource: bucketItem.tbl })
    ) return '当前用户无此空间多媒体样式读写权限'
    return false
  }

  const handleCopy = async () => {
    if (loading) return

    if (!bucket) {
      return toasterStore.warning('请选择目标空间')
    }

    setLoading(true)

    // 请求目标空间的多媒体样式数据
    if (existingStyle.length === 0) { // 如果还未获取目标空间样式，则请求接口
      const fetchStylesPromise = imageStyleApis.getImageStyles(bucket)
      toasterStore.promise(fetchStylesPromise).catch(() => setLoading(false))
      const existingStyles = await fetchStylesPromise
      setExistingStyle(existingStyles)

      // 检查冲突
      const existingNameSet = new Set(existingStyles.map(i => i.name))
      const conflictStyles = props.styles.filter(style => existingNameSet.has(style.name))
      if (conflictStyles.length > 0) {
        setLoading(false)
        setShowTable(true)
        return toasterStore.error('请解决样式冲突后重试')
      }
    } else if (hasUnresolvedConflict) {
      setLoading(false)
      setShowTable(true)
      return toasterStore.error('有样式冲突尚未解决')
    }

    // 保存
    const savePromise = imageStyleApis.saveImageStyle(bucket, paddingStyles)
    const successText = `成功复制 ${paddingStyles.length} 个样式到 ${bucket} 空间`
    toasterStore.promise(savePromise, successText).finally(() => {
      setBucket(undefined)
      setLoading(false)
      props.onClose()
    })
  }

  const switchButtonView = React.useMemo(() => (
    <Button
      type="link"
      onClick={() => setShowTable(v => !v)}
      endIcon={(showTable ? <DownThinIcon /> : <UpThinIcon />)}
    >
      {showTable ? '收起' : '展开'}
    </Button>
  ), [showTable])

  React.useEffect(() => {
    if (!hasUnresolvedConflict) return
    setShowTable(true)
  }, [hasUnresolvedConflict])

  React.useEffect(() => {
    if (visible) fetchStyleIamPermission()
  }, [fetchStyleIamPermission, visible])

  React.useEffect(() => {
    setExistingStyle([])
    setForceCopyList([])
    setIgnoreCopyList([])
  }, [bucket])

  return (
    <Modal
      width={650}
      visible={visible}
      onOk={handleCopy}
      onCancel={onClose}
      title="复制到其他空间"
      footer={(
        <ModalFooter
          cancelButtonProps={{ disabled: loading, onClick: onClose }}
          okButtonProps={{
            loading,
            onClick: handleCopy,
            disabled: loading || hasUnresolvedConflict || paddingStyles.length === 0
          }}
        />
      )}
    >
      <span className={styles.contentText}>
        已选择 {props.styles.length} 个样式。{switchButtonView}
      </span>
      {showTable && (
        <div className={styles.todoDeleteList}>
          <MediaStyleTable border="none" size="small" records={props.styles}>
            <MediaStyleTable.Column title="样式名称"
              render={(_, item) => {
                const isConflict = existingStyle.find(i => i.name === item.name)
                const isIgnore = ignoreCopyList.find(i => i === item.name)
                const isForce = forceCopyList.find(i => i === item.name)

                if (isForce || isIgnore) return (<span>{item.name}</span>)
                if (isConflict) return (<span className={styles.dangerStatus}>{item.name}</span>)
                return (<span>{item.name}</span>)
              }} />
            <MediaStyleTable.Column title="状态"
              width="40px"
              render={(_, item) => {
                const isConflict = existingStyle.find(i => i.name === item.name)
                const isIgnore = ignoreCopyList.find(i => i === item.name)
                const isForce = forceCopyList.find(i => i === item.name)

                if (isForce) return (<span>覆盖样式</span>)
                if (isIgnore) return (<span>取消复制</span>)
                if (isConflict) return (<span className={styles.dangerStatus}>样式名冲突</span>)
                return null
              }} />
            <MediaStyleTable.Column title="操作"
              width="40px"
              render={(_, item) => {
                const isConflict = existingStyle.find(i => i.name === item.name)

                const handleSetForce = () => {
                  setIgnoreCopyList(v => v.filter(i => i !== item.name))
                  setForceCopyList(v => [...v.filter(i => i !== item.name), item.name])
                }

                const handleSetIgnore = () => {
                  setForceCopyList(v => v.filter(i => i !== item.name))
                  setIgnoreCopyList(v => [...v.filter(i => i !== item.name), item.name])
                }

                return isConflict && (
                  <>
                    <Button
                      type="link"
                      size="small"
                      onClick={handleSetForce}
                      className={styles.operateIcon}
                      disabled={forceCopyList.includes(item.name) || loading}
                    >
                      覆盖
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      onClick={handleSetIgnore}
                      className={styles.operateIcon}
                      disabled={ignoreCopyList.includes(item.name) || loading}
                    >
                      取消
                    </Button>
                  </>
                )
              }} />
          </MediaStyleTable>
        </div>
      )}
      <FormItem className={styles.bucketSelectForm} layout="horizontal" label="选择空间">
        <BucketSelect<string>
          value={bucket}
          onChange={setBucket}
          className={styles.bucketSelect}
          disableCheck={handleBucketDisableCheck}
        />
      </FormItem>
    </Modal>
  )
}

interface Props {
  styles: MediaStyle[]
  bucketName: string
}

export function CopyStyleMenu(props: Props) {
  const [visible, setVisible] = React.useState(false)

  return (
    <>
      <BatchCopyModal
        visible={visible}
        styles={props.styles}
        key={String(visible)}
        bucketName={props.bucketName}
        onClose={() => setVisible(false)}
      />
      <MenuItem
        onClick={() => setVisible(true)}
        rootHtmlProps={sensorsTagFlag('portalKodo@mediaStyle-batchCopy') as any}
      >
        复制到其他空间
      </MenuItem>
    </>
  )
}
