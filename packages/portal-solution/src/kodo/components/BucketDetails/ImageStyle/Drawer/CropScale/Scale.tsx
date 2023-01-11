/**
 * @description Scale component
 * @author duli <duli@qiniu.com>
 */

import * as React from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { RadioGroup, Radio, Tooltip } from 'react-icecream-2'
import { FieldState, FormState } from 'formstate-x'
import { FormItem, InputGroup, InputGroupItem, NumberInput } from 'react-icecream-2/form-x'

import { getPlaceHolderAndRange, rangeValidator } from 'kodo/transforms/image-style'
import {
  AdvancedScaleType,
  BasicScaleType,
  advancedScaleTypeInfo,
  advancedScaleKeys,
  BasicScaleCategory,
  basicScaleCategories,
  basicScaleCategoryTextMap,
  scaleCategory2ScaleType,
  basicScaleTypeInfo
} from '../constants'

import styles from './style.m.less'

interface AdvancedScaleSelectProps {
  scaleType: FieldState<AdvancedScaleType>
  width: FieldState<number>
  height: FieldState<number>
  widthPercent: FieldState<number>
  heightPercent: FieldState<number>
  percent: FieldState<number>
  totalPixel: FieldState<number>
}

const formItemLayout = {
  labelWidth: '30px',
  layout: 'horizontal'
} as const

export type ScaleFormValue = {
  basicScaleCategory: BasicScaleCategory // 基本缩放类别
  basicScaleType: BasicScaleType // 基础缩放类型
  advancedScaleType: AdvancedScaleType // 高级缩放类型
  short: number
  long: number
  width: number
  height: number
  widthPercent: number // 宽度缩放
  heightPercent: number // 高度缩放
  percent: number // 原图缩放
  totalPixel: number
}

export function createScaleFormState(advancedField: FieldState<boolean>, initVal?: Partial<ScaleFormValue>) {
  const defaultVal: ScaleFormValue = {
    basicScaleCategory: 0,
    basicScaleType: BasicScaleType.WHCenter,
    advancedScaleType: AdvancedScaleType.None,
    short: 200,
    long: 200,
    width: 200,
    height: 200,
    widthPercent: 50,
    heightPercent: 50,
    percent: 50,
    totalPixel: 40000,
    ...initVal
  }

  const basicScaleCategoryField = new FieldState(defaultVal.basicScaleCategory, 0)

  /* eslint-disable no-underscore-dangle */
  const basicScaleTypeField = new FieldState<BasicScaleType>(defaultVal.basicScaleType)
    .disableValidationWhen(() => advancedField._value)

  const advancedScaleTypeField = new FieldState<AdvancedScaleType>(defaultVal.advancedScaleType, 0)
    .disableValidationWhen(() => !advancedField._value)

  const shortField = new FieldState(defaultVal.short).validators(rangeValidator(1, 9999))
    .disableValidationWhen(() => advancedField._value || basicScaleCategoryField._value !== BasicScaleCategory.LS)

  const longField = new FieldState(defaultVal.long).validators(rangeValidator(1, 9999))
    .disableValidationWhen(() => advancedField._value || basicScaleCategoryField._value !== BasicScaleCategory.LS)

  const widthField = new FieldState(defaultVal.width).validators(rangeValidator(1, 9999))
    .disableValidationWhen(() => (
      advancedField._value
        ? (
          advancedScaleTypeField._value === AdvancedScaleType.None
          || advancedScaleTypeField._value === AdvancedScaleType.WAuto
          || advancedScaleTypeField._value === AdvancedScaleType.HPercent
          || advancedScaleTypeField._value === AdvancedScaleType.WPercent
          || advancedScaleTypeField._value === AdvancedScaleType.Percent
          || advancedScaleTypeField._value === AdvancedScaleType.Pixel
        )
        : basicScaleCategoryField._value !== BasicScaleCategory.WH
    ))

  const heightField = new FieldState(defaultVal.height).validators(rangeValidator(1, 9999))
    .disableValidationWhen(() => (
      advancedField._value
        ? (
          advancedScaleTypeField._value === AdvancedScaleType.None
          || advancedScaleTypeField._value === AdvancedScaleType.HAuto
          || advancedScaleTypeField._value === AdvancedScaleType.HPercent
          || advancedScaleTypeField._value === AdvancedScaleType.WPercent
          || advancedScaleTypeField._value === AdvancedScaleType.Percent
          || advancedScaleTypeField._value === AdvancedScaleType.Pixel
        )
        : basicScaleCategoryField._value !== BasicScaleCategory.WH
    ))

  const widthPercentFiled = new FieldState(defaultVal.widthPercent).validators(rangeValidator(1, 999))
    .disableValidationWhen(() => !advancedField._value || advancedScaleTypeField._value !== AdvancedScaleType.WPercent)

  const heightPercentField = new FieldState(defaultVal.heightPercent).validators(rangeValidator(1, 999))
    .disableValidationWhen(() => !advancedField._value || advancedScaleTypeField._value !== AdvancedScaleType.HPercent)

  const percentField = new FieldState(defaultVal.percent).validators(rangeValidator(1, 999))
    .disableValidationWhen(() => !advancedField._value || advancedScaleTypeField._value !== AdvancedScaleType.Percent)

  const totalPixelField = new FieldState(defaultVal.totalPixel).validators(rangeValidator(1, 24999999))
    .disableValidationWhen(() => !advancedField._value || advancedScaleTypeField._value !== AdvancedScaleType.Pixel)
  /* eslint-enable no-underscore-dangle */

  return new FormState({
    basicScaleCategory: basicScaleCategoryField, // 基本缩放方式
    basicScaleType: basicScaleTypeField, // 基本缩放类型
    advancedScaleType: advancedScaleTypeField, // 高级缩放类型
    short: shortField,
    long: longField,
    width: widthField,
    height: heightField,
    widthPercent: widthPercentFiled, // 宽度缩放
    heightPercent: heightPercentField, // 高度缩放
    percent: percentField, // 原图缩放
    totalPixel: totalPixelField // 总像素
  })
}

