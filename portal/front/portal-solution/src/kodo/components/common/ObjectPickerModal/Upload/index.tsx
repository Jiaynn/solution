/**
 * @file upload component
 * @author yinxulai <yinxulai@qiniu.com>
 */

import React, { useRef } from 'react'
import { Progress, Button } from 'react-icecream/lib'
import { AddIcon, CheckCircleFilledIcon, CloseCircleFilledIcon } from 'react-icecream-2/icons'
import { Accept } from 'kodo-base/lib/components/ObjectManager/ObjectList/Picker'

import { humanizeStorageSize } from 'kodo/transforms/unit'
import { useUploadController } from './upload'
import { PathInput } from './PathInput'
import { Dragger } from './Dragger'

import styles from './style.m.less'

interface Props {
  bucket: string
  accepts: Accept[]
  onChange: (value?: UploadResult) => void
}

export interface UploadResult {
  key: string
  fsize: number
  mimeType: string
}

export function Upload(props: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadPath, setUploadPath] = React.useState('')
  const controller = useUploadController<UploadResult>(props.bucket)

  const handleClickInput = React.useCallback(() => {
    if (fileInputRef.current == null) return
    fileInputRef.current.click()
  }, [])

  const handleUploadFile = React.useCallback(async (file: File) => {
    controller.upload(file, uploadPath, file.name)
  }, [controller, uploadPath])

  const handleChangeFile = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target == null || event.target.files == null || event.target.files.length === 0) return
    const file = event.target.files[0]
    handleUploadFile(file)
    event.target.value = ''
  }, [handleUploadFile])

  React.useEffect(() => {
    props.onChange(controller.uploadedInfo)
  }, [controller.uploadedInfo, props])

  // 上传前显示的内容（对应 none 状态）
  const noneView = React.useMemo(() => {
    const acceptsTexts = props.accepts.map(accept => (
      `${accept.name}文件大小不超过 ${humanizeStorageSize(accept.maxSize)}`
    )).join('、')

    return (
      <Dragger accepts={props.accepts} onFile={handleUploadFile}>
        <div className={styles.content}>
          <AddIcon className={styles.icon} />
          <span>点击或者拖入文件到此处上传</span>
          <span>{acceptsTexts}</span>
        </div>
      </Dragger>
    )
  }, [handleUploadFile, props.accepts])

  // 上传失败显示的内容
  const failureView = React.useMemo(() => (
    <div className={styles.content}>
      <CloseCircleFilledIcon
        width={40}
        height={40}
        className={styles.errorIcon}
      />
      <span className={styles.statusTitle}>
        上传失败
      </span>
      <span className={styles.statusText}>
        {controller.errorText}
      </span>
      <Button onClick={handleClickInput} className={styles.uploadButton}>
        重新上传
      </Button>
    </div>
  ), [controller.errorText, handleClickInput])

  // 上传中显示的内容
  const uploadingView = React.useMemo(() => {
    const nomadize = Math.floor((controller.progress || 0) * 100) / 100
    return (
      <div className={styles.content}>
        <span className={styles.statusTitle}>
          正在上传
        </span>
        <Progress
          className={styles.progress}
          percent={nomadize}
          size="small"
        />
      </div>
    )
  }, [controller.progress])

  // 上传成功时显示的内容
  const successfulView = React.useMemo(() => (
    <div className={styles.content}>
      <CheckCircleFilledIcon
        width={40}
        height={40}
        className={styles.successIcon}
      />
      <span className={styles.statusTitle}>
        上传成功
      </span>
      <span className={styles.statusText}>
        {controller.uploadedInfo?.key}
      </span>
      <Button onClick={handleClickInput} className={styles.uploadButton}>
        重新上传
      </Button>
    </div>
  ), [controller.uploadedInfo, handleClickInput])

  return (
    <div className={styles.uploadCard}>
      <PathInput
        value={uploadPath}
        onChange={setUploadPath}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleChangeFile}
        accept={props.accepts.map(i => (i.mimeTypes || []).join(',')).filter(Boolean).join(',')}
      />
      {
        {
          none: noneView,
          uploading: uploadingView,
          successful: successfulView,
          failure: failureView
        }[controller.status]
      }
    </div>
  )
}
