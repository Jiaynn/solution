/**
 * @description Crop component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { observer } from 'mobx-react'
import { FieldState, FormState } from 'formstate-x'
import { Tooltip } from 'react-icecream-2'
import { FormItem, InputGroup, InputGroupItem, NumberInput, Radio, RadioGroup } from 'react-icecream-2/form-x'

import { getPlaceHolderAndRange, rangeValidator } from 'kodo/transforms/image-style'
import RawSVG from '../icons/raw.svg'
import OriginSVG from '../icons/advanced-crop-origin.svg'
import SelectedOriginSVG from '../icons/advanced-crop-selected-origin.svg'
import {
  Origin,
  origins,
  CropRegion,
  cropRegions,
  OffsetDirection,
  offsetDirections,
  offsetDirectionTextMap,
  cropRegionFrontSVGMap,
  cropRegionBackSVGMap,
  cropRegionSVGMap,
  cropRegionDescMap
} from '../constants'

import styles from './style.m.less'

const formItemLayout = {
  labelWidth: '86px',
  layout: 'horizontal'
} as const

export type CropFormValue = {
  enable: boolean
  origin: Origin
  region: CropRegion
  direction: OffsetDirection
  width: number
  height: number
  verticalOffset: number
  horizontalOffset: number
}

export function createCropFormState(advancedField: FieldState<boolean>, initVal?: Partial<CropFormValue>) {
  const defaultVal: CropFormValue = {
    enable: false,
    origin: Origin.NorthWest,
    region: CropRegion.Width,
    direction: OffsetDirection.None,
    width: 200,
    height: 200,
    verticalOffset: 10,
    horizontalOffset: 10,
    ...initVal
  }

  const enableField = new FieldState(defaultVal.enable, 0)

  const cropRegionField = new FieldState(defaultVal.region, 0)

  const directionField = new FieldState(defaultVal.direction, 0)

  /* eslint-disable no-underscore-dangle */
  const widthField = new FieldState(defaultVal.width).validators(rangeValidator(1, 9999))
    .disableValidationWhen(() => !(
      advancedField._value
      && enableField._value
      && (cropRegionField._value !== CropRegion.Height)
    ))

  const heightField = new FieldState(defaultVal.height).validators(rangeValidator(1, 9999))
    .disableValidationWhen(() => !(
      advancedField._value
      && enableField._value
      && (cropRegionField._value !== CropRegion.Width)
    ))

  const verticalOffsetField = new FieldState(defaultVal.verticalOffset).validators(rangeValidator(1))
    .disableValidationWhen(() => !(
      advancedField._value
      && enableField._value
      && directionField._value !== OffsetDirection.None
    ))

  const horizontalOffsetField = new FieldState(defaultVal.horizontalOffset).validators(rangeValidator(1))
    .disableValidationWhen(() => !(
      advancedField._value
      && enableField._value
      && directionField._value !== OffsetDirection.None
    ))
  /* eslint-enable no-underscore-dangle */

  return new FormState({
    enable: enableField,
    origin: new FieldState(defaultVal.origin),
    region: cropRegionField,
    direction: directionField,
    width: widthField,
    height: heightField,
    verticalOffset: verticalOffsetField,
    horizontalOffset: horizontalOffsetField
  })
}

interface Props {
  formState: ReturnType<typeof createCropFormState>
}