const AdvancedScaleSelect = observer(function AdvancedScaleSelect(props: AdvancedScaleSelectProps) {
  const { scaleType, width, height, widthPercent, heightPercent, percent, totalPixel } = props
  const selectedType = advancedScaleTypeInfo[scaleType.value].params
  const widthLabel = `宽度${selectedType.width === '%' ? '缩放' : ''}`
  const heightLabel = `高度${selectedType.height === '%' ? '缩放' : ''}`
  const heightState = selectedType.height === '%' ? heightPercent : height
  const widthState = selectedType.width === '%' ? widthPercent : width
  return (
    <div>
      <div className={styles.scaleSelect} style={{ marginTop: '2px' }}>
        {advancedScaleKeys.map(key => {
          const info = advancedScaleTypeInfo[key]
          const SVG = info.image
          const context = (
            <div
              key={key}
              className={`${styles.selectItem} ${scaleType.value === key ? styles.selected : ''}`}
              onClick={() => scaleType.set(key)}
            >
              <SVG className={styles.selectImage} />
              <div className={styles.scaleDesc}>{info.name}</div>
            </div>
          )

          if (!info.description) {
            return context
          }

          return (<Tooltip key={key} title={info.description}>{context}</Tooltip>)
        })}
      </div>
      <div className={styles.rowInputWrap}>
        {selectedType.width && (
          <FormItem
            required
            label={widthLabel}
            state={widthState}
            {...formItemLayout}
            labelWidth={selectedType.width === '%' ? '60px' : '30px'}
          >
            <InputGroup style={{ width: selectedType.width === '%' ? '230px' : '170px' }}>
              <NumberInput
                digits={0}
                state={widthState}
                {...getPlaceHolderAndRange(
                  '请输入宽度' + (selectedType.width === '%' ? '缩放比例' : ''),
                  1,
                  selectedType.width === '%' ? 999 : 9999
                )}
              />
              <InputGroupItem>{selectedType.width}</InputGroupItem>
            </InputGroup>
          </FormItem>
        )}
        {selectedType.height && (
          <FormItem
            required
            label={heightLabel}
            state={heightState}
            {...formItemLayout}
            labelWidth={selectedType.height === '%' ? '60px' : '30px'}
          >
            <InputGroup style={{ width: selectedType.height === '%' ? '230px' : '170px' }}>
              <NumberInput
                digits={0}
                state={heightState}
                {...getPlaceHolderAndRange(
                  '请输入高度' + (selectedType.height === '%' ? '缩放比例' : ''),
                  1,
                  selectedType.height === '%' ? 999 : 9999
                )}
              />
              <InputGroupItem>{selectedType.height}</InputGroupItem>
            </InputGroup>
          </FormItem>
        )}
        {selectedType.scale && (
          <FormItem required label="原图缩放" state={percent} {...formItemLayout} labelWidth="60px">
            <InputGroup style={{ width: '230px' }}>
              <NumberInput
                digits={0}
                state={percent}
                {...getPlaceHolderAndRange('请输入原图缩放比例', 1, 999)}
              />
              <InputGroupItem>%</InputGroupItem>
            </InputGroup>
          </FormItem>
        )}
        {selectedType.pixels && (
          <FormItem
            required
            label="总像素值"
            state={totalPixel}
            {...formItemLayout}
            labelWidth="60px"
            className={styles.totalPixelLimit}
          >
            <InputGroup style={{ width: '340px' }}>
              <NumberInput
                digits={0}
                state={totalPixel}
                {...getPlaceHolderAndRange('请输入总像素值', 1, 24999999)}
              />
              <InputGroupItem>PX</InputGroupItem>
            </InputGroup>
          </FormItem>
        )}
      </div>
    </div>
  )
})

