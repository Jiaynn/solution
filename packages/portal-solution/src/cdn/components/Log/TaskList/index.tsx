/*
 * @file 日志列表
 * @author gaoupon <gaopeng01@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'

import Table from 'react-icecream/lib/table'
import Tooltip from 'react-icecream/lib/tooltip'
import Icon from 'react-icecream/lib/icon'
import Button from 'react-icecream/lib/button'
import { Translation, useTranslation } from 'portal-base/common/i18n'

import { humanizeTimeStamp } from 'cdn/transforms/datetime'
import { humanizeFilesize } from 'cdn/transforms/unit'
import { humanizeLogStatus } from 'cdn/transforms/log'

import { ITask } from 'cdn/apis/log'
import { IModalOptions } from '../index'
import * as messages from './messages'

import './style.less'

const { Column } = Table

export interface ILogListProps {
  tasks: ITask[]
  isLoading: boolean
  toggleModal: (options: IModalOptions) => void
}

function getTaskFileSize(task: ITask): string {
  if (task.status !== 'finished') {
    return '-'
  }
  const logs = task.logs
  if (!logs || logs.length === 0) {
    return '-'
  }

  if (logs.length === 1) {
    return humanizeFilesize(logs[0].size)
  }

  let size = 0
  logs.forEach(log => {
    size += log.size
  })
  return humanizeFilesize(size)
}

function getTaskUrl(task: ITask): string {
  if (task.status !== 'finished') {
    return '-'
  }
  const logs = task.logs
  if (!logs || logs.length === 0) {
    return 'none'
  }

  if (logs.length === 1) {
    return logs[0].url
  }

  return 'multi'
}

function renderLogTime(_: unknown, task: ITask): string {
  return humanizeTimeStamp(task.start * 1000, 'YYYY-MM-DD')
}

function renderFileSize(_: unknown, task: ITask): string {
  return getTaskFileSize(task)
}

function renderStatus(_: unknown, task: ITask): JSX.Element {
  const status = task.status
  const logStatus = (
    <Translation>
      {t => t(humanizeLogStatus(status))}
    </Translation>
  )

  if (status === 'finished') {
    return (
      <span className="text-success">
        {logStatus}
      </span>
    )
  }
  const logTip = (
    <Translation>
      {t => t(messages.logRunningTip)}
    </Translation>
  )
  return (
    <span className="text-warning">
      {logStatus}
      {
        status === 'running'
        && (
          <Tooltip title={logTip}>
            <Icon className="log-icon" type="info-circle" />
          </Tooltip>
        )
      }
    </span>
  )
}

function renderOperation(toggleModal: (options: IModalOptions) => void) {
  const Operation = (_: unknown, task: ITask) => {
    const status = task.status
    const url = getTaskUrl(task)

    if (status !== 'finished') {
      return <span>-</span>
    }
    if (url === 'none') {
      return (
        <span>
          <Translation>
            {t => t(messages.noLog)}
          </Translation>
        </span>
      )
    }

    const downloadMsgVal = (
      <Translation>
        {t => t(messages.download)}
      </Translation>
    )

    if (url === 'multi') {
      return (
        <Button
          size="small"
          shape="round"
          onClick={() => toggleModal({ visible: true, logs: task.logs })}
        >
          {downloadMsgVal}
        </Button>
      )
    }
    return (
      <Button
        size="small"
        shape="round"
        onClick={() => window.open(url, '_blank')}
      >
        {downloadMsgVal}
      </Button>
    )
  }
  return Operation
}

export default observer(function TaskList(props: ILogListProps) {
  const { tasks, isLoading, toggleModal } = props
  const t = useTranslation()

  return (
    <Table
      className="log-list"
      pagination={false}
      loading={isLoading}
      rowKey={({ start, domain = '' }: ITask) => `${start}-${domain}`}
      dataSource={tasks}
    >
      <Column
        title={t(messages.taskName)}
        dataIndex="domain"
      />
      <Column
        title={t(messages.logDate)}
        render={renderLogTime}
      />
      <Column
        title={t(messages.fileSize)}
        render={renderFileSize}
      />
      <Column
        title={t(messages.state)}
        render={renderStatus}
      />
      <Column
        className="log-opreate"
        title={t(messages.downloadLog)}
        render={renderOperation(toggleModal)}
      />
    </Table>
  )
})
