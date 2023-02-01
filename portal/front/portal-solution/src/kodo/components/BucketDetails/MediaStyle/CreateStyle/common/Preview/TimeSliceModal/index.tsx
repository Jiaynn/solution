/**
 * @description time slice modal
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { Modal, ModalFooter } from 'react-icecream-2'
import { useFormstateX, FormItem, InputGroup, NumberInput, InputGroupItem } from 'react-icecream-2/form-x'

import { rangeValidator } from 'kodo/utils/form'

import Prompt from 'kodo/components/common/Prompt'

import styles from './style.m.less'

export interface TimeSlice {
  start: number
  duration: number
}

interface Props {
  videoDuration: number
  timeSlice: TimeSlice
  visible: boolean
  onOk: (timeSlice: TimeSlice) => void
  onCancel: () => void
}

const layout = {
  layout: { type: 'horizontal' },
  labelAlign: 'left'
} as const

function createFormState({ start, duration } : TimeSlice, max: number) {
  if (max === 0) {
    max = Number.MAX_SAFE_INTEGER
  }
  return new FormState({
    start: new FieldState(start).validators(
      val => val == null && '请输入开始时间',
      rangeValidator([0, max])
    ),
    duration: new FieldState(duration ?? 60).validators(
      val => val == null && '请输入截取长度',
      rangeValidator([0, 60])
    )
  }).validators(formValue => {
    if (formValue.start != null && formValue.duration != null) {
      return formValue.start + formValue.duration >= max && '所选片段已超出有效时间片段'
    }
  })
}

export default observer(function TimeSliceModal(props: Props) {
  const { videoDuration, timeSlice, visible, onOk, onCancel } = props
  const formState = useFormstateX(createFormState, [timeSlice, videoDuration])

  const disabled = formState.hasError

  const handleOk = () => {
    formState.validate().then(({ hasError }) => {
      if (!hasError) {
        onOk(formState.value)
      }
    })
  }

  React.useEffect(() => {
    if (visible) formState.validate()
  }, [formState, visible])

  const footerView = <ModalFooter okButtonProps={{ disabled }} />

  return (
    <Modal title="预览视频片段截取" visible={visible} onOk={handleOk} onCancel={onCancel} footer={footerView}>
      <Prompt type="normal">源视频时长超过1分钟，需要截取后生成预览视频，当前视频时长：{videoDuration} 秒</Prompt>
      <FormItem className={styles.start} label="开始时间：" {...layout} state={formState.$.start} >
        <InputGroup className={styles.input}>
          <NumberInput state={formState.$.start} digits={3} step={0.1} min={0} />
          <InputGroupItem>秒</InputGroupItem>
        </InputGroup>
      </FormItem>
      <FormItem label="截取长度：" {...layout} state={formState.$.duration}>
        <InputGroup className={styles.input}>
          <NumberInput state={formState.$.duration} digits={3} step={0.1} min={0} />
          <InputGroupItem>秒</InputGroupItem>
        </InputGroup>
      </FormItem>
      {formState.ownError && <Prompt className={styles.error}>{formState.ownError}</Prompt>}
    </Modal>
  )
})
