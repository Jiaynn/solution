import { reaction, runInAction } from 'mobx'
import { FieldState, FormState } from 'formstate-x'

import { styleNameValidator } from '../../common/command'
import { SourceFormat, OutputFormat, sourceFormatList } from '../utils'
import { getFormInitValues, StyleConfigFormStateType } from './style-config-form'
import { ParsedResult } from './command'

type CreateBatchCreateChildFormStateOptions = {
  styleConfigFormState: StyleConfigFormStateType
  formState: ReturnType<typeof createBatchCreateFormState>
  initSourceFormat: '' | SourceFormat
  initName?: string
  initSuffix?: OutputFormat | ''
  isEditMode: boolean
  index: number
}

export function createBatchCreateChildFormState(options: CreateBatchCreateChildFormStateOptions) {
  const { styleConfigFormState, initSourceFormat, initName, initSuffix, index, formState } = options
  const sourceFormat = new FieldState(initSourceFormat).validators(v => {
    // 编辑模式允许源文件格式重复
    if (options.isEditMode) return
    if (v === styleConfigFormState.$.sourceFormat.value) {
      return '格式不可重复配置'
    }

    if (formState.$.find(field => field.$.sourceFormat !== sourceFormat && field.$.sourceFormat.value === v)) {
      return '格式不可重复配置'
    }
  })

  const nameInitValue = ((initName ?? styleConfigFormState.$.name.value) || '自定义命名') + (options.isEditMode ? '' : index)
  const initSuffixValue = initSuffix ?? styleConfigFormState.$.nameSuffix.value
  const nameSuffix = new FieldState(initSuffixValue)
  const name = new FieldState(nameInitValue).validators(v => styleNameValidator(v, nameSuffix.value))

  const reaction1 = reaction(
    () => styleConfigFormState.$.sourceFormat.value,
    value => {
      sourceFormat.onChange(sourceFormatList.filter(v => value !== v)[index])
    }
  )

  const reaction2 = reaction(
    () => styleConfigFormState.$.name.value,
    value => {
      formState.$.forEach((field, idx) => field.$.name.onChange(value + idx))
    }
  )

  const reaction3 = reaction(
    () => styleConfigFormState.$.nameSuffix.value,
    value => {
      formState.$.forEach(field => field.$.nameSuffix.onChange(value))
    }
  )

  const state = new FormState({
    name,
    nameSuffix,
    sourceFormat,
    index: new FieldState(index)
  })

  // eslint-disable-next-line dot-notation
  state['addDisposer'](reaction1)

  // eslint-disable-next-line dot-notation
  state['addDisposer'](reaction2)

  // eslint-disable-next-line dot-notation
  state['addDisposer'](reaction3)

  return state
}

export function createBatchCreateFormState(
  styleConfigFormState: StyleConfigFormStateType,
  isEditMode: boolean,
  initStyles: ParsedResult[]
) {
  const formState = new FormState<Array<ReturnType<typeof createBatchCreateChildFormState>>>([])
  // 当源文件为所有格式，则不创建批量编辑项
  if (styleConfigFormState.$.sourceFormat.value === '') return formState

  const initFormValuesSet = initStyles.map(getFormInitValues)
  let restSourceFormats = [...sourceFormatList]
  // 根据初始化数据创建
  initFormValuesSet.forEach((values, index) => {
    const state = createBatchCreateChildFormState({
      styleConfigFormState,
      initSourceFormat: values.sourceFormat,
      initName: values.styleNameInput,
      initSuffix: values.styleNameSuffix,
      index,
      isEditMode,
      formState
    })
    runInAction(() => formState.$.push(state))
    restSourceFormats = restSourceFormats.filter(suffix => suffix === values.sourceFormat)
  })
  // 新建模式下填充未生成的格式
  if (!isEditMode) {
    restSourceFormats
      .filter(v => v !== styleConfigFormState.$.sourceFormat.value)
      .map((suffix, index) => createBatchCreateChildFormState({
        styleConfigFormState,
        initSourceFormat: suffix,
        index,
        isEditMode,
        formState
      }))
      .forEach(state => {
        runInAction(() => formState.$.push(state))
      })
  }
  return formState
}

export type BatchCreateFormStateType = ReturnType<typeof createBatchCreateFormState>
export type BatchCreateChildFormStateType = ReturnType<typeof createBatchCreateChildFormState>
