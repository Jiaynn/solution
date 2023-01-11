/**
 * @description More Config component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import classNames from 'classnames'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { bindInput, FieldState, FormState } from 'formstate-x'
import { Collapse, CollapsePanel, NumberInput as RawNumberInput, Slider } from 'react-icecream-2'
import { FormItem, InputGroup, InputGroupItem, NumberInput, Radio, RadioGroup, Switch } from 'react-icecream-2/form-x'

import { rangeValidator, getPlaceHolderAndRange } from 'kodo/transforms/image-style'

import { Description } from 'kodo/components/common/Description'
import { colorReg } from '../constants'
import ColorPicker from '../ColorPicker'

import styles from './style.m.less'

const formItemLayout = {
  labelWidth: '90px',
  layout: 'horizontal'
} as const

export type MoreFormValue = {
  expanded: boolean
  slim: boolean // 瘦身
  autoOrient: boolean // 自动旋正
  interlace: boolean // 渐进显示
  qualitySlider: number
  quality: number
  rotateEnable: boolean
  rotate: number // 图片旋转
  rotateBackground: string // 图片旋转背景颜色
  blurEnable: boolean
  blurRadiusSlier: number
  blurRadius: number // 高斯模糊-取样半径
  blurSigma: number // 高斯模糊-标准差
}

export function checkMoreFormExpanded(isAdvanced: boolean, initVal?: Partial<MoreFormValue>) {
  const isQualityChanged = initVal?.quality != null && initVal.quality !== 75 // 图片质量默认 75，如果设置非 75，则展开

  if (!isAdvanced) {
    return !!(
      initVal?.slim
      || initVal?.interlace
      || isQualityChanged
    )
  }

  return !!(
    initVal?.slim
    || initVal?.autoOrient
    || initVal?.interlace
    || isQualityChanged
    || initVal?.rotate
    || initVal?.rotateBackground
    || initVal?.blurEnable
  )
}

export function createMoreConfigForm(advancedField: FieldState<boolean>, initVal?: Partial<MoreFormValue>) {
  const shouldExpanded = checkMoreFormExpanded(advancedField.value, initVal)

  const defaultVal: MoreFormValue = {
    slim: false,
    autoOrient: false,
    interlace: false,
    qualitySlider: 75,
    quality: 75,
    rotateEnable: false,
    rotate: 1,
    rotateBackground: '#FFFFFF',
    blurEnable: false,
    blurRadiusSlier: 1,
    blurRadius: 1,
    blurSigma: 1,
    ...initVal,
    expanded: shouldExpanded
  }

  const qualityField = new FieldState(defaultVal.quality).validators(rangeValidator(1, 100))

  /* eslint-disable no-underscore-dangle */
  const rotateField = new FieldState(defaultVal.rotate).validators(rangeValidator(1, 360))
    .disableValidationWhen(() => !advancedField._value)

  const blurRadiusField = new FieldState(defaultVal.blurRadius).validators(rangeValidator(1, 50))
    .disableValidationWhen(() => !advancedField._value)

  const blurSigmaField = new FieldState(defaultVal.blurSigma).validators(rangeValidator(1))
    .disableValidationWhen(() => !advancedField._value)
  /* eslint-enable no-underscore-dangle */

  return new FormState({
    expanded: new FieldState(defaultVal.expanded, 0),
    slim: new FieldState(defaultVal.slim, 0), // 瘦身
    autoOrient: new FieldState(defaultVal.autoOrient), // 自动旋正
    interlace: new FieldState(defaultVal.interlace), // 渐进显示
    qualitySlider: new FieldState(defaultVal.quality).validators(rangeValidator(1, 100)),
    quality: qualityField,
    rotateEnable: new FieldState(defaultVal.rotateEnable, 0),
    rotate: rotateField, // 图片旋转
    rotateBackground: new FieldState(defaultVal.rotateBackground) // 图片旋转背景颜色
      .validators(value => !colorReg.test(value) && '请输入十六进制的颜色值'),
    blurEnable: new FieldState(defaultVal.blurEnable), // 高斯模糊是否开启
    blurRadiusSlier: new FieldState(defaultVal.blurRadius),
    blurRadius: blurRadiusField, // 高斯模糊-取样半径
    blurSigma: blurSigmaField // 高斯模糊-标准差
  })
}

interface Props {
  isEditMode: boolean
  isAdvanced: boolean
  imageSlimDescription?: string | null
  formState: ReturnType<typeof createMoreConfigForm>
}

