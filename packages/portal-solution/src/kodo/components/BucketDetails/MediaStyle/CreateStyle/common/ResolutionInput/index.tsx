import React from 'react'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { FieldState } from 'formstate-x'
import { SelectOption } from 'react-icecream-2'
import { Select, FormItem, InputGroup, InputGroupItem, NumberInput } from 'react-icecream-2/form-x'

import styles from './style.m.less'

export enum ResolutionScaleType {
  None = 'none',
  // 限定宽, 高同比例缩放
  ScaleWidth = 'scaleWidth',
  // 限定高, 宽同比例缩放
  ScaleHeight = 'scaleHeight',
  // 限定宽高同比例缩放
  ScaleWidthHeight = 'scaleWidthHeight',
}

const resolutionScaleTypeNameMap = {
  [ResolutionScaleType.None]: '与源视频一致',
  [ResolutionScaleType.ScaleWidth]: '限定宽、高同比例缩放',
  [ResolutionScaleType.ScaleHeight]: '限定高、宽同比例缩放',
  [ResolutionScaleType.ScaleWidthHeight]: '限定宽高同比例缩放'
}

interface Props {
  type: FieldState<ResolutionScaleType>
  width: FieldState<number | null>
  height: FieldState<number | null>
}

export const ResolutionInput = observer(function ResolutionInput(props: Props) {
  const { type, width, height } = props

  const handleDimensionChange = React.useCallback((t: 'width' | 'height') => {
    const min = 20
    const max = 3840
    const widthValue = width.value || 0
    const heightValue = height.value || 0

    runInAction(() => {
      if (t === 'width' && widthValue < min) {
        width.onChange(min)
      }
      if (t === 'height' && heightValue < min) {
        height.onChange(min)
      }

      if (t === 'width' && widthValue > max) {
        width.onChange(max)
      }
      if (t === 'height' && heightValue > max) {
        height.onChange(max)
      }

      if (heightValue > 2160 && widthValue > 2160) {
        if (t === 'width') {
          width.onChange(2160)
        } else {
          height.onChange(2160)
        }
      }
    })
  }, [height, width])

  const widthInputView = React.useMemo(() => (
    <FormItem required label="宽度" state={width} layout="horizontal" style={{ marginBottom: '0' }}>
      <InputGroup style={{ width: '140px' }}>
        <NumberInput min={20} digits={0} state={width} inputProps={{ onBlur: () => handleDimensionChange('width') }} />
        <InputGroupItem>PX</InputGroupItem>
      </InputGroup>
    </FormItem>
  ), [handleDimensionChange, width])

  const heightInputView = React.useMemo(() => (
    <FormItem required label="高度" state={height} layout="horizontal" style={{ marginBottom: '0' }}>
      <InputGroup style={{ width: '140px' }}>
        <NumberInput min={20} digits={0} state={height} inputProps={{ onBlur: () => handleDimensionChange('height') }} />
        <InputGroupItem>PX</InputGroupItem>
      </InputGroup>
    </FormItem>
  ), [handleDimensionChange, height])

  const showInput = type.value && type.value !== ResolutionScaleType.None

  return (
    <div className={styles.root}>
      <Select<ResolutionScaleType> state={type} style={showInput ? { marginBottom: '16px' } : {}}>
        <SelectOption value={ResolutionScaleType.None}>
          {resolutionScaleTypeNameMap[ResolutionScaleType.None]}
        </SelectOption>
        <SelectOption value={ResolutionScaleType.ScaleWidth}>
          {resolutionScaleTypeNameMap[ResolutionScaleType.ScaleWidth]}
        </SelectOption>
        <SelectOption value={ResolutionScaleType.ScaleHeight}>
          {resolutionScaleTypeNameMap[ResolutionScaleType.ScaleHeight]}
        </SelectOption>
        <SelectOption value={ResolutionScaleType.ScaleWidthHeight}>
          {resolutionScaleTypeNameMap[ResolutionScaleType.ScaleWidthHeight]}
        </SelectOption>
      </Select>
      {showInput && (
        <div className={styles.row}>
          {
            [ResolutionScaleType.ScaleWidthHeight, ResolutionScaleType.ScaleWidth].includes(type.value)
            && widthInputView
          }
          {
            [ResolutionScaleType.ScaleWidthHeight, ResolutionScaleType.ScaleHeight].includes(type.value)
            && heightInputView
          }
        </div>
      )}
    </div>
  )
})
