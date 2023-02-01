import { reaction } from 'mobx'
import { FieldState, FormState } from 'formstate-x'

import { parseStyleName, styleNameValidator } from '../../common/command'
import { CoverScaleType, SourceFormat, OutputFormat, CoverType, getCoverScaleType, outputFormatList } from '../utils'
import { AutoScale } from '../commands/avthumb'
import { isVframeCommand as isStaticCommand } from '../commands/vframe'

import { ParsedResult } from './command'

export function getFormInitValues(initStyle?: ParsedResult): StyleConfigFormStateValues {
  const values: StyleConfigFormStateValues = {
    sourceFormat: SourceFormat.Mp4,
    styleNameInput: '',
    // 需手动和 coverSuffix 保持一致
    // 从代码模式进入视图模式如果当前值为空，这个时候不需要和 coverSuffix 同步
    // coverSuffix 的 reaction 没有立即触发，所以默认值需要手动同步
    styleNameSuffix: OutputFormat.Jpg,
    coverType: CoverType.Static,
    coverSuffix: OutputFormat.Jpg,
    cutPicMinutes: 0,
    cutPicSeconds: 0,
    cutPartStartTimeMinutes: 0,
    cutPartStartTimeSeconds: 0,
    cutPartStartTimeDuration: 2,
    coverScaleType: CoverScaleType.None,
    coverScaleWidth: 200, // 界面默认值 - 不是命令默认值
    coverScaleHeight: 200, // 界面默认值 - 不是命令默认值
    scaleAutoAdapt: 0
  }
  if (initStyle != null) {
    const { name, sourceFormat, command } = initStyle
    values.sourceFormat = sourceFormat ?? ''
    const { name: styleName, nameSuffix: styleSuffix } = parseStyleName(name, outputFormatList)
    values.styleNameInput = styleName
    values.styleNameSuffix = styleSuffix
    if (isStaticCommand(command)) {
      values.coverType = CoverType.Static
      values.coverSuffix = command.format as OutputFormat
      values.coverScaleType = getCoverScaleType(command.w, command.h)
      values.coverScaleWidth = command.w ?? 200 // 界面默认值 - 不是命令默认值
      values.coverScaleHeight = command.h ?? 200 // 界面默认值 - 不是命令默认值
      values.cutPicMinutes = command.offset >= 60 ? Math.floor(command.offset / 60) : 0
      values.cutPicSeconds = command.offset >= 60 ? +(command.offset % 60).toFixed(3) : command.offset

      return values
    }
    values.coverType = CoverType.Dynamic
    values.coverSuffix = command.format as OutputFormat
    values.coverScaleType = getCoverScaleType(command.w, command.h)
    values.coverScaleWidth = command.w ?? 200 // 界面默认值 - 不是命令默认值
    values.coverScaleHeight = command.h ?? 200 // 界面默认值 - 不是命令默认值
    values.scaleAutoAdapt = command.autoScale != null ? command.autoScale : 0
    if (command.offset != null) {
      values.cutPartStartTimeMinutes = command.offset >= 60 ? Math.floor(command.offset / 60) : 0
      values.cutPartStartTimeSeconds = command.offset >= 60 ? +(command.offset % 60).toFixed(3) : command.offset
    }
    if (command.duration != null) {
      values.cutPartStartTimeDuration = command.duration
    }
  }
  return values
}

