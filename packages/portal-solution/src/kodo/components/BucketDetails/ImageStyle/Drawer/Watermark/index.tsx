/**
 * @description Watermark component
 * @author duli <duli@qiniu.com>
 */

import React from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import {
  FormItem, InputGroup,
  InputGroupItem, NumberInput,
  Radio, RadioGroup, Select, SelectOption, TextInput
} from 'react-icecream-2/form-x'
import { Collapse, CollapsePanel, Slider, NumberInput as RawNumberInput } from 'react-icecream-2'
import { bindInput, FieldState, FormState } from 'formstate-x'

import { integerValidator } from 'kodo/utils/form'

import { getPlaceHolderAndRange, rangeValidator } from 'kodo/transforms/image-style'
import {
  colorReg,
  Origin,
  origins,
  watermarkFontFamily,
  WatermarkMode,
  watermarkOriginTextMap
} from '../constants'
import ColorPicker from '../ColorPicker'

import styles from './style.m.less'

const formItemLayout = {
  labelWidth: '90px',
  layout: 'horizontal'
} as const

export type WatermarkFormValue = {
  mode: WatermarkMode // 基本缩放方式
  url: string // 具体方式
  words: string // 具体方式
  fontSize: number
  fontColor: string
  fontFamily: string
  opacitySlider: number
  opacity: number
  origin: Origin
  horizontal: number // 水平边距
  vertical: number // 垂直边距
}

export function createWatermarkFormState(
  outputFormat: FieldState<string>,
  initVal?: Partial<WatermarkFormValue>
) {
  const defaultVal: WatermarkFormValue = {
    mode: WatermarkMode.None,
    url: '',
    words: '',
    fontSize: 12,
    fontColor: '#000000',
    fontFamily: watermarkFontFamily[0],
    opacitySlider: 100,
    opacity: 100,
    origin: Origin.SouthEast,
    horizontal: 10,
    vertical: 10,
    ...initVal
  }

  /* eslint-disable no-underscore-dangle */
  const modeField = new FieldState(defaultVal.mode, 0).validators(value => {
    if (outputFormat.value === 'svg' && value !== WatermarkMode.None) {
      return '当输出格式为 SVG 时不支持设置水印'
    }
  })

  return new FormState({
    mode: modeField,
    url: new FieldState(defaultVal.url)
      .validators(url => !url && '请输入水印图片')
      .disableValidationWhen(() => modeField._value !== WatermarkMode.Picture),
    words: new FieldState(defaultVal.words)
      .validators(word => !word && '请输入水印文字')
      .disableValidationWhen(() => modeField._value !== WatermarkMode.Word),
    fontSize: new FieldState(defaultVal.fontSize)
      .validators(rangeValidator(1))
      .disableValidationWhen(() => modeField._value !== WatermarkMode.Word),
    fontColor: new FieldState(defaultVal.fontColor)
      .validators(value => !colorReg.test(value) && '请输入十六进制的颜色值')
      .disableValidationWhen(() => modeField._value !== WatermarkMode.Word),
    fontFamily: new FieldState<string>(defaultVal.fontFamily),
    opacitySlider: new FieldState(defaultVal.opacity),
    opacity: new FieldState(defaultVal.opacity)
      .validators(rangeValidator(1, 100))
      .disableValidationWhen(() => modeField._value === WatermarkMode.None),
    origin: new FieldState(defaultVal.origin, 0),
    horizontal: new FieldState(defaultVal.horizontal)
      .validators(integerValidator()) // 水平边距
      .disableValidationWhen(() => modeField._value === WatermarkMode.None),
    vertical: new FieldState(defaultVal.vertical)
      .validators(integerValidator()) // 垂直边距
      .disableValidationWhen(() => modeField._value === WatermarkMode.None)
  })
  /* eslint-enable no-underscore-dangle */
}

interface Props {
  isEditMode: boolean
  formState: ReturnType<typeof createWatermarkFormState>
}