export default observer(function More(props: Props) {
  const { isAdvanced, formState, imageSlimDescription } = props

  const fields = formState.$
  const onQualitySliderChange = React.useCallback(
    (val: number) => {
      runInAction(() => {
        fields.quality.set(val)
        fields.qualitySlider.set(val)
      })
    },
    [fields.quality, fields.qualitySlider]
  )

  const onQualityChange = React.useCallback(
    (val: number) => {
      if (Number.isInteger(val) && val >= 1 && val <= 100) {
        runInAction(() => {
          fields.quality.onChange(val)
          fields.qualitySlider.set(val)
        })
      } else fields.quality.onChange(val)
    },
    [fields.quality, fields.qualitySlider]
  )

  const onBlurRadiusSliderChange = React.useCallback(
    (val: number) => {
      runInAction(() => {
        fields.blurRadius.set(val)
        fields.blurRadiusSlier.set(val)
      })
    },
    [fields.blurRadius, fields.blurRadiusSlier]
  )

  const onBlurRadiusChange = React.useCallback(
    (val: number) => {
      if (Number.isInteger(val) && val >= 1 && val <= 50) {
        runInAction(() => {
          fields.blurRadius.onChange(val)
          fields.blurRadiusSlier.set(val)
        })
      } else fields.blurRadius.onChange(val)
    },
    [fields.blurRadius, fields.blurRadiusSlier]
  )

  const handleQualityBlur = React.useCallback(() => {
    if (!fields.quality.value) {
      fields.quality.set(75)
      fields.qualitySlider.set(75)
    }
  }, [fields.quality, fields.qualitySlider])

  const handleBlurRadiusBlur = React.useCallback(() => {
    if (!fields.blurRadius.value) {
      fields.blurRadius.set(1)
      fields.blurRadiusSlier.set(1)
    }
  }, [fields.blurRadius, fields.blurRadiusSlier])

  const imageSlimDesc = imageSlimDescription && (
    <Description tag="div" dangerouslyText={imageSlimDescription} />
  )

  const contentView = (
    <>
      <FormItem
        label="图片瘦身"
        {...formItemLayout}
        labelVerticalAlign="text"
        tip={fields.slim.value && (
          <div className={styles.slim}>
            {imageSlimDesc}
          </div>
        )}
      >
        <Switch state={fields.slim} />
      </FormItem>
      {isAdvanced && (
        <FormItem label="自动旋正" {...formItemLayout}>
          <Switch state={fields.autoOrient} />
        </FormItem>
      )}
      <FormItem label="渐进显示" {...formItemLayout}>
        <Switch state={fields.interlace} />
      </FormItem>
      <FormItem label="图片质量" {...formItemLayout}>
        <div className={styles.inputWrap}>
          <FormItem className={classNames(styles.formItem, styles.sliderWrapper)}>
            <Slider
              className={styles.slider}
              // eslint-disable-next-line no-underscore-dangle
              value={fields.qualitySlider._value}
              onChange={onQualitySliderChange}
              min={1}
              max={100}
            />
          </FormItem>
          <FormItem className={styles.formItem} state={fields.quality}>
            <InputGroup style={{ width: '120px' }}>
              <RawNumberInput
                inputProps={{ onBlur: handleQualityBlur }}
                // emptyValue={75}
                digits={0}
                // eslint-disable-next-line no-underscore-dangle
                value={fields.quality._value}
                onChange={onQualityChange}
                min={1}
                max={100}
              />
              <InputGroupItem>%</InputGroupItem>
            </InputGroup>
          </FormItem>
        </div>
      </FormItem>
      {isAdvanced && (
        <>
          <FormItem label="图片旋转" {...formItemLayout} labelVerticalAlign="text">
            <RadioGroup state={fields.rotateEnable} >
              <Radio value={false}>不旋转</Radio>
              <Radio value>自定义角度</Radio>
            </RadioGroup>
            {formState.$.rotateEnable.value && (
              <div className={classNames(styles.inputWrap, styles.expandedInputWrapper)}>
                <FormItem className={styles.formItem} label="旋转角度" state={fields.rotate}>
                  <InputGroup style={{ width: '120px' }}>
                    <NumberInput
                      emptyValue={1}
                      digits={0}
                      state={fields.rotate}
                      {...getPlaceHolderAndRange('', 1, 360)}
                    />
                    <InputGroupItem>度</InputGroupItem>
                  </InputGroup>
                </FormItem>
                <FormItem className={styles.formItem} label="背景颜色" state={fields.rotateBackground}>
                  <ColorPicker emptyValue="#FFFFFF" {...bindInput(fields.rotateBackground)} />
                </FormItem>
              </div>
            )}
          </FormItem>
          <FormItem label="高斯模糊" {...formItemLayout} labelVerticalAlign="text">
            <RadioGroup state={fields.blurEnable}>
              <Radio value={false}>不启用</Radio>
              <Radio value>自定义参数</Radio>
            </RadioGroup>
            {fields.blurEnable.value && (
              <>
                <div className={classNames(styles.inputWrap, styles.expandedInputWrapper)}>
                  <FormItem className={classNames(styles.formItem, styles.blurRadius)} label="取样半径">
                    <Slider
                      className={styles.slider}
                      // eslint-disable-next-line no-underscore-dangle
                      value={fields.blurRadiusSlier._value}
                      onChange={onBlurRadiusSliderChange}
                      min={1}
                      max={50}
                    />
                  </FormItem>
                  <FormItem className={styles.formItem} state={fields.blurRadius}>
                    <InputGroup style={{ width: '120px' }}>
                      <RawNumberInput
                        inputProps={{ onBlur: handleBlurRadiusBlur }}
                        digits={0}
                        // eslint-disable-next-line no-underscore-dangle
                        value={fields.blurRadius._value}
                        onChange={onBlurRadiusChange}
                        {...getPlaceHolderAndRange('', 1, 50)}
                      />
                      <InputGroupItem>PX</InputGroupItem>
                    </InputGroup>
                  </FormItem>
                </div>
                <FormItem className={classNames(styles.formItem, styles.blurSigma)} label="标准差" state={fields.blurSigma}>
                  <NumberInput emptyValue={1} digits={0} state={fields.blurSigma} {...getPlaceHolderAndRange('', 1)} />
                </FormItem>
              </>
            )}
          </FormItem>
        </>
      )}
    </>
  )

  return (
    <div>
      <Collapse defaultValue={(!props.isEditMode || fields.expanded.value) ? ['default'] : []}>
        <CollapsePanel title="更多配置" value="default">
          {contentView}
        </CollapsePanel>
      </Collapse>
    </div>
  )
})
