/**
 * @desc Task center component
 * @author hovenjay <hovenjay@outlook.com>
 */

import React from 'react'
import {
  TaskTypeOptions,
  TaskCenterEntry, TaskCenterDrawer,
  useTaskCenterContext as useContext
} from 'kodo-base/lib/components/TaskCenter'

import { objectBatchMove } from './objectBatchMove'
import { objectUploadOptions } from './objectUpload'
import { objectBatchDelete } from './objectBatchDelete'

export function TaskCenter() {
  const taskTypeOptions: Array<TaskTypeOptions<any, any, any, any>> = [
    objectUploadOptions,
    objectBatchDelete,
    objectBatchMove
  ]

  return (
    <>
      <TaskCenterEntry />
      <TaskCenterDrawer taskTypesOptions={taskTypeOptions} />
    </>
  )
}

export function useTaskCenterContext() {
  return useContext()
}