export default observer(function Watermark(props: Props) {
  const { formState } = props
  const fields = formState.$

  const onOpacitySliderChange = React.useCallback(
    (val: number) => {
      runInAction(() => {
        fields.opacity.set(val)
        fields.opacitySlider.set(val)
      })
    },
    [fields.opacity, fields.opacitySlider]
  )

  const onOpacityChange = React.useCallback(
    (val: number) => {
      if (Number.isInteger(val) && val >= 1 && val <= 100) {
        runInAction(() => {
          fields.opacity.onChange(val)
          fields.opacitySlider.set(val)
        })
      } else fields.opacity.onChange(val)
    },
    [fields.opacity, fields.opacitySlider]
  )

  const handleOpacityBlur = React.useCallback(() => {
    if (!fields.opacity.value) {
      fields.opacity.set(100)
      fields.opacitySlider.set(100)
    }
  }, [fields.opacity, fields.opacitySlider])

  const urlInputView = (
    <FormItem label="水印图片" required state={fields.url} {...formItemLayout}>
      <TextInput
        state={fields.url}
        className={styles.urlOrWord}
        placeholder="请输入水印图片 URL"
      />
    </FormItem>
  )

  const wordInputView = (
    <FormItem label="水印文字" required state={fields.words} {...formItemLayout}>
      <TextInput state={fields.words} placeholder="请输入水印文字" className={styles.urlOrWord} />
    </FormItem>
  )

  const urlOrWordView = fields.mode.value === WatermarkMode.Picture ? urlInputView : wordInputView

  const fontView = fields.mode.value === WatermarkMode.Word && (
    <FormItem label="水印字体" {...formItemLayout}>
      <div className={styles.rowInputWrap}>
        <Select state={fields.fontFamily} className={styles.fontFamily} placeholder="字体">
          {watermarkFontFamily.map(font => (
            <SelectOption key={font} value={font}>
              {font}
            </SelectOption>
          ))}
        </Select>
        <FormItem layout="horizontal" state={fields.fontSize}>
          <InputGroup style={{ width: '120px' }}>
            <NumberInput emptyValue={12} state={fields.fontSize} min={0} digits={0} />
            <InputGroupItem>磅</InputGroupItem>
          </InputGroup>
        </FormItem>
        <FormItem layout="horizontal" state={fields.fontColor}>
          <ColorPicker emptyValue="#000000" {...bindInput(fields.fontColor)} />
        </FormItem>
      </div>
    </FormItem>
  )

  const opacityView = (
    <FormItem label="水印不透明度" {...formItemLayout}>
      <div className={styles.rowInputWrap}>
        <Slider
          min={1}
          className={styles.slider}
          onChange={onOpacitySliderChange}
          // eslint-disable-next-line no-underscore-dangle
          value={fields.opacitySlider._value}
        />
        <FormItem state={fields.opacity}>
          <InputGroup style={{ width: '120px' }}>
            <RawNumberInput
              inputProps={{ onBlur: handleOpacityBlur }}
              digits={0}
              // eslint-disable-next-line no-underscore-dangle
              value={fields.opacity._value}
              onChange={onOpacityChange}
              {...getPlaceHolderAndRange('', 1, 100)}
            />
            <InputGroupItem>%</InputGroupItem>
          </InputGroup>
        </FormItem>
      </div>
    </FormItem>
  )

  const originView = (
    <FormItem label="水印位置" {...formItemLayout}>
      <div className={styles.originWrap}>
        {origins.map(origin => (
          <div
            key={origin}
            className={`${styles.origin} ${origin === fields.origin.value ? styles.selected : ''}`}
            onClick={() => fields.origin.set(origin)}
          >
            {watermarkOriginTextMap[origin]}
          </div>
        ))}
      </div>
      <div className={styles.rowInputWrap}>
        <FormItem label="水平边距" state={fields.horizontal}>
          <InputGroup style={{ width: '130px' }}>
            <NumberInput emptyValue={10} state={fields.horizontal} digits={0} />
            <InputGroupItem>PX</InputGroupItem>
          </InputGroup>
        </FormItem>
        <FormItem label="垂直边距" state={fields.vertical}>
          <InputGroup style={{ width: '130px' }}>
            <NumberInput emptyValue={10} state={fields.vertical} digits={0} />
            <InputGroupItem>PX</InputGroupItem>
          </InputGroup>
        </FormItem>
      </div>
    </FormItem>
  )

  const shouldExpandedCollapse = props.isEditMode
    ? fields.mode.value !== WatermarkMode.None
    : true

  return (
    <div>
      <Collapse defaultValue={shouldExpandedCollapse ? ['default'] : []}>
        <CollapsePanel title="水印设置" value="default">
          <FormItem state={fields.mode}>
            <FormItem label="水印类型" {...formItemLayout} labelVerticalAlign="text">
              <RadioGroup state={fields.mode}>
                <Radio value={WatermarkMode.None}>不加水印</Radio>
                <Radio value={WatermarkMode.Picture}>图片水印</Radio>
                <Radio value={WatermarkMode.Word}>文字水印</Radio>
              </RadioGroup>
            </FormItem>
          </FormItem>
          {fields.mode.value !== WatermarkMode.None && (
            <>
              {urlOrWordView}
              {fontView}
              {opacityView}
              {originView}
            </>
          )}
        </CollapsePanel>
      </Collapse>
    </div>
  )
})
