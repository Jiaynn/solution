/**
 * @file 视频封面
 */
import React, { useMemo, useEffect, useCallback } from 'react'
import { reaction } from 'mobx'
import { observer } from 'mobx-react'
import { Form } from 'react-icecream/lib'
import { useFormstateX } from 'react-icecream-2/form-x'

import { MediaStyle } from 'kodo/apis/bucket/image-style'

import { FormController } from '../../common/types'
import {
  Command as DynamicCoverCommand,
  Format as DynamicCoverFormat
} from '../commands/avthumb'
import {
  Command as StaticCoverCommand,
  Format as StaticCoverFormat
} from '../commands/vframe'
import { CoverScaleType, CoverType, isValidSourceFormat } from '../utils'

import { ParsedResult } from './command'
import { createStyleConfigFormState } from './style-config-form'
import { createBatchCreateFormState } from './batch-create-form'
import StyleConfig from './StyleConfig'
import BatchCreate from './BatchCreate'
import { useCommands } from '../../common/command'

type Props = {
  isEditMode: boolean
  persistenceFileKey: string | undefined
  initStyles?: MediaStyle[]
  initSourceFormat?: string // 如果提供该值，则禁止修改输入输出格式
  onStyleChange: (style: MediaStyle) => void
  onCreateController(controller: FormController): void
}

export default observer(function CoverForm(props: Props) {
  const { persistenceFileKey, isEditMode, onStyleChange, initStyles = [], onCreateController } = props

  const initSourceFormat = props.initSourceFormat && (
    isValidSourceFormat(props.initSourceFormat)
      ? props.initSourceFormat
      : ''
  )

  const commands = useCommands()
  const [parsedInitStyles, setParsedInitStyles] = React.useState<ParsedResult[]>([])

  React.useEffect(() => {
    let ignore = false
    Promise.all(initStyles.map(style => (
      commands.videoCover.parse(style)
    ))).then(list => !ignore && setParsedInitStyles(list))

    return () => { ignore = true }
  }, [commands.videoCover, initStyles])

  const styleConfigFormState = useFormstateX(createStyleConfigFormState, [parsedInitStyles[0], initSourceFormat])

  const batchCreateFormState = useFormstateX(
    () => {
      const batchStyles = parsedInitStyles.slice(1)
      return createBatchCreateFormState(styleConfigFormState, isEditMode, batchStyles)
    },
    [styleConfigFormState, isEditMode, parsedInitStyles, styleConfigFormState.value.sourceFormat]
  )

  const validate = useCallback(async () => {
    const resultList = await Promise.all([
      styleConfigFormState.validate(),
      batchCreateFormState.validate()
    ])

    return resultList.some(item => item.hasError)
  }, [batchCreateFormState, styleConfigFormState])

  const getStyleList = useCallback(() => {
    const styleConfigValue = styleConfigFormState.value
    const batchCreateValues = batchCreateFormState.value
    const configs = [styleConfigValue]

    for (const item of batchCreateValues) {
      configs.push({
        ...styleConfigValue,
        name: item.name,
        sourceFormat: item.sourceFormat,
        nameSuffix: styleConfigValue.nameSuffix
      })
    }

    const mediaStyles: MediaStyle[] = configs.map(config => {
      const styleNameSuffix = config.nameSuffix === '' ? '' : '.' + config.nameSuffix
      const name = config.name + styleNameSuffix
      const sourceFormat = config.sourceFormat || null
      let w: number | null = config.coverScaleWidth
      let h: number | null = config.coverScaleHeight
      if (config.coverScaleType === CoverScaleType.None) {
        w = null
        h = null
      } else if (config.coverScaleType === CoverScaleType.ScaleHeight) {
        w = null
      } else if (config.coverScaleType === CoverScaleType.ScaleWidth) {
        h = null
      }
      if (config.coverType === CoverType.Dynamic) {
        const dynamicCommand: DynamicCoverCommand = {
          type: 'avthumb',
          format: config.outputFormat as DynamicCoverFormat,
          offset: config.cutPartStartTimeMinutes * 60 + config.cutPartStartTimeSeconds,
          duration: config.cutPartStartTimeDuration,
          w,
          h,
          autoScale: config.scaleAutoAdapt === 0 ? null : config.scaleAutoAdapt
        }
        return commands.videoCover.generate({
          name,
          sourceFormat,
          command: dynamicCommand
        })
      }

      const staticCommand: StaticCoverCommand = {
        type: 'vframe',
        format: config.outputFormat as StaticCoverFormat,
        offset: config.cutPicMinutes * 60 + config.cutPicSeconds,
        w,
        h
      }

      return commands.videoCover.generate({
        name,
        sourceFormat,
        command: staticCommand
      })
    })

    return mediaStyles
  }, [batchCreateFormState.value, commands.videoCover, styleConfigFormState.value])

  const controller = useMemo<FormController>(() => ({
    validate,
    getStyleList
  }), [getStyleList, validate])

  useEffect(() => {
    onCreateController(controller)
  }, [controller, onCreateController])

  // 当前正在编辑的 style 发生变化时
  // 自动触发 onStyleChange 通知外部
  useEffect(() => reaction(
    () => [styleConfigFormState.value, batchCreateFormState.value],
    async () => {
      try {
        onStyleChange(getStyleList()[0])
      } catch (error) { /** 忽略错误 */ }
    },
    {
      fireImmediately: true
    }
  ), [batchCreateFormState, getStyleList, onStyleChange, styleConfigFormState, validate])

  function renderBatchCreate() {
    if (styleConfigFormState && styleConfigFormState.$.sourceFormat.value === '') {
      return null
    }

    // initStyles 的第一个是主要样式，也就是给样式配置里展示的 style，剩余的才是批量
    // 如果只有一个说明没有批量，则不展示
    if (isEditMode && initStyles && initStyles.length === 1) {
      return null
    }

    if (isEditMode && batchCreateFormState.$.length === 0) {
      return null
    }

    return (
      <BatchCreate
        isEditMode={isEditMode}
        formState={batchCreateFormState}
        styleConfigFormState={styleConfigFormState}
      />
    )
  }

  return (
    <Form>
      <StyleConfig
        isEditMode={isEditMode}
        formState={styleConfigFormState}
        sourceFormatDisabled={initSourceFormat != null}
        persistenceFileKey={persistenceFileKey}
      />
      {renderBatchCreate()}
    </Form>
  )
})
