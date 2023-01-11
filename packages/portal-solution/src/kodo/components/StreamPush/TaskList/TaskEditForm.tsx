/**
 * @desc Stream push task edit form
 * @author hovenjay <hovenjay@outlook.com>
 */

import { observer } from 'mobx-react'
import moment from 'moment'
import { FieldState, FormState } from 'formstate-x'
import React from 'react'
import { Form } from 'react-icecream'

import { validateStreamPushTaskName, validateStreamPushTaskSourceUrl } from 'kodo/transforms/stream-push'

import FormTrigger from 'kodo/components/common/FormTrigger'

import { StreamPushTask } from 'kodo/apis/stream-push'

import {
  TaskImmediatelyStartSwitch, TaskNameInput, TaskSourceUrlInput, TaskTargetBucketSelect, TaskTimingControl,
  TaskTimingControlState
} from './TaskEditFormItems'

interface FormFieldsType {
  name: string
  sourceUrl: string
  bucket: string
  startTimeState: TaskTimingControlState
  stopTimeState: TaskTimingControlState
  triggerNow: boolean
}

export type TaskEditFormState = FormState<{ [P in keyof FormFieldsType]: FieldState<FormFieldsType[P]> }>

export interface TaskEditFormProps {
  formState: TaskEditFormState

  onSubmit(): void
}

export function createTaskEditFormState(taskInfo?: StreamPushTask): TaskEditFormState {
  const defaultDatetime = moment().startOf('hour').add(1, 'hour')

  return new FormState({
    name: new FieldState(taskInfo && taskInfo.name ? taskInfo.name : '')
      .validators(validateStreamPushTaskName),
    sourceUrl: new FieldState(taskInfo && taskInfo.sourceUrls ? taskInfo.sourceUrls[0].url : '')
      .validators(validateStreamPushTaskSourceUrl),
    bucket: new FieldState(taskInfo && taskInfo.bucket ? taskInfo.bucket : ''),
    startTimeState: new FieldState({
      isEnable: new FieldState(Boolean(taskInfo && taskInfo.startTime)),
      time: new FieldState(taskInfo && taskInfo.startTime ? moment(taskInfo.startTime) : defaultDatetime)
    }),
    stopTimeState: new FieldState({
      isEnable: new FieldState(Boolean(taskInfo && taskInfo.stopTime)),
      time: new FieldState(taskInfo && taskInfo.stopTime ? moment(taskInfo.stopTime) : defaultDatetime)
    }),
    triggerNow: new FieldState(Boolean(taskInfo && taskInfo.triggerNow))
  })
}

export const TaskEditForm = observer(
  ({ formState, onSubmit }: TaskEditFormProps) => {
    if (!formState) return null

    const { name, sourceUrl, bucket, startTimeState, stopTimeState, triggerNow } = formState.$

    return (
      <Form labelCol={{ span: 4, pull: 1 }} wrapperCol={{ span: 19 }} onSubmit={onSubmit}>
        <FormTrigger />
        <TaskNameInput state={name} />
        <TaskSourceUrlInput state={sourceUrl} />
        <TaskTargetBucketSelect state={bucket} />
        <TaskTimingControl label="定时开启" state={startTimeState} />
        <TaskTimingControl label="定时关闭" state={stopTimeState} />
        <TaskImmediatelyStartSwitch state={triggerNow} />
      </Form>
    )
  }
)
