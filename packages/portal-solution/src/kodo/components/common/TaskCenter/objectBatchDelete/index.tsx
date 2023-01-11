/**
 * @desc Batch delete
 * @author yinxulai <yinxulai@outlook.com>
 */

import React from 'react'
import moment from 'moment'
import { CSVLink } from 'react-csv'
import { getMessage } from 'qn-fe-core/exception'
import { HelpIcon } from 'react-icecream-2/icons'
import { Button, Modal, Table, Tooltip } from 'react-icecream-2'

import { Task } from 'kodo-base/lib/stores/task-center'
import { TaskOperations } from 'kodo-base/lib/components/TaskCenter/Drawer/TaskOperations'
import { taskStatusColorMap, taskStatusNameMap } from 'kodo-base/lib/components/TaskCenter/constants'
import { OperationsRender, TaskExtraDataColumnProps, TaskTypeOptions } from 'kodo-base/lib/components/TaskCenter'

import styles from './style.m.less'

export type BatchDeleteExtraData = {
  type: 'file' | 'folder'
  bucket: string
  fullPath: string
}

// const typeNameMap = {
//   file: '文件',
//   folder: '目录'
// }

export type ProgressType = {
  failure: number // 失败的数量
  successful: number // 成功的数量
  version: boolean // 是否开启了版本管理
  details: Array<{
    key: string
    version?: string
    bucket: string
    status: string
  }>
}

export type ResultType = ProgressType
type DeleteTask = Task<'objectBatchDelete', BatchDeleteExtraData, ResultType, ProgressType>
const batchMoveExtraDataColumns: Array<TaskExtraDataColumnProps<BatchDeleteExtraData>> = [
  { title: '所属空间', width: 200, render(extraData) { return extraData && extraData.bucket } },
  { title: '目录', render(extraData) { return extraData && extraData.fullPath } }
  // 目前只有目录进来，所以不显示这个了
  // { title: '类型', width: 120, render(extraData) { return extraData && typeNameMap[extraData.type] } }
]

interface TaskStatusProps {
  task: DeleteTask
}

export function TaskStatus(props: TaskStatusProps) {
  const { task } = props

  const getTooltipMessage = () => {
    /* eslint-disable no-nested-ternary */
    const processInfo = task.status === 'failure'
      ? task.progress
      : task.status === 'success'
        ? task.result
        : task.status === 'processing'
          ? task.progress
          : task.status === 'terminated'
            ? task.progress
            : null
    /* eslint-enable no-nested-ternary */

    const processText = [
      processInfo && processInfo.successful > 0 ? `删除成功：${processInfo.successful}` : '',
      processInfo && processInfo.failure > 0 ? `删除失败：${processInfo.failure}` : ''
    ].filter(Boolean).join('，')

    if (task.status === 'failure') {
      return (
        <div>
          {processText}
          {processText && (<br />)}
          {getMessage(task.failureReason, '未知错误')}
        </div>
      )
    }

    return processText
  }

  const tooltipMessage = getTooltipMessage()

  const child = (
    <span className={styles.status} style={{ color: taskStatusColorMap[task.status] }}>
      <span>{taskStatusNameMap[task.status]}</span>
      {tooltipMessage && <HelpIcon className={styles.icon} />}
    </span>
  )

  if (tooltipMessage) {
    return (
      <Tooltip trigger="hover" placement="top" title={tooltipMessage}>
        {child}
      </Tooltip>
    )
  }

  return child
}

function DeleteResultModal(props: { task: DeleteTask }) {
  const [visible, setVisible] = React.useState(false)
  const [{ currentPage, pageSize }, setPageInfo] = React.useState({ pageSize: 50, currentPage: 0 })

  if (props.task.status === 'ready') return null
  if (props.task.status === 'processing') return null

  const progressInfo = props.task.status === 'success'
    ? props.task.result
    : props.task.progress

  if (progressInfo == null) return null

  const records = progressInfo.details.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  function handleSetPageInfo(nextCurrentPage: number, nextPageSize: number) {
    setPageInfo({ pageSize: nextPageSize, currentPage: nextCurrentPage })
  }

  const csvHeaders = [
    { label: '空间', key: 'bucket' },
    { label: '文件', key: 'key' }
  ]

  if (progressInfo.version) {
    csvHeaders.push({ label: '版本号', key: 'version' })
  }

  csvHeaders.push({ label: '状态', key: 'status' })

  const deleteResultDownloadView = visible && (
    <CSVLink
      headers={csvHeaders}
      data={progressInfo.details}
      filename={'delete_folder_result_' + moment().format('YYYY-MM-DD-HH-mm-ss')}
      style={{ marginRight: '8px' }}
    >
      <Button type="primary">
        下载为 CSV
      </Button>
    </CSVLink>
  )

  const resultTableView = (
    <Table
      fixHead
      size="small"
      records={records}
      className={styles.resultTable}
      pagination={{
        pageSize,
        currentPage,
        total: progressInfo.details.length,
        onChange: handleSetPageInfo
      }}
    >
      <Table.Column
        title="空间"
        width="160px"
        accessor="bucket"
      />
      <Table.Column
        title="文件"
        accessor="key"
        render={key => (<span className={styles.space}>{key}</span>)}
      />
      <Table.Column
        title="状态"
        width="120px"
        accessor="status"
      />
    </Table>
  )

  // 空数据状态下 table 会偷偷变宽，所以这样处理一下
  if (records.length === 0) return null

  return (
    <>
      <Modal
        width={700}
        autoDestroy
        title="删除记录"
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        footer={deleteResultDownloadView}
      >
        {resultTableView}
      </Modal>
      <Button
        type="link"
        onClick={() => setVisible(true)}
        style={{ marginRight: '8px', lineHeight: '16px' }}
      >
        详情
      </Button>
    </>
  )
}

// 覆盖任务中心默认的操作渲染处理
const deleteOperationsColumnRender: OperationsRender<'objectBatchDelete', BatchDeleteExtraData, ResultType, ProgressType> = task => (
  <span className={styles.centerContainer}>
    <DeleteResultModal task={task} />
    <TaskOperations task={task} />
  </span>
)

export const objectBatchDelete: TaskTypeOptions<'objectBatchDelete', BatchDeleteExtraData, ResultType, ProgressType> = {
  type: 'objectBatchDelete',
  name: '目录删除',
  terminable: true,
  extraDataColumns: batchMoveExtraDataColumns,
  operationsColumnRender: deleteOperationsColumnRender,
  statusColumnRender: task => (<TaskStatus task={task} />)
}