interface BasicScaleSelectProps {
  basicScaleCategory: FieldState<BasicScaleCategory>
  scaleType: FieldState<BasicScaleType>
  short: FieldState<number>
  long: FieldState<number>
  width: FieldState<number>
  height: FieldState<number>
}

const BasicScaleSelect = observer(function BasicScaleSelect(props: BasicScaleSelectProps) {
  const { basicScaleCategory, scaleType, short, long, width, height } = props

  const onBasicScaleChange = React.useCallback(
    (t: BasicScaleCategory) => {
      runInAction(() => {
        if (t !== BasicScaleCategory.None) scaleType.set(scaleCategory2ScaleType[t][0])
        basicScaleCategory.set(t)
      })
    },
    [basicScaleCategory, scaleType]
  )

  const lsView = basicScaleCategory.value === BasicScaleCategory.LS && (
    <div className={styles.rowInputWrap}>
      <FormItem required label="长边" state={long} {...formItemLayout}>
        <InputGroup style={{ width: '170px' }}>
          <NumberInput
            digits={0}
            state={long}
            {...getPlaceHolderAndRange('请输入长边', 1, 9999)}
          />
          <InputGroupItem>PX</InputGroupItem>
        </InputGroup>
      </FormItem>
      <FormItem required label="短边" state={short} {...formItemLayout}>
        <InputGroup style={{ width: '170px' }}>
          <NumberInput
            digits={0}
            state={short}
            {...getPlaceHolderAndRange('请输入短边', 1, 9999)}
          />
          <InputGroupItem>PX</InputGroupItem>
        </InputGroup>
      </FormItem>
    </div>
  )

  const whView = basicScaleCategory.value === BasicScaleCategory.WH && (
    <div className={styles.rowInputWrap}>
      <FormItem required label="宽度" state={width} {...formItemLayout}>
        <InputGroup style={{ width: '170px' }}>
          <NumberInput
            digits={0}
            state={width}
            {...getPlaceHolderAndRange('请输入宽度', 1, 9999)}
          />
          <InputGroupItem>PX</InputGroupItem>
        </InputGroup>
      </FormItem>
      <FormItem required label="高度" state={height} {...formItemLayout}>
        <InputGroup style={{ width: '170px' }}>
          <NumberInput
            digits={0}
            state={height}
            {...getPlaceHolderAndRange('请输入高度', 1, 9999)}
          />
          <InputGroupItem>PX</InputGroupItem>
        </InputGroup>
      </FormItem>
    </div>
  )

  const basicScaleTypeSelectView = (
    <RadioGroup onChange={v => onBasicScaleChange(v)} value={basicScaleCategory.value}>
      {basicScaleCategories.map(t => (
        <Radio key={t} value={t}>
          {basicScaleCategoryTextMap[t]}
        </Radio>
      ))}
    </RadioGroup>
  )

  const specificSelectView = basicScaleCategory.value !== BasicScaleCategory.None && (
    <div className={styles.scaleSelect}>
      {(scaleCategory2ScaleType[basicScaleCategory.value] as unknown as any[]).map(key => {
        const info = basicScaleTypeInfo[key]
        const SVG = info.image
        return (
          <Tooltip title={info.description} key={key}>
            <div
              className={`${styles.selectItem} ${scaleType.value === key ? styles.selected : ''}`}
              onClick={() => scaleType.set(key)}
            >
              <SVG className={styles.selectImage} />
              <span className={styles.scaleDesc}>{info.name}</span>
            </div>
          </Tooltip>
        )
      })}
    </div>
  )

  return (
    <div>
      {basicScaleTypeSelectView}
      {specificSelectView}
      {lsView}
      {whView}
    </div>
  )
})

interface Props {
  isAdvanced: boolean
  formState: ReturnType<typeof createScaleFormState>
}

export default observer(function Scale({ isAdvanced, formState }: Props) {
  const advancedScaleSelectView = (
    <AdvancedScaleSelect
      scaleType={formState.$.advancedScaleType}
      width={formState.$.width}
      height={formState.$.height}
      heightPercent={formState.$.heightPercent}
      widthPercent={formState.$.widthPercent}
      percent={formState.$.percent}
      totalPixel={formState.$.totalPixel}
    />
  )

  const basicScaleSelectView = (
    <BasicScaleSelect
      basicScaleCategory={formState.$.basicScaleCategory}
      scaleType={formState.$.basicScaleType}
      short={formState.$.short}
      long={formState.$.long}
      width={formState.$.width}
      height={formState.$.height}
    />
  )

  return <div className={styles.scale}>{isAdvanced ? advancedScaleSelectView : basicScaleSelectView}</div>
})
