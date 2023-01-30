/**
 * @description form component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { FormState, FieldState, bindInput } from 'formstate-x'
import { FormItem, Radio, RadioGroup, TextInput } from 'react-icecream-2/form-x'
import { Button, Form, Switch } from 'react-icecream-2'

import { useDoraImageConfig } from '../Image'

import { EditMode, rawFormat } from './constants'
import CropScale, { createCropFormState, createScaleFormState, Order, CropFormValue, ScaleFormValue } from './CropScale'
import Watermark, { createWatermarkFormState, WatermarkFormValue } from './Watermark'
import More, { checkMoreFormExpanded, createMoreConfigForm, MoreFormValue } from './More'
import HandModeEditor from './HandModeEditor'
import OutputFormat from './OutputFormat'
import Modal from './Modal'

import styles from './style.m.less'

export interface Props {
  isEditMode: boolean
  bucketName: string
  nameInputDisabled: boolean
  canSave: boolean
  modalVisible: boolean
  isSubmitting: boolean
  formState: ReturnType<typeof createFormState>
  onSubmit: () => void
  onClose: () => void
  onCodeChange: (code: string) => void
  onSceneChange: (code: string) => void
  onModalVisibleChange: (visible: boolean) => void
}

const formItemLayout = {
  labelWidth: '120px',
  layout: 'horizontal'
} as const

export type StyleProcessFormInitValue = Partial<{
  name: string
  code: string
  editMode: EditMode
  advanced: boolean
  outputFormat: string
  scaleCropOrder: Order
  cropForm: Partial<CropFormValue>
  scaleForm: Partial<ScaleFormValue>
  watermarkForm: Partial<WatermarkFormValue>
  moreForm: Partial<MoreFormValue>
}>

export function getSafeFormState(): Required<StyleProcessFormInitValue> {
  return {
    name: '',
    code: '',
    editMode: EditMode.Visual,
    advanced: false,
    outputFormat: rawFormat,
    scaleCropOrder: Order.ScaleFirst,
    cropForm: {},
    scaleForm: {},
    watermarkForm: {},
    moreForm: {}
  }
}

export function createFormState(initVal?: StyleProcessFormInitValue) {
  const advancedField = new FieldState(initVal?.advanced || false, 0)
  const outputFormatField = new FieldState(initVal?.outputFormat || rawFormat)

  return new FormState({
    name: new FieldState(initVal?.name || '').validators(val => {
      if (!val) return '名称不能为空'
      if (val.length > 60 || /[^\da-zA-Z.]|_/.test(val)) return '名称使用数字、字母、小数点、不超过 60 个字符'
    }),

    code: new FieldState(initVal?.code || ''),
    editMode: new FieldState(initVal?.editMode || EditMode.Visual, 0),
    advanced: advancedField,
    outputFormat: outputFormatField,
    scaleCropOrder: new FieldState(initVal?.scaleCropOrder || Order.ScaleFirst, 0),
    cropForm: createCropFormState(advancedField, initVal?.cropForm),
    scaleForm: createScaleFormState(advancedField, initVal?.scaleForm),
    watermarkForm: createWatermarkFormState(outputFormatField, initVal?.watermarkForm),
    moreForm: createMoreConfigForm(advancedField, initVal?.moreForm)
  })
}

export default observer(function ConfigForm(props: Props) {
  const {
    bucketName,
    nameInputDisabled,
    canSave,
    modalVisible,
    isSubmitting,
    onModalVisibleChange,
    formState,
    onSubmit,
    onClose,
    onSceneChange
  } = props

  const doraImageStyleConfig = useDoraImageConfig(bucketName)

  const handleSceneChang = React.useCallback((sceneCode: string) => {
    onSceneChange(sceneCode)
    onModalVisibleChange(false)
  }, [onModalVisibleChange, onSceneChange])

  const handleIsAdvancedChange = React.useCallback(
    (isAdvanced: boolean) => {
      runInAction(() => {
        formState.$.advanced.onChange(isAdvanced)
        if (isAdvanced) formState.$.moreForm.$.autoOrient.onChange(true)
        if (checkMoreFormExpanded(isAdvanced, formState.value.moreForm)) formState.$.moreForm.$.expanded.onChange(true)
      })
    },
    [formState]
  )

  const visualModeView = (
    <>
      <FormItem label="高级编辑" {...formItemLayout} labelVerticalAlign="text">
        <Switch
          // eslint-disable-next-line no-underscore-dangle
          checked={formState.$.advanced._value}
          onChange={handleIsAdvancedChange}
        />
      </FormItem>
      <div className={styles.collapseGroup}>
        <CropScale
          isEditMode={props.isEditMode}
          cropForm={formState.$.cropForm}
          advanced={formState.$.advanced}
          scaleForm={formState.$.scaleForm}
          scaleCropOrder={formState.$.scaleCropOrder}
        />
        <Watermark
          isEditMode={props.isEditMode}
          formState={formState.$.watermarkForm}
        />
        <OutputFormat
          output={formState.$.outputFormat}
        />
        <More
          isEditMode={props.isEditMode}
          formState={formState.$.moreForm}
          isAdvanced={formState.$.advanced.value}
          imageSlimDescription={doraImageStyleConfig?.imageSlim?.description}
        />
      </div>
    </>
  )

  const editorView = formState.$.editMode.value === EditMode.Visual
    ? visualModeView
    : <HandModeEditor {...bindInput(formState.$.code)} />

  return (
    <Form className={styles.form} labelAlign="left" footer={null}>
      <FormItem label="图片处理样式名称" {...formItemLayout} state={formState.$.name}>
        <div className={styles.name}>
          <TextInput disabled={nameInputDisabled} placeholder="请输入样式名称" state={formState.$.name} />
          <Button type="primary" onClick={() => onModalVisibleChange(true)}>
            常用使用场景
          </Button>
        </div>
      </FormItem>
      <FormItem label="编辑模式" labelVerticalAlign="text" {...formItemLayout}>
        <RadioGroup state={formState.$.editMode}>
          <Radio value={EditMode.Visual}>可视化编辑</Radio>
          <Radio value={EditMode.Manual}>手动编辑</Radio>
        </RadioGroup>
      </FormItem>
      {editorView}
      <div className={styles.footer}>
        <Button type="primary" disabled={!canSave} loading={isSubmitting} onClick={onSubmit}>
          保存样式
        </Button>
        <Button onClick={onClose} disabled={isSubmitting}>取消</Button>
      </div>
      <Modal
        visible={modalVisible}
        onCancel={() => onModalVisibleChange(false)}
        onChange={handleSceneChang}
      />
    </Form>
  )
})
