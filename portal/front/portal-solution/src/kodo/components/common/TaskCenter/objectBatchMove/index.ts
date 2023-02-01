/**
 * @desc Task center component
 * @author hovenjay <hovenjay@outlook.com>
 */

import { TaskExtraDataColumnProps, TaskTypeOptions } from 'kodo-base/lib/components/TaskCenter'

export type BatchMoveExtraData = {
  filename: string
  sourcePath: string
  targetPath: string
}

const batchMoveExtraDataColumns: Array<TaskExtraDataColumnProps<BatchMoveExtraData>> = [
  { title: '文件名', render(extraData) { return extraData && extraData.filename } },
  { title: '源位置', width: 240, render(extraData) { return extraData && extraData.sourcePath } },
  { title: '目标位置', width: 240, render(extraData) { return extraData && extraData.targetPath } }
]

export const objectBatchMove: TaskTypeOptions = {
  type: 'objectBatchMove',
  name: '文件移动',
  terminable: false,
  extraDataColumns: batchMoveExtraDataColumns
}
