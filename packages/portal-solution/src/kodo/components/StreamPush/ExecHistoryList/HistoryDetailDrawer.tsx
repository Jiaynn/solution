/**
 * @file Stream push task execute history detail drawer
 * @author hovenjay <hovenjay@outlook.com>
 */

import React from 'react'
import Drawer from 'react-icecream/lib/drawer'

import { humanizeTimestamp } from 'kodo/transforms/date-time'

import { TaskExecHistory } from 'kodo/apis/stream-push'

import TaskStatusTag from '../TaskStatusTag'
import styles from '../style.m.less'

export interface HistoryDetailDrawerProps {
  record: TaskExecHistory
  visible: boolean

  onVisibleChange(visible: boolean): void
}

function HistoryDetailDrawer({ record, visible, onVisibleChange }: HistoryDetailDrawerProps) {
  if (!record) return null

  return (
    <Drawer
      width="640px"
      title="转推详情"
      footer={null}
      visible={visible}
      onClose={() => onVisibleChange(false)}
    >
      <div className={styles.historyDetail}>
        <div className={styles.historyDetailRow}>
          <span className={styles.bold}>任务名称：{record.name}</span>
          <TaskStatusTag status={record.status} />
        </div>
        <div className={styles.historyDetailRow}>
          <span className={styles.bold}>
            运行时间：{humanizeTimestamp(record.startTime)} ~ {humanizeTimestamp(record.stopTime)}
          </span>
        </div>
        <div className={styles.historyDetailRow}>
          <span className={styles.bold}>运行日志：</span>
        </div>
        <div className={styles.historyDetailLog}>{record.message || '--'}</div>
      </div>
    </Drawer>
  )
}

export default HistoryDetailDrawer
