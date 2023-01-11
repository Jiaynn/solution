/**
 * @description crop and scale component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { Radio } from 'react-icecream-2/form-x'
import { Collapse, CollapsePanel, FormItem, RadioGroup } from 'react-icecream-2'

import { AdvancedScaleType, BasicScaleCategory } from '../constants'
import Scale, { createScaleFormState } from './Scale'
import Crop, { createCropFormState } from './Crop'

export { createScaleFormState, ScaleFormValue } from './Scale'
export { createCropFormState, CropFormValue } from './Crop'

const formItemLayout = {
  labelWidth: '86px',
  layout: 'horizontal'
} as const

export enum Order {
  ScaleFirst = 'ScaleFirst',
  CropFirst = 'CropFirst'
}

interface Props {
  isEditMode: boolean
  advanced: FieldState<boolean>
  scaleCropOrder: FieldState<Order>
  cropForm: ReturnType<typeof createCropFormState>
  scaleForm: ReturnType<typeof createScaleFormState>
}

export default observer(function CropScale(props: Props) {
  const { advanced, cropForm, scaleForm, scaleCropOrder } = props

  const handleOrderChange = React.useCallback((order: Order) => {
    runInAction(() => {
      if (order === Order.CropFirst) cropForm.$.enable.set(true)
      scaleCropOrder.set(order)
    })
  }, [cropForm.$.enable, scaleCropOrder])

  const scaleLabel = advanced.value ? '缩放' : '缩略'
  const scaleView = (
    <FormItem label={`${scaleLabel}方式`} {...formItemLayout} labelVerticalAlign="text">
      <Scale
        formState={scaleForm}
        isAdvanced={advanced.value}
      />
    </FormItem>
  )

  const cropView = advanced.value && (
    <FormItem label="剪裁" {...formItemLayout} labelVerticalAlign="text">
      <Crop formState={cropForm} />
    </FormItem>
  )

  const scaleCropView = scaleCropOrder.value === Order.ScaleFirst
    ? (
      <>
        {scaleView}
        {cropView}
      </>
    )
    : (
      <>
        {cropView}
        {scaleView}
      </>
    )

  const orderView = advanced.value && (
    <FormItem label="缩放剪裁方式" labelVerticalAlign="text" {...formItemLayout}>
      <RadioGroup onChange={v => handleOrderChange(v)} value={scaleCropOrder.value}>
        <Radio value={Order.ScaleFirst}>先缩放后剪裁</Radio>
        <Radio value={Order.CropFirst}>先剪裁后缩放</Radio>
      </RadioGroup>
    </FormItem>
  )

  const shouldExpandedCollapse = props.isEditMode
    ? (
      props.cropForm.value.enable
      || props.scaleForm.value.advancedScaleType !== AdvancedScaleType.None
      || props.scaleForm.value.basicScaleCategory !== BasicScaleCategory.None
    )
    : true

  return (
    <div>
      <Collapse defaultValue={shouldExpandedCollapse ? ['default'] : []}>
        <CollapsePanel title={`${scaleLabel}剪裁`} value="default">
          {orderView}
          {scaleCropView}
        </CollapsePanel>
      </Collapse>
    </div>
  )
})
