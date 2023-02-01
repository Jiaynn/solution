/**
 * @desc Stream push task edit form items
 * @author hovenjay <hovenjay@outlook.com>
 */

import { bindInput, FieldState } from 'formstate-x'
import { observer } from 'mobx-react'
import moment, { Moment } from 'moment'
import React, { useEffect } from 'react'
import { useInjection } from 'qn-fe-core/di'
import { DatePicker, Form, Input, Select, Switch } from 'react-icecream'
import { bindFormItem, bindInputWithCurrentTarget, bindSwitch } from 'portal-base/common/form'

import { BucketListStore } from 'kodo/stores/bucket/list'
import { ConfigStore } from 'kodo/stores/config'
import styles from '../style.m.less'

export interface StringFieldState {
  state: FieldState<string>
}

export interface BooleanFieldState {
  state: FieldState<boolean>
}

export interface TaskTimingControlState {
  isEnable: FieldState<boolean>
  time: FieldState<Moment>
}

export interface TaskTimingControlFieldState {
  label: string
  state: FieldState<TaskTimingControlState>
}

export const TaskNameInput = observer(
  ({ state }: StringFieldState) => (
    <Form.Item
      label="任务名称"
      extra="任务名称仅支持字母、数字，不超过 20 个字符"
      colon={false}
      required
      {...bindFormItem(state)}
    >
      <Input placeholder="请输入任务名称" {...bindInputWithCurrentTarget(state)} />
    </Form.Item>
  )
)

export const TaskSourceUrlInput = observer(
  ({ state }: StringFieldState) => (
    <Form.Item label="拉流地址" colon={false} required {...bindFormItem(state)}>
      <Input placeholder="请输入拉流地址" {...bindInputWithCurrentTarget(state)} />
    </Form.Item>
  )
)

export const TaskTargetBucketSelect = observer(
  ({ state }: StringFieldState) => {
    const configStore = useInjection(ConfigStore)
    const bucketListStore = useInjection(BucketListStore)
    const handleSelectChange = (bucket: string) => {
      state.onChange(bucket)
    }

    useEffect(() => { bucketListStore.fetchList() }, [bucketListStore])

    return (
      <Form.Item label="转推空间" colon={false} required {...bindFormItem(state)}>
        <Select
          placeholder="请选择转推空间"
          value={state.value || undefined}
          onChange={handleSelectChange}
          showSearch
        >
          {
            [...bucketListStore.nameListGroupByRegion].map(([region, buckets]) => (
              <Select.OptGroup label={configStore.getRegion({ region }).name} key={region}>
                {
                  buckets.map(bucketName => (
                    <Select.Option key={bucketName} value={bucketName}>{bucketName}</Select.Option>
                  ))
                }
              </Select.OptGroup>
            ))
          }
        </Select>
      </Form.Item>
    )
  }
)

export const TaskTimingControl = observer(
  ({ label, state }: TaskTimingControlFieldState) => (
    <Form.Item label={label} colon={false} {...bindFormItem(state)}>
      <Switch
        className={styles.formItemSwitch}
        style={{ marginRight: 32 }}
        {...bindSwitch(state.$.isEnable)}
      />
      <DatePicker
        format="YYYY-MM-DD HH:mm"
        showTime={{ format: 'HH:mm' }}
        disabled={!state.value.isEnable}
        disabledDate={date => Boolean(date && date < moment().startOf('day'))}
        style={{ width: '240px' }}
        {...bindInput(state.$.time)}
      />
    </Form.Item>
  )
)

export const TaskImmediatelyStartSwitch = observer(
  ({ state }: BooleanFieldState) => (
    <Form.Item label="立即启动" colon={false} {...bindFormItem(state)}>
      <Switch {...bindSwitch(state)} />
    </Form.Item>
  )
)