export function createStyleConfigFormState(initStyle?: ParsedResult, initSourceFormat?: SourceFormat | '') {
  const formValues = getFormInitValues(initStyle)
  // 源文件格式
  const sourceFormat = new FieldState<SourceFormat | ''>(initSourceFormat ?? formValues.sourceFormat)
  const nameSuffix = new FieldState<OutputFormat | ''>(formValues.styleNameSuffix)
  const name = new FieldState(formValues.styleNameInput).validators(v => styleNameValidator(v, nameSuffix.value))
  const coverType = new FieldState<CoverType>(formValues.coverType)
  // 封面格式
  const outputFormat = new FieldState<OutputFormat>(formValues.coverSuffix)

  const cutPicMinutes = new FieldState(formValues.cutPicMinutes)
    .disableValidationWhen(() => coverType.value === CoverType.Dynamic)
  const cutPicSeconds = new FieldState(formValues.cutPicSeconds)
    .disableValidationWhen(() => coverType.value === CoverType.Dynamic)

  // 片段截取
  // 开始时间
  const cutPartStartTimeMinutes = new FieldState(formValues.cutPartStartTimeMinutes)
    .disableValidationWhen(() => coverType.value === CoverType.Static)
  const cutPartStartTimeSeconds = new FieldState(formValues.cutPartStartTimeSeconds)
    .disableValidationWhen(() => coverType.value === CoverType.Static)
  // 截取长度
  const cutPartStartTimeDuration = new FieldState(formValues.cutPartStartTimeDuration)
    .disableValidationWhen(() => coverType.value === CoverType.Static)

  const coverScaleType = new FieldState(formValues.coverScaleType)
  const coverScaleWidth = new FieldState<number | null>(formValues.coverScaleWidth)
    .disableValidationWhen(() => coverScaleType.value === CoverScaleType.None)
  const coverScaleHeight = new FieldState<number | null>(formValues.coverScaleHeight)
    .disableValidationWhen(() => coverScaleType.value === CoverScaleType.None)

  // 用于记录当前正在输入宽度还是高度
  // 假如正在输入宽度，如果高度超过 2160 则高度通过校验，当前正在输入的"宽度"则不能超过 2160，反之亦然。
  let focusOn: 'scaleWidth' | 'scaleHeight' = 'scaleWidth'
  coverScaleWidth.validators(v => {
    if (!v || /[^0-9]/.test(v + '')) {
      return '请输入整数'
    }

    if (v < 20) return '不得小于 20 px'

    if (coverScaleType.value === CoverScaleType.ScaleWidthHeight) {
      if (focusOn === 'scaleWidth' && coverScaleHeight.value && coverScaleHeight.value > 2160 && v > 2160) {
        return '不得大于 2160 px'
      }
    }

    if (v > 3840) return '不得大于 3840 px'
  })

  coverScaleHeight.validators(v => {
    if (!v || /[^0-9]/.test(v + '')) {
      return '请输入整数'
    }

    if (v < 20) return '不得小于 20 px'

    if (coverScaleType.value === CoverScaleType.ScaleWidthHeight) {
      if (focusOn === 'scaleHeight' && coverScaleWidth.value && coverScaleWidth.value > 2160 && v > 2160) {
        return '不得大于 2160 px'
      }
    }

    if (v > 3840) return '不得大于 3840 px'
  })

  const scaleAutoAdapt = new FieldState<AutoScale>(formValues.scaleAutoAdapt)
    .disableValidationWhen(() => coverType.value === CoverType.Static)

  const formState = new FormState({
    name,
    nameSuffix,
    sourceFormat,
    coverType,
    outputFormat,
    cutPicMinutes,
    cutPicSeconds,
    coverScaleType,
    coverScaleWidth,
    coverScaleHeight,
    scaleAutoAdapt,
    cutPartStartTimeMinutes,
    cutPartStartTimeSeconds,
    cutPartStartTimeDuration
  })

  // 文件名后缀和封面格式保持一致
  const reaction1 = reaction(
    () => outputFormat.value,
    () => nameSuffix.onChange(outputFormat.value)
  )
  // eslint-disable-next-line dot-notation
  formState['addDisposer'](reaction1)

  // 封面类型变更后改变封面格式的默认值
  const reaction2 = reaction(
    () => coverType.value,
    () => {
      if (coverType.value === CoverType.Static) {
        outputFormat.onChange(OutputFormat.Jpg)
        return
      }

      outputFormat.onChange(OutputFormat.Gif)
    }
  )
  // eslint-disable-next-line dot-notation
  formState['addDisposer'](reaction2)

  // 封面缩放 变更后重置回缩放高宽的默认值
  const reaction3 = reaction(
    () => coverScaleType.value,
    () => {
      coverScaleWidth.reset()
      coverScaleHeight.reset()
    }
  )
  // eslint-disable-next-line dot-notation
  formState['addDisposer'](reaction3)

  // 缩放宽度和高度改变后相应的校验对方的值
  const reaction4 = reaction(
    () => coverScaleWidth.value,
    () => {
      focusOn = 'scaleWidth'
    }
  )
  const reaction5 = reaction(
    () => coverScaleHeight.value,
    () => {
      focusOn = 'scaleHeight'
    }
  )
  // eslint-disable-next-line dot-notation
  formState['addDisposer'](reaction4)
  // eslint-disable-next-line dot-notation
  formState['addDisposer'](reaction5)

  return formState
}

export type StyleConfigFormStateValues = {
  sourceFormat: SourceFormat | '',
  styleNameInput: string,
  styleNameSuffix: OutputFormat | '',
  coverType: CoverType,
  coverSuffix: OutputFormat,
  cutPicMinutes: number,
  cutPicSeconds: number,
  cutPartStartTimeMinutes: number,
  cutPartStartTimeSeconds: number,
  cutPartStartTimeDuration: number,
  coverScaleType: CoverScaleType,
  coverScaleWidth: number | null,
  coverScaleHeight: number | null,
  scaleAutoAdapt: AutoScale
}

export type StyleConfigFormStateType = ReturnType<typeof createStyleConfigFormState>
