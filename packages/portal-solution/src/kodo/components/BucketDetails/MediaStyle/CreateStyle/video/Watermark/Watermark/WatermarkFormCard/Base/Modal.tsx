/**
 * @description dimension modal
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { InputGroup, InputGroupItem, Modal, ModalFooter } from 'react-icecream-2'
import { FormItem, NumberInput, useFormstateX } from 'react-icecream-2/form-x'

import { integerValidator, rangeValidator } from 'kodo/utils/form'

import styles from './style.m.less'

export type Dimension = {
  width: number
  height: number
}

interface Props {
  visible: boolean
  onOk: (dimension: Dimension) => void
  onCancel: () => void
  width: number
  height: number
}

function createFormState(width: number, height: number) {
  return new FormState({
    width: new FieldState(width).validators(
      rangeValidator([20, 3840]),
      integerValidator()
    ),
    height: new FieldState(height).validators(
      rangeValidator([20, 2160]),
      integerValidator()
    )
  })
}

export default observer(function DimensionModal(props: Props) {
  const { visible, onOk, onCancel, width, height } = props
  const formState = useFormstateX(createFormState, [width, height, visible])

  const handleOk = React.useCallback(() => {
    onOk({ width: formState.$.width.value, height: formState.$.height.value })
  }, [formState.$.height.value, formState.$.width.value, onOk])

  const disabled = formState.hasError

  const footerView = <ModalFooter okButtonProps={{ disabled }} />

  return (
    <Modal title="设置高宽" visible={visible} onOk={handleOk} onCancel={onCancel} footer={footerView}>
      <div className={styles.dimensionModal}>
        <FormItem label="宽度：" layout="horizontal" className={styles.input} state={formState.$.width}>
          <InputGroup style={{ width: '140px' }}>
            <NumberInput state={formState.$.width} digits={0} min={20} max={3840} />
            <InputGroupItem>PX</InputGroupItem>
          </InputGroup>
        </FormItem>
        <FormItem label="高度：" layout="horizontal" state={formState.$.height}>
          <InputGroup style={{ width: '140px' }}>
            <NumberInput state={formState.$.height} digits={0} min={20} max={2160} />
            <InputGroupItem>PX</InputGroupItem>
          </InputGroup>
        </FormItem>
      </div>
    </Modal>
  )
})
