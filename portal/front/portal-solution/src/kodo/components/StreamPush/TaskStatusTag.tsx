/**
 * @desc Stream push task status tag
 * @author hovenjay <hovenjay@outlook.com>
 */

import React from 'react'
import { Tag } from 'react-icecream'

import { StreamPushTaskStatus, streamPushTaskStatusColorMap, streamPushTaskStatusNameMap } from 'kodo/constants/stream-push'

export interface TaskStatusTagProps {
  status: StreamPushTaskStatus
}

export default function TaskStatusTag({ status }: TaskStatusTagProps) {
  return (
    <Tag color={streamPushTaskStatusColorMap[status]} small>
      {streamPushTaskStatusNameMap[status]}
    </Tag>
  )
}