export default observer(function Crop({ formState }: Props) {
  const fields = formState.$
  const widthLabel = fields.region.value === CropRegion.Width ? '指定宽，高不变' : '宽度'
  const heightLabel = fields.region.value === CropRegion.Height ? '指定高，宽不变' : '高度'

  const regionWidthInputView = fields.region.value !== CropRegion.Height && (
    <FormItem required label={widthLabel} state={fields.width}>
      <InputGroup style={{ width: '170px' }}>
        <NumberInput state={fields.width} {...getPlaceHolderAndRange('请输入宽度', 1, 9999)} digits={0} />
        <InputGroupItem>PX</InputGroupItem>
      </InputGroup>
    </FormItem>
  )

  const regionHeightInputView = fields.region.value !== CropRegion.Width && (
    <FormItem required label={heightLabel} state={fields.height}>
      <InputGroup style={{ width: '170px' }}>
        <NumberInput state={fields.height} {...getPlaceHolderAndRange('请输入高度', 1, 9999)} digits={0} />
        <InputGroupItem>PX</InputGroupItem>
      </InputGroup>
    </FormItem>
  )

  const horizontalLabel = (
    fields.direction.value === OffsetDirection.LeftBottom
    || fields.direction.value === OffsetDirection.LeftTop
  )
    ? '左偏移量'
    : '右偏移量'

  const verticalLabel = (
    fields.direction.value === OffsetDirection.RightTop
    || fields.direction.value === OffsetDirection.LeftTop
  )
    ? '上偏移量'
    : '下偏移量'

  const offsetInputView = fields.direction.value !== OffsetDirection.None && (
    <div className={styles.offsetInputWrap}>
      <FormItem required state={fields.horizontalOffset} label={horizontalLabel}>
        <InputGroup style={{ width: '200px' }}>
          <NumberInput
            state={fields.horizontalOffset}
            {...getPlaceHolderAndRange(`请输入${horizontalLabel}`, 1)}
            digits={0}
          />
          <InputGroupItem>PX</InputGroupItem>
        </InputGroup>
      </FormItem>
      <FormItem required state={fields.verticalOffset} label={verticalLabel}>
        <InputGroup style={{ width: '200px' }}>
          <NumberInput
            state={fields.verticalOffset}
            {...getPlaceHolderAndRange(`请输入${verticalLabel}`, 1)}
            digits={0}
          />
          <InputGroupItem>PX</InputGroupItem>
        </InputGroup>
      </FormItem>
    </div>
  )

  const CropRegionFrontSVG = cropRegionFrontSVGMap[fields.region.value]
  const CropRegionBackSVG = cropRegionBackSVGMap[fields.region.value]

  return (
    <div className={styles.crop}>
      <RadioGroup state={fields.enable}>
        <Radio value={false}>不剪裁</Radio>
        <Radio value>剪裁</Radio>
      </RadioGroup>
      {fields.enable.value && (
        <>
          <FormItem label="选择原点" style={{ marginTop: '16px' }} {...formItemLayout} labelVerticalAlign="text">
            <div>点击下图中的 9 个点，为剪裁图片选择原点。</div>
            <div className={styles.cropOrigin}>
              <OriginSVG className={styles.origin} />
              {origins.map(origin => (
                <SelectedOriginSVG
                  key={origin}
                  className={`${origin} ${fields.origin.value === origin ? styles.selectedPoint : styles.point}`}
                  onClick={() => fields.origin.set(origin)}
                />
              ))}
            </div>
          </FormItem>
          <FormItem label="设置剪裁区域" {...formItemLayout} labelVerticalAlign="text">
            <div className={styles.cropRegionWrap}>
              {cropRegions.map(region => {
                const SVG = cropRegionSVGMap[region]
                const desc = cropRegionDescMap[region]
                return (
                  <Tooltip key={region} title={desc}>
                    <div
                      className={`${styles.region} ${region === fields.region.value ? styles.selected : ''}`}
                      onClick={() => fields.region.set(region)}
                    >
                      <SVG />
                    </div>
                  </Tooltip>
                )
              })}
            </div>
            <div className={styles.inputWrap}>
              {regionWidthInputView}
              {regionHeightInputView}
            </div>
          </FormItem>
          <FormItem label="设置偏移量" {...formItemLayout} labelVerticalAlign="text">
            <div className={styles.directionGroup}>
              <RadioGroup state={fields.direction}>
                {offsetDirections.map(direction => (
                  <Radio key={direction} value={direction}>
                    {offsetDirectionTextMap[direction]}
                  </Radio>
                ))}
              </RadioGroup>
            </div>
            <div className={styles.cropOffset}>
              <div className={`${styles.overlapWrap} ${styles.offsetWrap}`}>
                <RawSVG />
                <div className={`${styles.overlap} ${styles.front} ${fields.direction.value} ${fields.origin.value}`}>
                  <CropRegionFrontSVG />
                </div>
              </div>
              <SelectedOriginSVG className={`${styles.offsetPoint} ${fields.origin.value}`} />
              <div className={styles.offsetWrap}>
                <CropRegionBackSVG className={`${styles.back} ${fields.origin.value}`} />
                <CropRegionFrontSVG className={`${styles.front} ${fields.direction.value} ${fields.origin.value}`} />
              </div>
            </div>
            {offsetInputView}
          </FormItem>
        </>
      )}
    </div>
  )
})
