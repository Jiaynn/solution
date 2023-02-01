/**
 * @desc Task center component
 * @author hovenjay <hovenjay@outlook.com>
 */

import React from 'react'
import {
  DescriptionRender,
  StatusRender, OperationsRender,
  TaskExtraDataColumnProps, TaskTypeOptions
} from 'kodo-base/lib/components/TaskCenter'
import { useInjection } from 'qn-fe-core/di'
import { ToasterStore } from 'portal-base/common/toaster'

import { Button } from 'react-icecream'
import { Tooltip } from 'react-icecream-2'
import CopyToClipboard from 'react-copy-to-clipboard'
import { ObjectUploadResult } from 'kodo-base/lib/stores/task-center'
import { TaskStatus } from 'kodo-base/lib/components/TaskCenter/Drawer/TaskStatus'
import { TaskOperations } from 'kodo-base/lib/components/TaskCenter/Drawer/TaskOperations'
import Role from 'portal-base/common/components/Role'

import { CopyDownLoadLink } from './CopyDownLoadLink'
import TransCode from './TransCode.svg'
import styles from './style.m.less'

export type UploadTaskExtraData = {
  filename: string
  filesize: string
  mimeType: string
  targetLocation: string
  targetBucket: string
}

const uploadTaskExtraDataColumns: Array<TaskExtraDataColumnProps<UploadTaskExtraData>> = [
  {
    title: '文件名',
    render(extraData) { return extraData && extraData.filename }
  },
  {
    title: '上传位置',
    width: 280,
    render(extraData) { return extraData && `${extraData.targetBucket}/${extraData.targetLocation}` }
  },
  {
    title: '文件大小',
    width: 120,
    render(extraData) { return extraData && extraData.filesize }
  }
]

const CopyText = (props: { text: string }) => {
  const toasterStore = useInjection(ToasterStore)

  const onCopy = React.useCallback((_: string, state: boolean) => {
    if (state) {
      toasterStore.info('转码 ID 复制成功')
    } else {
      toasterStore.error('转码 ID 复制失败')
    }
  }, [toasterStore])

  return (
    <CopyToClipboard onCopy={onCopy} text={props.text}>
      <Button type="link">复制</Button>
    </CopyToClipboard>
  )
}

const TransCodeOnceRole = (() => {
  let id: string | null = null
  // eslint-disable-next-line react/display-name
  return (props: React.PropsWithChildren<{ id: string }>) => {
    if (id == null) id = props.id
    return id === props.id
      ? <Role name="upload-persistent-id">{props.children}</Role>
      : <>{props.children}</>
  }
})()

// 覆盖任务中心默认的状态渲染处理
const uploadStatusColumnRender: StatusRender<'objectUpload', UploadTaskExtraData, ObjectUploadResult> = task => {
  // 上传成功且服务端返回转码 id 的时候显示转码 id，不存在的时候服务端返回的字符串 'null'
  const persistentIdView = task.status === 'success' && task.result.persistentId !== 'null' && (
    <TransCodeOnceRole id={task.result.persistentId}>
      <span style={{ marginLeft: '4px' }} >
        {/* Role 需要一个 html 标签，Tooltip 也需要，只能在最外层包一个 span */}
        <Tooltip
          placement="top"
          overlayClassName={styles.tooltip}
          title={<>转码 ID: {task.result.persistentId} <CopyText text={task.result.persistentId} /></>}
        >
          <TransCode />
        </Tooltip>
      </span>
    </TransCodeOnceRole>
  )

  return (
    <span className={styles.centerContainer}>
      <TaskStatus task={task} />
      {persistentIdView}
    </span>
  )
}

// 覆盖任务中心默认的操作渲染处理
const uploadOperationsColumnRender: OperationsRender<'objectUpload', UploadTaskExtraData, ObjectUploadResult> = task => {
  // 上传成功且服务端返回上传之后的 key 则显示复制外链的按钮
  const copyDownLoadLinkView = task.status === 'success' && task.result.key && (
    <CopyDownLoadLink
      bucket={task.extraData.targetBucket}
      fileKey={task.result.key}
      mimeType={task.extraData.mimeType}
    />
  )

  return (
    <span className={styles.centerContainer}>
      {copyDownLoadLinkView}
      <TaskOperations task={task} />
    </span>
  )
}

// 列表的说明
const uploadDescriptionRender: DescriptionRender<'objectUpload', UploadTaskExtraData, ObjectUploadResult> = (tasks, status) => {
  // 当前列表存在上传成功的任务且当前处于全部或成功的 tab 下则显示该说明
  const shouldShow = (status == null || status === 'success') && tasks.some(task => task.status === 'success')
  return shouldShow ? (<div className={styles.description}>如需使用其他域名获取外链，请在空间中切换、选择域名。</div>) : null
}

export const objectUploadOptions: TaskTypeOptions = {
  type: 'objectUpload',
  name: '文件上传',
  terminable: true,
  extraDataColumns: uploadTaskExtraDataColumns,
  descriptionRender: uploadDescriptionRender,
  statusColumnRender: uploadStatusColumnRender,
  operationsColumnRender: uploadOperationsColumnRender
}
