/**
 * @file batch create component
 * @author yinxulai <yinxulai@qiniu.com>
 */

import * as React from 'react'
import { reaction, runInAction } from 'mobx'
import { observer } from 'mobx-react'

import { FieldState, FormState } from 'formstate-x'

import { styleNameValidator } from '../../../common/command'
import BaseBatchCreateForm from '../../../common/BatchCreateForm'
import { BaseFormStateType } from '../BaseOptions'
import { sourceFormatList } from '../../constants'

type BatchCreateValue = {
  index: number
  name: string
  nameSuffix: string
  sourceFormat: string
}

type BatchFormItemState = FormState<{
  [key in keyof BatchCreateValue]: FieldState<BatchCreateValue[key]>
}>

function createBatchFormItemState(
  index: number,
  batchFormState: FormState<BatchFormItemState[]>,
  baseFormState: BaseFormStateType,
  initialValue?: Partial<BatchCreateValue>,
  isEditMode = false
): BatchFormItemState {
  const {
    name: baseName,
    nameSuffix: baseNameSuffix,
    outputFormat: baseOutputFormat
  } = baseFormState.$

  const defaultName = (baseName.value || '自定义命名') + index
  const name = new FieldState<string>(initialValue?.name || defaultName)
  const nameSuffix = new FieldState<string>(initialValue?.nameSuffix || '')
  const sourceFormat = new FieldState<string>(initialValue?.sourceFormat || '')

  // 格式校验
  name
    .disableValidationWhen(() => isEditMode)
    .validators(v => styleNameValidator(v, nameSuffix.value))

  sourceFormat
    .disableValidationWhen(() => isEditMode)
    .validators(value => {
      if (!value) return '源文件格式不能为空'
      if (value === baseFormState.value.sourceFormat) {
        return '格式不可重复配置'
      }

      const batchValue = batchFormState.value
      return batchValue.some(item => item.name !== name.value && value === item.sourceFormat)
        && '格式不可重复配置'
    })

  // 业务关系
  const reactionDispose = reaction(
    () => [
      sourceFormat.value,
      baseNameSuffix.value,
      baseOutputFormat.value
    ],
    ([sourceFormatValue, baseNameSuffixValue, baseOutputFormatValue]) => {
      if (isEditMode) return

      // 只要 base 是无后缀
      // 就设置 nameSuffix 为无后缀
      if (!baseNameSuffixValue) {
        nameSuffix.onChange('')
        return
      }

      // 如果输出格式切换为具体格式
      // 则设置后缀与其保持相同
      if (baseOutputFormatValue) {
        nameSuffix.onChange(baseOutputFormatValue)
        return
      }

      // 当源文件格式 = 所有格式
      // 且输出格式是与源文件一致时
      // 后缀只能是不带后缀，即为空
      if (!sourceFormatValue && !baseOutputFormatValue) {
        nameSuffix.onChange('')
        return
      }

      // 输出格式是与原图一致时
      // 后缀与源文件格式保持一致
      if (!baseOutputFormatValue) {
        nameSuffix.onChange(sourceFormatValue)
      }
    }, { fireImmediately: true }
  )

  // 当用户更新 base 的 name
  // 强制覆盖批量创建的 name
  const reactionDispose2 = reaction(
    () => [baseName.value],
    ([nameValue]) => {
      if (!nameValue) return name.onChange('')
      name.onChange(nameValue + String(index))
    }
  )

  const combinedFormState = new FormState({
    index: new FieldState(index),
    name,
    nameSuffix,
    sourceFormat
  })

  // eslint-disable-next-line dot-notation
  combinedFormState['addDisposer'](reactionDispose)
  // eslint-disable-next-line dot-notation
  combinedFormState['addDisposer'](reactionDispose2)

  return combinedFormState
}

export function createBatchFormState(
  baseFormState: BaseFormStateType,
  initialValue: Array<Partial<BatchCreateValue>> = [],
  isEditMode = false
) {
  const formState = new FormState<BatchFormItemState[]>([])
  const formStateList: BatchFormItemState[] = initialValue.map((item, index) => (
    createBatchFormItemState(index, formState, baseFormState, item, isEditMode)
  ))
  runInAction(() => formState.$.push(...formStateList))
  return formState
}

export interface Props {
  isEditMode: boolean
  baseFormState: BaseFormStateType
  formState: ReturnType<typeof createBatchFormState>
}

export const BatchCreate = observer(function BatchCreate(props: Props) {
  const { isEditMode, formState, baseFormState } = props

  // 创建新的项
  const handleCreateNew = () => {
    const availableSuffixes = sourceFormatList.filter(
      v => v !== baseFormState.value.sourceFormat
        && formState.$.find(field => field.$.sourceFormat.value === v) == null
    )

    const index = formState.value.length > 0
      ? Math.max(...formState.value.map(i => i.index)) + 1
      : 0

    runInAction(() => formState.$.push(
      createBatchFormItemState(
        index,
        formState,
        baseFormState,
        { sourceFormat: availableSuffixes[0] }
      )
    ))
  }

  return (
    <BaseBatchCreateForm
      state={formState}
      disabled={isEditMode}
      onAddNew={handleCreateNew}
      sourceFormatList={sourceFormatList}
      title={`批量${isEditMode ? '修改' : '创建'}`}
      sourceFormat={baseFormState.$.sourceFormat.$}
      description={isEditMode ? '复用以上配置对类似的样式进行快速的批量修改。' : '复用以上配置批量创建多种格式文件的样式。'}
    />
  )
})
